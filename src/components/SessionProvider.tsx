"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { ReactNode, useEffect } from "react"
import { useUserStore } from "@/stores/userStore"

interface AuthSessionProviderProps {
  children: ReactNode
}

// Internal component that handles the getMe logic
function UserSessionManager({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const { getMe, user, setUser } = useUserStore()

  useEffect(() => {
    console.log("🔐 Session status changed:", status)

    if (status === "authenticated" && session?.user && !user) {
      console.log("👤 User authenticated, fetching user data...")
      getMe()
    } else if (status === "unauthenticated") {
      console.log("🚪 User logged out, clearing user data...")
      setUser(null)
    }
  }, [status, session?.user, user, getMe, setUser])

  return <>{children}</>
}

export function AuthSessionProvider({ children }: AuthSessionProviderProps) {
  return (
    <SessionProvider>
      <UserSessionManager>
        {children}
      </UserSessionManager>
    </SessionProvider>
  )
}