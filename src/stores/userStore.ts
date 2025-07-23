import { getMe, getUser, initializeUserPosition, updateUser } from "@/actions/user"
import { fetchWorldCellsInArea } from "@/actions/worldCell"
import { createAndAddObjectToInventory } from "@/actions/object"
import { Prisma } from "@/app/generated/prisma"
import { ExtendedUser, Loot, WorldCell } from "@/lib/types"
import { createJSONStorage, persist } from "zustand/middleware"
import { create } from "zustand"
import { useJournalStore } from "./journalEntryStore"

interface UserState {
  user: ExtendedUser | null
  userWorldCell: WorldCell | null
  surroundingCells: {
    north?: WorldCell
    south?: WorldCell
    east?: WorldCell
    west?: WorldCell
  }
  inventory: Loot[]
  loading: boolean
  error: string | null

  setUser: (user: ExtendedUser | null) => void
  setUserWorldCell: (worldCell: WorldCell) => void
  setSurroundingCells: (surroundingCells: {
    north?: WorldCell
    south?: WorldCell
    east?: WorldCell
    west?: WorldCell
  }) => void
  setInventory: (inventory: Loot[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  getUser: (id: Prisma.UserWhereUniqueInput) => Promise<void>
  updateUser: (id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput) => Promise<void>
  getMe: () => Promise<void>
  moveUser: (direction: string, worldCell?: Partial<WorldCell>) => Promise<void>
  updateSurroundingCells: () => Promise<void>
  addObjectToInventory: (objectData: { name: string; description: string }) => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      userWorldCell: null,
      surroundingCells: {},
      inventory: [],
      loading: false,
      error: null,

      setUser: (user) => set({ user }),
      setUserWorldCell: (worldCell: WorldCell) => set({ userWorldCell: worldCell }),
      setSurroundingCells: (surroundingCells) => set({ surroundingCells }),
      setInventory: (inventory: Loot[]) => set({ inventory: inventory }),
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

          await get().updateSurroundingCells()
          set({ userWorldCell: user?.worldCell })
          set({ inventory: user?.inventory || [] })
        } catch (error) {
          set({ error: error as string })
        }
      },

      getMe: async () => {
        try {
          set({ loading: true, error: null })
          console.log("🔄 Fetching user data...")
          
          const user = await getMe()
          set({ user })

          if (!user) return

          // TODO checkfirst if it is needed to update the surrounding cells
          if (user?.worldCell) {
            await get().updateSurroundingCells()
            set({ userWorldCell: user?.worldCell })
            set({ inventory: user?.inventory || [] })

            useJournalStore.getState().refreshJournal(user.id)
          }

          if (!user?.worldCell) {
            await initializeUserPosition(user.id)
            await useJournalStore.getState().refreshJournal(user.id)
          }
          
          console.log("✅ User data fetched successfully")
        } catch (error) {
          console.error("❌ Error fetching user data:", error)
          set({ error: error as string })
        } finally {
          set({ loading: false })
        }
      },

      updateSurroundingCells: async () => {
        const { user } = get()

        if (!user?.worldCell) {
          console.log("📍 No user position, skipping surrounding cells update")
          return
        }

        try {
          console.log(`🔍 Fetching surrounding cells for position (${user.worldCell.x}, ${user.worldCell.y})`)

          // Récupère une zone 3x3 autour du joueur
          const allCells = await fetchWorldCellsInArea(
            user.worldCell.x - 1, // minX
            user.worldCell.x + 1, // maxX  
            user.worldCell.y - 1, // minY
            user.worldCell.y + 1  // maxY
          )

          // 🧭 Assigne chaque cellule à sa direction cardinale
          const surroundingCells: {
            north?: WorldCell
            south?: WorldCell
            east?: WorldCell
            west?: WorldCell
          } = {}

          const userX = user.worldCell.x
          const userY = user.worldCell.y

          allCells.forEach(cell => {
            // Skip la cellule actuelle du joueur
            if (cell.x === userX && cell.y === userY) return

            // Assigne selon la direction cardinale
            if (cell.x === userX && cell.y === userY + 1) {
              surroundingCells.north = cell
            } else if (cell.x === userX && cell.y === userY - 1) {
              surroundingCells.south = cell
            } else if (cell.x === userX + 1 && cell.y === userY) {
              surroundingCells.east = cell
            } else if (cell.x === userX - 1 && cell.y === userY) {
              surroundingCells.west = cell
            }
            // Ignore les diagonales
          })

          set({ surroundingCells })
          console.log(`✅ Updated surrounding cells:`, {
            north: surroundingCells.north?.title || 'empty',
            south: surroundingCells.south?.title || 'empty',
            east: surroundingCells.east?.title || 'empty',
            west: surroundingCells.west?.title || 'empty'
          })

        } catch (error) {
          console.error("❌ Error updating surrounding cells:", error)
          set({ error: error as string })
        }
      },

      moveUser: async (direction: string) => {
        const { user } = get()

        if (!user || !user.worldCell) {
          console.error("❌ User or world cell not found")
          return
        }

        let newX = user.worldCell.x
        let newY = user.worldCell.y

        if (direction === 'north') newY++
        if (direction === 'south') newY--
        if (direction === 'east') newX++
        if (direction === 'west') newX--

        await get().updateUser({ id: user.id }, {
          worldCell: { connect: { x_y: { x: newX, y: newY } } }
        })
      },

      addObjectToInventory: async (objectData: { name: string; description: string }) => {
        const { user } = get()

        if (!user?.id) {
          console.error("❌ No user found for inventory operation")
          set({ error: "No user found" })
          return
        }

        try {
          console.log('🎒 Adding object to inventory:', objectData.name)

          const updatedUser = await createAndAddObjectToInventory(user.id, objectData)

          if (updatedUser) {
            set({
              user: updatedUser,
              inventory: updatedUser.inventory || []
            })
            console.log('✅ Loot added to inventory and user updated')
          } else {
            throw new Error('Failed to add object to inventory')
          }

        } catch (error) {
          console.error('❌ Error adding object to inventory:', error)
          set({ error: error as string })
        }
      },
    }),

    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage)
    }
  )
)
