"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (
    email: string,
    password: string,
    callbackUrl?: string,
  ) => Promise<{ error?: string }>;
  loginGoogle: (callbackUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        name: session.user.name ?? "",
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        phone: session.user.phone,
        image: session.user.image ?? undefined,
        role: session.user.role,
        createdAt: "",
      }
    : null;

  async function login(
    email: string,
    password: string,
    callbackUrl = "/account",
  ) {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });
    if (res?.error) return { error: "Invalid email or password" };
    if (res?.url) window.location.href = callbackUrl;
    return {};
  }

  async function loginGoogle(callbackUrl = "/account") {
    await signIn("google", { callbackUrl });
  }

  async function logout() {
    await signOut({ callbackUrl: "/" });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: status === "loading",
        isLoggedIn: status === "authenticated",
        login,
        loginGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
