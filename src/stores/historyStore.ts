import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

export interface JournalEntry {
  type: 'prompt' | 'response' | 'system' | 'error'
  content: string
  action?: string  // Track what action was taken
  timestamp?: number  // Optional timestamp for debugging
}

interface HistoryState {
  history: JournalEntry[]
  addEntry: (entry: JournalEntry) => void
}

// Initial history entries for new users
const initialHistory: JournalEntry[] = [
  {
    type: 'response',
    content: `
:::    ::: ::::    :::      :::::::::  :::::::::: ::::::::  :::::::::: ::::::::: ::::::::::: 
:+:    :+: :+:+:   :+:      :+:    :+: :+:       :+:    :+: :+:        :+:    :+:    :+:     
+:+    +:+ :+:+:+  +:+      +:+    +:+ +:+       +:+        +:+        +:+    +:+    +:+     
+#+    +:+ +#+ +:+ +#+      +#+    +:+ +#++:++#  +#++:++#++ +#++:++#   +#++:++#:     +#+     
+#+    +#+ +#+  +#+#+#      +#+    +#+ +#+              +#+ +#+        +#+    +#+    +#+     
#+#    #+# #+#   #+#+#      #+#    #+# #+#       #+#    #+# #+#        #+#    #+#    #+#     
 ########  ###    ####      #########  ########## ########  ########## ###    ###    ###     
  `
  },
  {
    type: 'response',
    content: 'Vous pouvez explorer le monde en tapant "look" ou "move [direction]".'
  }
]

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addEntry: (entry) => set((state) => ({ history: [...state.history, entry] })),
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
