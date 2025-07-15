"use server"

import prisma from "@/lib/prisma"
import { WorldCell } from "@/lib/types"

export async function fetchWorldCells(): Promise<WorldCell[]> {
  try {
    console.log("🗺️ Fetching world cells from database...")

    const cells = await prisma.worldCell.findMany({
      orderBy: [
        { y: 'asc' },
        { x: 'asc' }
      ]
    })

    console.log(`✅ Successfully fetched ${cells.length} world cells`)

    return cells.map(cell => ({
      ...cell,
      createdAt: new Date(cell.createdAt),
      updatedAt: new Date(cell.updatedAt),
    }))
  } catch (error) {
    console.error("❌ Error fetching world cells:", error)
    throw new Error("Failed to fetch world cells")
  }
}

export async function fetchWorldCellsInArea(
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): Promise<WorldCell[]> {
  try {
    console.log(`🔍 Fetching world cells in area: (${minX},${minY}) to (${maxX},${maxY})`)

    const cells = await prisma.worldCell.findMany({
      where: {
        x: {
          gte: minX,
          lte: maxX
        },
        y: {
          gte: minY,
          lte: maxY
        }
      },
      orderBy: [
        { y: 'asc' },
        { x: 'asc' }
      ]
    })

    console.log(`✅ Successfully fetched ${cells.length} world cells in area`)

    return cells.map(cell => ({
      ...cell,
      createdAt: new Date(cell.createdAt),
      updatedAt: new Date(cell.updatedAt),
    }))
  } catch (error) {
    console.error("❌ Error fetching world cells in area:", error)
    throw new Error("Failed to fetch world cells in area")
  }
}

export async function createWorldCell(
  x: number,
  y: number,
  mapCharacter: string,
  title: string,
  description: string
): Promise<WorldCell> {
  try {
    console.log(`🏗️ Creating new world cell at (${x},${y}) with character '${mapCharacter}'`)

    const cell = await prisma.worldCell.create({
      data: {
        x,
        y,
        mapCharacter,
        title,
        description
      }
    })

    console.log(`✅ Successfully created world cell: ${cell.title}`)

    return {
      ...cell,
      createdAt: new Date(cell.createdAt),
      updatedAt: new Date(cell.updatedAt),
    }
  } catch (error) {
    console.error("❌ Error creating world cell:", error)
    throw new Error("Failed to create world cell")
  }
}