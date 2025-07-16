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
  const { user } = useUserStore()

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

      const mockedWorldCell = {
        id: "1",
        title: "Le carrefour scintillant",
        description: "Un ancien rond-point, sur lequel on a entassé des centaines de feux de signalisation.",
        mapCharacter: ".",
      }

      const context = {
        user: user,
        currentLocation: mockedWorldCell.title,
        previousMessages: history.slice(-6).map(entry => entry.content)
      }

      const aiResponse = await processPrompt(prompt, context)

      if (aiResponse.actions) {
        for (const action of aiResponse.actions) {
          await executeCommand(action, aiResponse.newWorldCell || undefined)
        }
      }

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
