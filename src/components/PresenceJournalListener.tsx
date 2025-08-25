"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@/contexts/UserContext"
import { useJournal } from "@/contexts/JournalContext"
import { createJournalEntry } from "@/actions/journalEntry"
import { JournalEntryType } from "@prisma/client"

type PresenceEvent = {
  type: "user_entered" | "user_left"
  worldCellId: string
  userId: string
  at: string
}

export default function PresenceJournalListener() {
  const { user } = useUser()
  const { addJournalEntry } = useJournal()
  const seen = useRef<Set<string>>(new Set())

  // ask permission once
  useEffect(() => {
    if (typeof window === "undefined") return
    if (!("Notification" in window)) return
    if (Notification.permission === "default") {
      Notification.requestPermission().then(p => {
        console.log("🔔 notification permission", p)
      })
    }
  }, [])

  useEffect(() => {
    const worldCellId = user?.worldCell?.id
    const myUserId = user?.id
    if (!worldCellId || !myUserId) return

    const es = new EventSource(`/api/presence/stream/${worldCellId}`)
    console.log("🔌 subscribing presence stream", { worldCellId })

    es.onmessage = async msg => {
      try {
        const e = JSON.parse(msg.data) as PresenceEvent | { type: "connected", worldCellId: string }
        if ((e as any).type === "connected") {
          console.log("🔌 presence connected", e)
          return
        }

        const pe = e as PresenceEvent
        if ((pe.type === "user_entered" || pe.type === "user_left") && pe.userId !== myUserId) {
          const key = `${pe.worldCellId}:${pe.userId}:${pe.type}:${pe.at}`
          if (seen.current.has(key)) return
          seen.current.add(key)

          const content =
            pe.type === "user_entered"
              ? "Un joueur est entré dans votre cellule."
              : "Un joueur a quitté votre cellule."

          console.log(`🪶 journal presence ${pe.type}`, pe)

          // 1) persist in DB and push to local state
          const entry = await createJournalEntry(myUserId, content, JournalEntryType.SYSTEM)
          addJournalEntry(entry)

          // 2) browser notification (not UI toast)
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification("Notification de présence", { body: content })
          }
        }
      } catch (err) {
        console.log("⚠️ failed to handle presence message", err)
      }
    }

    es.onerror = err => {
      console.log("⚠️ presence stream error", err)
    }

    return () => es.close()
  }, [user?.worldCell?.id, user?.id, addJournalEntry])

  return null
}
