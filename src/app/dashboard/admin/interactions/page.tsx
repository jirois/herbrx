import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { redirect }         from 'next/navigation'
import { InteractionGapsPage } from '@/components/dashboard/admin/interaction-gaps'

export const metadata = { title: 'Interaction Engine Admin — HerbRx' }

export default async function Page() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  if ((session.user as { role?: string })?.role !== 'ADMIN') redirect('/dashboard')
  return <InteractionGapsPage />
}
