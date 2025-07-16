import { getMe, getUser, updateUser } from "@/actions/user"
import { Prisma } from "@/app/generated/prisma"
import { ExtendedUser, WorldCell } from "@/lib/types"
import { createJSONStorage, persist } from "zustand/middleware"
import { create } from "zustand"

interface UserState {
  user: ExtendedUser | null
  loading: boolean
  error: string | null

  setUser: (user: ExtendedUser | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  getUser: (id: Prisma.UserWhereUniqueInput) => Promise<void>
  updateUser: (id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) => Promise<void>
  getMe: () => Promise<void>
  moveUser: (direction: string, worldCell?: Partial<WorldCell>) => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getUser: async (id: Prisma.UserWhereUniqueInput) => {
        try {
          const user = await getUser(id)
          set({ user })

        } catch (error) {
          set({ error: error as string })
        }
      },

      updateUser: async (id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) => {
        try {
          const user = await updateUser(id, data)
          set({ user })
        } catch (error) {
          set({ error: error as string })
        }
      },

      getMe: async () => {
        const user = await getMe()
        set({ user })
      },

      moveUser: async (direction: string) => {
        const { user } = useUserStore.getState()

        if (!user || !user.worldCell) {
          console.error("User or world cell not found")
          return
        }

        let newX = user.worldCell.x
        let newY = user.worldCell.y

        if (direction === 'north') newY++
        if (direction === 'south') newY--
        if (direction === 'east') newX++
        if (direction === 'west') newX--

        updateUser({ id: user.id }, { worldCell: { connect: { x_y: { x: newX, y: newY } } } })

      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
