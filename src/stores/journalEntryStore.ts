import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { JournalEntry } from "@/lib/types"
import { getUserJournalEntries } from "@/actions/journalEntry"

interface JournalState {
  journal: JournalEntry[]
  
  setJournal: (journal: JournalEntry[]) => void
  addJournalEntry: (entry: JournalEntry) => void
  refreshJournal: (userId: string) => Promise<void>
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      journal: [],

      setJournal: (journal: JournalEntry[]) => set({ journal }),
      
      addJournalEntry: (entry: JournalEntry) => {
        const currentJournal = get().journal
        set({ journal: [...currentJournal, entry] })
      },

      refreshJournal: async (userId: string) => {
        try {
          const journalEntries = await getUserJournalEntries(userId)
          set({ journal: journalEntries })
        } catch (error) {
          console.error("📖 Failed to refresh journal:", error)
        }
      }
    }),

    {
      name: "journal-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.journal.length === 0) {
          console.log("📖 Adding initial history entries for new user")
          state.journal = []
        }
      }
    }
  )
)
