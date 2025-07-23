"use client"

import { SessionProvider, useSession } from "next-auth/react"
import { ReactNode, useEffect, useRef } from "react"
import { useUserStore } from "@/stores/userStore"

interface AuthSessionProviderProps {
  children: ReactNode
}

// Internal component that handles the getMe logic
function UserSessionManager({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const { getMe, user, setUser, loading } = useUserStore()
  const lastSessionId = useRef<string | null>(null)

  useEffect(() => {
    console.log("🔐 Session status changed:", status)

    if (status === "authenticated" && session?.user?.id) {
      const currentSessionId = session.user.id

      // Always fetch fresh user data on authentication, but prevent duplicate calls
      if (!loading && (lastSessionId.current !== currentSessionId || !user)) {
        console.log("👤 User authenticated, fetching fresh user data...")
        lastSessionId.current = currentSessionId
        getMe()
      }
    } else if (status === "unauthenticated") {
      console.log("🚪 User logged out, clearing user data...")
      lastSessionId.current = null
      setUser(null)
    }
  }, [status, session?.user?.id, loading, user])

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