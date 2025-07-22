"use server"

import prisma from "@/lib/prisma"
import { ExtendedUser, Loot } from "@/lib/types"
import { updateUser } from "./user"

export async function createObject(data: {
  name: string
  description: string
}): Promise<Loot | null> {
  try {
    console.log('🎒 Creating new object:', data.name)

    const object = await prisma.loot.create({
      data: {
        name: data.name,
        description: data.description
      }
    })

    console.log('✅ Loot created successfully:', object.id)
    return object

  } catch (error) {
    console.error('❌ Error creating object:', error)
    return null
  }
}

export async function addObjectToUserInventory(
  userId: string,
  objectId: string
): Promise<ExtendedUser | null> {
  try {
    console.log('🎒 Adding object to user inventory:', { userId, objectId })

    const user = await updateUser(
      { id: userId },
      { inventory: { connect: { id: objectId } } }
    )
    console.log('✅ Loot added to inventory successfully')
    return user as ExtendedUser

  } catch (error) {
    console.error('❌ Error adding object to inventory:', error)
    return null
  }
}

export async function createAndAddObjectToInventory(
  userId: string,
  objectData: { name: string; description: string }
): Promise<ExtendedUser | null> {
  try {
    // 1. Create the object first
    const newObject = await createObject(objectData)
    if (!newObject) {
      throw new Error('Failed to create object')
    }

    // 2. Add it to user's inventory
    const updatedUser = await addObjectToUserInventory(userId, newObject.id)
    return updatedUser

  } catch (error) {
    console.error('❌ Error in createAndAddObjectToInventory:', error)
    return null
  }
} 