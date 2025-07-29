import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"
import { initializeUserPosition } from "./actions/user"

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma), // ✅ Re-enable the adapter
  session: { strategy: "jwt" },
  ...authConfig,
  
  // ✅ Uncomment and improve the createUser event
  events: {
    createUser: async ({ user }) => {
      console.log(`🎯 New user created: ${user.id}`)
      
      // Add a small delay to ensure user is fully created
      setTimeout(async () => {
        try {
          if (user.id) {
            console.log(`🎲 Initializing position for user: ${user.id}`)
            await initializeUserPosition(user.id)
            console.log(`✅ Successfully initialized position for user: ${user.id}`)
          }
        } catch (error) {
          console.error(`❌ Failed to initialize position for new user ${user.id}:`, error)
          
          // Optional: Add fallback initialization to getMe() function
          console.log(`⚠️ Will attempt initialization on first login`)
        }
      }, 1000)
    }
  }
})