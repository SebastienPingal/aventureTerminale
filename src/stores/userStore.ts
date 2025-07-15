import { getUser, updateUser } from "@/actions/user"
import { Prisma, User } from "@/app/generated/prisma"
import { create } from "zustand"

interface UserState {
  user: User | null
  loading: boolean
  error: string | null

  setUser: (user: User) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  getUser: (id: Prisma.UserWhereUniqueInput) => Promise<void>
  updateUser: (id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) => Promise<void>
}

export const useUserStore = create<UserState>((set) => ({
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
}))