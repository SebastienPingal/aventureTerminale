"use client"

import { Input } from "@/components/ui/input"
import Journal from "@/components/Journal"
import { useState } from "react"
import { processPrompt } from "../actions/promptProcessor"
import { executeCommand } from "@/lib/commands"
import { useUser } from "@/contexts/UserContext"
import { useWorldCell } from "@/contexts/WorldCellContext"
import { useJournal } from "@/contexts/JournalContext"
import { JournalEntryType } from "@/app/generated/prisma"
import { createJournalEntry } from "@/actions/journalEntry"

export default function Home() {
  const { journal, refreshJournal } = useJournal()
  const { user, userWorldCell, surroundingCells, inventory, moveUser, addObjectToInventory } = useUser()
  const { createNewWorldCell } = useWorldCell()
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim()) return

    setIsProcessing(true)

    if (!user?.id) {
      console.error('❌ User not authenticated')
      return
    }

    try {
      await createJournalEntry(user.id, prompt, JournalEntryType.PROMPT)
      await refreshJournal(user.id) // 📖 Refresh journal after adding prompt

      const context = {
        user: user,
        currentLocation: userWorldCell?.title,
        previousMessages: journal.slice(-6).map(entry => entry.content),
        playerInventory: inventory,
        currentCell: userWorldCell || undefined,
        surroundingCells: surroundingCells
      }

      const aiResponse = await processPrompt(prompt, context)
      await executeCommand(aiResponse, user, moveUser, addObjectToInventory, createNewWorldCell)
      await createJournalEntry(user?.id, aiResponse.narration, JournalEntryType.RESPONSE)
      await refreshJournal(user.id) // 📖 Refresh journal after adding response

    } catch (error) {
      console.error('❌ Error processing prompt:', error)

      await createJournalEntry(user.id, 'Une erreur est survenue lors du traitement de votre demande.', JournalEntryType.ERROR)
      await refreshJournal(user.id) // 📖 Refresh journal after adding error

    } finally {
      setIsProcessing(false)
    }

    setCurrentInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handlePrompt(currentInput)
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-hidden">
        <Journal journal={journal} />
      </div>

      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Input
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Que faites-vous ?"
            disabled={isProcessing}
            className="flex-1"
          />

          {isProcessing && (
            <span className="text-muted-foreground animate-pulse">⚡</span>
          )}
        </div>
      </div>
    </div>
  )
}
