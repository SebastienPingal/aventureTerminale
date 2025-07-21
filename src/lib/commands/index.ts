import { WorldCell } from "@/app/generated/prisma"
import { useUserStore } from "@/stores/userStore"
import { useWorldCellStore } from "@/stores/worldCellStore"

export async function executeCommand(action: string, worldCell?: Partial<WorldCell>): Promise<void> {
  const userStore = useUserStore.getState()
  const worldCellStore = useWorldCellStore.getState()
  const { user } = userStore
  const { moveUser } = userStore

  if (action === 'move_north') {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newY = user.worldCell.y + 1

      // Use the store's createNewWorldCell method
      await worldCellStore.createNewWorldCell(
        user.worldCell.x,
        newY,
        worldCell?.mapCharacter || ".",
        worldCell?.title || "Unknown",
        worldCell?.description || "A mysterious place"
      )

      await moveUser('north')
      console.log('🏜️ User moved north')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }
  }

  if (action === 'move_south') {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newY = user.worldCell.y - 1
      await worldCellStore.createNewWorldCell(
        user.worldCell.x,
        newY,
        worldCell?.mapCharacter || ".",
        worldCell?.title || "Unknown",
        worldCell?.description || "A mysterious place"
      )

      await moveUser('south')
      console.log('🏜️ User moved south')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }
  }

  if (action === 'move_east') {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newX = user.worldCell.x + 1
      await worldCellStore.createNewWorldCell(
        newX,
        user.worldCell.y,
        worldCell?.mapCharacter || ".",
        worldCell?.title || "Unknown",
        worldCell?.description || "A mysterious place"
      )

      await moveUser('east')
      console.log('🏜️ User moved east')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }
  }

  if (action === 'move_west') {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newX = user.worldCell.x - 1
      await worldCellStore.createNewWorldCell(
        newX,
        user.worldCell.y,
        worldCell?.mapCharacter || ".",
        worldCell?.title || "Unknown",
        worldCell?.description || "A mysterious place"
      )

      await moveUser('west')
      console.log('🏜️ User moved west')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }
  }
} 