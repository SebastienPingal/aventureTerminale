"use server"

import { Prisma } from "@/app/generated/prisma"
import prisma from "@/lib/prisma"
import { ExtendedUser } from "@/lib/types"
import { auth } from "@/auth"
import { generateRandomPosition } from "@/lib/helper"
import { generateWorldCell } from "./generation"
import { STARTER_LOCATIONS } from "@/lib/constants/world"

export async function getUser(id: Prisma.UserWhereUniqueInput): Promise<ExtendedUser | null> {
  const user = await prisma.user.findUnique({
    where: id,
    include: {
      worldCell: {
        include: {
          users: true
        }
      }
    },
  })

  return user as ExtendedUser | null
}

export async function updateUser(id: Prisma.UserWhereUniqueInput, data: Prisma.UserUpdateInput): Promise<ExtendedUser | null> {
  const user = await prisma.user.update({
    where: id,
    data,
    include: {
      worldCell: {
        include: {
          users: true
        }
      }
    },
  })

  return user as ExtendedUser | null
}

/**
 * 🎯 Initializes a user with a random starting position using existing AI generation
 */
export async function initializeUserPosition(userId: string): Promise<ExtendedUser | null> {
  console.log(`🎲 Initializing random position for user: ${userId}`)

  try {
    // Generate random position
    const { x, y } = generateRandomPosition()

    // Check if a WorldCell already exists at this position
    let worldCell = await prisma.worldCell.findUnique({
      where: { x_y: { x, y } }
    })

    // If no cell exists, create one using the existing AI generation
    if (!worldCell) {
      try {
        console.log(`🤖 Generating world cell at (${x}, ${y}) using existing AI system...`)
        const generatedData = await generateWorldCell()

        worldCell = await prisma.worldCell.create({
          data: {
            x,
            y,
            title: generatedData.title,
            description: generatedData.description,
            mapCharacter: generatedData.mapCharacter,
            rarity: generatedData.rarity
          }
        })

        console.log(`✨ Created AI-generated world cell: ${generatedData.title} (${generatedData.rarity})`)

      } catch (aiError) {
        console.error('⚠️ AI generation failed, trying retry then fallback to predefined:', aiError)

        try {
          // One retry attempt
          const retryData = await generateWorldCell()
          worldCell = await prisma.worldCell.create({
            data: { x, y, ...retryData }
          })
          console.log(`🔄 Retry successful: ${retryData.title}`)

        } catch (retryError) {
          console.error('⚠️ Retry failed, using predefined starter location:', retryError)
          // Use predefined starter location
          const starterLocation = STARTER_LOCATIONS[Math.floor(Math.random() * STARTER_LOCATIONS.length)]

          worldCell = await prisma.worldCell.create({
            data: { x, y, ...starterLocation }
          })
          console.log(`🎯 Used predefined starter: ${starterLocation.title}`)
        }
      }
    } else {
      console.log(`📍 Using existing world cell at (${x}, ${y}): ${worldCell.title}`)
    }

    // Assign user to this world cell
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { worldCellId: worldCell.id },
      include: {
        worldCell: {
          include: {
            users: true
          }
        }
      }
    })

    console.log(`✅ User ${userId} placed at random position (${x}, ${y}) - ${worldCell.title}`)
    return updatedUser as ExtendedUser | null

  } catch (error) {
    console.error(`❌ Failed to initialize position for user ${userId}:`, error)
    throw new Error("Failed to initialize user position")
  }
}

export async function getMe(): Promise<ExtendedUser | null> {
  const session = await auth()
  if (!session?.user) {
    return null
  }

  let me = await getUser({ id: session.user.id })

  // 🎯 If user doesn't have a world cell, initialize them with a random position
  if (me && !me.worldCell) {
    console.log("🆕 New user detected, initializing random position...")
    me = await initializeUserPosition(me.id)
  }

  return me
}

/**
 * 🔄 Manually assigns a new random position to a user
 */
export async function assignRandomPosition(userId: string): Promise<ExtendedUser | null> {
  console.log(`🔄 Manually assigning new random position for user: ${userId}`)
  return await initializeUserPosition(userId)
}