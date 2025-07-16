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
    
    // Add this callback to map JWT token to session
    session: async ({ session, token }) => {
      if (token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    
    // Add this callback to ensure user ID is in the JWT token
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id
      }
      return token
    },
  },
  
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig 