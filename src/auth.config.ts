import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Discord from "next-auth/providers/discord" 
import Github from "next-auth/providers/github"

// Lightweight config for middleware (no database adapter)
export const authConfig = {
  providers: [Google, Discord, Github],
  
  callbacks: {
    authorized: async ({ auth }) => {
      // Simple auth check without database queries
      return !!auth
    },
  },
  
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig 