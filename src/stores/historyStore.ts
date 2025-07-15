import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"
import { useUserStore } from "./userStore"

export interface JournalEntry {
  type: 'command' | 'response' | 'system'
  content: string
}

interface HistoryState {
  history: JournalEntry[]
  needsNickname: boolean
  addEntry: (entry: JournalEntry) => void
  setNeedsNickname: (needs: boolean) => void
  checkUserStatus: () => void
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

const nicknamePrompt: JournalEntry = {
  type: 'system',
  content: 'Qui êtes vous ?'
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      needsNickname: false,
      addEntry: (entry) => set((state) => ({ history: [...state.history, entry] })),
      setNeedsNickname: (needs) => set({ needsNickname: needs }),

      checkUserStatus: () => {
        const userStore = useUserStore.getState()
        const user = userStore.user

        if (user && !user.nickname) {
          const currentHistory = get().history
          const hasNicknamePrompt = currentHistory.some(entry =>
            entry.type === 'system' && entry.content.includes('nickname')
          )

          if (!hasNicknamePrompt) {
            console.log("👤 User needs to set nickname")
            set({ needsNickname: true })
            get().addEntry(nicknamePrompt)
          }
        }
      }
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
