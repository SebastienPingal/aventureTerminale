"use client"

import { Input } from "@/components/ui/input"
import Journal, { JournalEntry } from "@/components/Journal"
import { useState } from "react"
import { processPrompt } from "../actions/promptProcessor"
import { executeCommand } from "@/lib/commands"
import { useHistoryStore } from "@/stores/historyStore"
import { useUserStore } from "@/stores/userStore"

export default function Home() {
  const { history, addEntry } = useHistoryStore()
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { user, userWorldCell, surroundingCells, inventory } = useUserStore()

  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim()) return

    const userEntry: JournalEntry = {
      type: 'prompt',
      content: prompt,
      timestamp: Date.now()
    }

    setIsProcessing(true)

    try {
      addEntry(userEntry)

      const context = {
        user: user,
        currentLocation: userWorldCell?.title,
        previousMessages: history.slice(-6).map(entry => entry.content),
        playerInventory: inventory,
        currentCell: userWorldCell || undefined,
        surroundingCells: surroundingCells
      }

      const aiResponse = await processPrompt(prompt, context)

      await executeCommand(aiResponse)

      addEntry({
        type: 'response',
        content: aiResponse.narration,
        timestamp: Date.now()
      })

    } catch (error) {
      console.error('❌ Error processing prompt:', error)

      const errorEntry: JournalEntry = {
        type: 'error',
        content: 'Une erreur est survenue lors du traitement de votre demande.',
        timestamp: Date.now()
      }
      addEntry(errorEntry)

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
        <Journal history={history} />
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
