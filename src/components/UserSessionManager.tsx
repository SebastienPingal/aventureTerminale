"use client"

import { useSession } from "next-auth/react"
import { ReactNode, useEffect, useRef } from "react"
import { useUser } from "@/contexts/UserContext"
import { useJournal } from "@/contexts/JournalContext"

interface UserSessionManagerProps {
  children: ReactNode
}

export function UserSessionManager({ children }: UserSessionManagerProps) {
  const { data: session, status } = useSession()
  const { getMe, user, setUser, loading } = useUser()
  const { refreshJournal } = useJournal()
  const lastSessionId = useRef<string | null>(null)
  const isInitialized = useRef(false)

  useEffect(() => {
    console.log("🔐 Session status changed:", status)

    if (status === "authenticated" && session?.user?.id) {
      const currentSessionId = session.user.id

      // Only fetch if we haven't initialized or session changed
      if (!isInitialized.current || lastSessionId.current !== currentSessionId) {
        console.log("👤 User authenticated, fetching fresh user data...")
        lastSessionId.current = currentSessionId
        isInitialized.current = true
        getMe()
      }
    } else if (status === "unauthenticated") {
      console.log("🚪 User logged out, clearing user data...")
      lastSessionId.current = null
      isInitialized.current = false
      setUser(null)
    }
  }, [status, session?.user?.id, getMe, setUser])

  // 📖 Refresh journal when user data is available (only once per user)
  const lastUserId = useRef<string | null>(null)
  useEffect(() => {
    if (user?.id && lastUserId.current !== user.id) {
      lastUserId.current = user.id
      refreshJournal(user.id)
    }
  }, [user?.id, refreshJournal])

  return <>{children}</>
} 