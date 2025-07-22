import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"
import { initializeUserPosition } from "./actions/user"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
  
  // ✅ Add the database-dependent events here instead
  events: {
    createUser: async ({ user }) => {
      console.log(`🎯 New user created: ${user.id}`)
      try {
        if (user.id) {
          await initializeUserPosition(user.id)
        }
      } catch (error) {
        console.error(`❌ Failed to initialize position for new user ${user.id}:`, error)
      }
    }
  }
})