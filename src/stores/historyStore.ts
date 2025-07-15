import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface JournalEntry {
  type: 'command' | 'response'
  content: string
}

interface HistoryState {
  history: JournalEntry[]
  addEntry: (entry: JournalEntry) => void
}

// Initial history entries for new users
const initialHistory: JournalEntry[] = [
  {
    type: 'response',
    content: 'Welcome to Adventure Terminal! Type "help" to see available commands.'
  },
  {
    type: 'response',
    content: 'You can explore the world by typing "look" or "move [direction]".'
  }
]

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addEntry: (entry) => set((state) => ({ history: [...state.history, entry] }))
    }),
    {
      name: "history-storage",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (state && state.history.length === 0) {
          console.log("📖 Adding initial history entries for new user")
          state.history = initialHistory
        }
      }
    }
  )
)
