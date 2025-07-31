"use client"

import { Input } from "@/components/ui/input"
import Journal from "@/components/Journal"
import { useState } from "react"
import { processUserPrompt } from "../actions/promptProcessor"
import { useUser } from "@/contexts/UserContext"
import { useJournal } from "@/contexts/JournalContext"

export default function Home() {
  const { journal, refreshJournal } = useJournal()
  const { user, getMe } = useUser()
  const [currentInput, setCurrentInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePrompt = async (prompt: string) => {
    if (!prompt.trim() || !user?.id || isProcessing) return

    setIsProcessing(true)

    try {
      const result = await processUserPrompt(user.id, prompt)
      
      if (result.success) {
        console.log('✅ Prompt processed successfully')
      } else {
        console.error('❌ Prompt processing failed:', result.message)
      }

      // Refresh all data from server
      if (result.shouldRefreshData) {
        await Promise.all([
          refreshJournal(user.id),
          getMe() // This will refresh user data, world cell, inventory, etc.
        ])
      }

    } catch (error) {
      console.error('❌ Error processing prompt:', error)
    } finally {
      setIsProcessing(false)
      setCurrentInput("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handlePrompt(currentInput)
    }
  }

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex-1 overflow-hidden">
        <Journal journal={journal} isProcessing={isProcessing} />
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
        </div>
      </div>
    </div>
  )
}
