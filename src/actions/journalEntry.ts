"use server"

import prisma from "@/lib/prisma"
import { JournalEntryType } from "@prisma/client"

export const createJournalEntry = async (userId: string, content: string, type: JournalEntryType) => {
  try {
    const journalEntry = await prisma.journalEntry.create({
      data: { content, type, userId: userId }
    })

    return journalEntry

  } catch (error) {
    console.error("🪶 Failed to create journal entry:", error)
    throw error
  }
}

export const getUserJournalEntries = async (userId: string) => {
  try {
    const journalEntries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    })

    return journalEntries

  } catch (error) {
    console.error("📖 Failed to fetch journal entries:", error)
    throw error
  }
}