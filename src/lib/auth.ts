import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider       from 'next-auth/providers/google'
import bcrypt               from 'bcryptjs'
import { prisma }           from './prisma'

type AuthUser = {
  id?: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: string
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      profile(profile) {
        return {
          id:            profile.sub,
          email:         profile.email,
          name:          profile.name,
          image:         profile.picture,
          firstName:     profile.given_name  ?? '',
          lastName:      profile.family_name ?? '',
          emailVerified: true,
         
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label:'Email',    type:'email'    },
        password: { label:'Password', type:'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

       let user
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase().trim() },
          })
        } catch (err) {
          // Surface DB/connection failures in logs instead of letting them
          // manifest as a silent, unexplained "wrong email or password".
          console.error('[Auth] DB error during sign-in:', err)
          throw new Error('We could not reach the database right now. Please try again in a moment.')
        }
        if (!user) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        if (!user.emailVerified) {
          // Signal to the client that verification is needed
          throw new Error('EMAIL_NOT_VERIFIED:' + user.id)
        }

        return {
          id:        user.id,
          email:     user.email,
          name:      `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName:  user.lastName,
          phone:     user.phone ?? undefined,
          image:     user.image ?? undefined,
          role:      user.role,
        }
      },
    }),
  ],

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  callbacks: {
    async signIn({ user, account }) {
      // Handle Google sign-in: upsert user in DB
      if (account?.provider === 'google') {
        const authUser = user as AuthUser
        const existing = await prisma.user.findUnique({ where: { email: user.email! } })
        if (!existing) {
          const newUser = await prisma.user.create({
            data: {
              email:         user.email!,
              firstName:     authUser.firstName ?? user.name?.split(' ')[0] ?? '',
              lastName:      authUser.lastName  ?? user.name?.split(' ')[1] ?? '',
              passwordHash:  '',         // no password for OAuth users
              emailVerified: true,
              image:         user.image ?? undefined,
              role: 'CUSTOMER'
            },
          })
          authUser.id   = newUser.id
          authUser.role = newUser.role
        }  else {
          if (!existing.emailVerified) {
            await prisma.user.update({ where:{ id: existing.id }, data:{ emailVerified: true } })
          }
          authUser.id        = existing.id
          authUser.role      = existing.role
          authUser.firstName = existing.firstName
          authUser.lastName  = existing.lastName
        }
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        const authUser = user as AuthUser
        token.id        = authUser.id ?? token.id
        token.firstName = authUser.firstName ?? ''
        token.lastName  = authUser.lastName  ?? ''
        token.phone     = authUser.phone
        token.role      = authUser.role ?? 'CUSTOMER'
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id        = token.id
        session.user.firstName = token.firstName
        session.user.lastName  = token.lastName
        session.user.phone     = token.phone
        session.user.role      = token.role
      }
      return session
    },
  },

  pages: { signIn:'/login', signOut:'/', error:'/login' },

  secret: process.env.NEXTAUTH_SECRET ?? 'herbrx-dev-secret-change-in-production',
  debug:  process.env.NODE_ENV === 'development',
}

// ── Type augmentation ─────────────────────────────────────────────────────
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      firstName: string
      lastName: string
      phone?: string
      role: string
    } & {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string; firstName: string; lastName: string; phone?: string; role: string
  }
}

