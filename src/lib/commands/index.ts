import { PromptResponse } from "@/actions/promptProcessor"
import { createUserTrace } from "@/actions/traces";
import { ExtendedUser, WorldCell } from "@/lib/types"

export async function executeCommand(
  aiResponse: PromptResponse,
  user: ExtendedUser | null,
  moveUser: (direction: string) => Promise<void>,
  addObjectToInventory: (objectData: { name: string; description: string }) => Promise<void>,
  createNewWorldCell: (x: number, y: number, mapCharacter: string, title: string, description: string) => Promise<WorldCell | null>
): Promise<void> {
  if (aiResponse.actions?.includes('move_north')) {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newY = user.worldCell.y + 1

      // Use the createNewWorldCell method
      await createNewWorldCell(
        user.worldCell.x,
        newY,
        aiResponse.newWorldCell?.mapCharacter || ".",
        aiResponse.newWorldCell?.title || "Unknown",
        aiResponse.newWorldCell?.description || "A mysterious place"
      )

      await moveUser('north')
      console.log('🏜️ User moved north')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }

  } else if (aiResponse.actions?.includes('move_south')) {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newY = user.worldCell.y - 1
      await createNewWorldCell(
        user.worldCell.x,
        newY,
        aiResponse.newWorldCell?.mapCharacter || ".",
        aiResponse.newWorldCell?.title || "Unknown",
        aiResponse.newWorldCell?.description || "A mysterious place"
      )

      await moveUser('south')
      console.log('🏜️ User moved south')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }

  } else if (aiResponse.actions?.includes('move_east')) {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newX = user.worldCell.x + 1
      await createNewWorldCell(
        newX,
        user.worldCell.y,
        aiResponse.newWorldCell?.mapCharacter || ".",
        aiResponse.newWorldCell?.title || "Unknown",
        aiResponse.newWorldCell?.description || "A mysterious place"
      )

      await moveUser('east')
      console.log('🏜️ User moved east')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }
  } else if (aiResponse.actions?.includes('move_west')) {
    try {
      if (!user?.worldCell) {
        throw new Error('User has no world cell')
      }

      const newX = user.worldCell.x - 1
      await createNewWorldCell(
        newX,
        user.worldCell.y,
        aiResponse.newWorldCell?.mapCharacter || ".",
        aiResponse.newWorldCell?.title || "Unknown",
        aiResponse.newWorldCell?.description || "A mysterious place"
      )

      await moveUser('west')
      console.log('🏜️ User moved west')

    } catch (error) {
      console.error('❌ Error generating world cell:', error)
    }
  }

  // ✅ IMPROVED: Properly add objects to inventory
  if (aiResponse.newObject) {
    console.log('🎒 Processing new object from AI:', aiResponse.newObject)

    await addObjectToInventory({
      name: aiResponse.newObject.name || "",
      description: aiResponse.newObject.description || ""
    })

    console.log('✅ Loot successfully added to inventory via proper workflow')
  }

  if (aiResponse.newTrace) {
    console.log('🎒 Processing new trace from AI:', aiResponse.newTrace)

    await createUserTrace(
      user?.id || "",
      user?.worldCell?.id || "",
      aiResponse.newTrace.type,
      aiResponse.newTrace.description || ""
    )
  }
}