"use client"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Journal, { JournalEntry } from "@/components/Journal"
import { useState } from "react"
import { generateWorldCell } from "../actions/generation"
import { useHistoryStore } from "@/stores/historyStore"

export default function Home() {
  const { history, addEntry } = useHistoryStore()
  const [currentInput, setCurrentInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleCommand = async (command: string) => {
    if (!command.trim()) return

    const newEntry: JournalEntry = {
      type: 'command',
      content: command
    }

    let response = ''

    try {
      addEntry(newEntry)

      switch (command.toLowerCase().trim()) {
        case 'help':
          response = 'Commandes disponibles: help, clear, generate'
          break;

        case 'generate':
          setIsGenerating(true)

          const loadingEntry: JournalEntry = {
            type: 'response',
            content: 'Vous marchez ...'
          }
          addEntry(loadingEntry)

          try {
            const worldCell = await generateWorldCell()
            response = `${worldCell.title} (${worldCell.rarity})\n${worldCell.description}\nCaractère sur la carte: ${worldCell.mapCharacter}`
          } catch (error) {
            console.error('❌ Error generating world cell:', error)
            response = 'Erreur lors de la génération du lieu. Veuillez réessayer.'
          } finally {
            setIsGenerating(false)
          }
          break;

        case 'clear':
          addEntry(newEntry)
          setCurrentInput("")
          return

        default:
          response = `Commande "${command}" non reconnue`
      }
    } catch (error) {
      console.error('❌ Error handling command:', error)
      response = 'Une erreur est survenue.'
    }

    const responseEntry: JournalEntry = {
      type: 'response',
      content: response
    }

    if (command.toLowerCase().trim() === 'generate') {
      addEntry(responseEntry)
    } else {
      addEntry(responseEntry)
    }

    setCurrentInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput)
    }
  }

  return (
    <div className="h-full flex flex-col grow w-full">
      <main className="flex-1 font-[family-name:var(--font-geist-sans)] overflow-hidden w-full">
        <Journal history={history} />
      </main>

      <footer className="bg-background w-full flex flex-col gap-4 pb-4 px-4">
        <Separator className="w-full" />

        <Input
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={isGenerating ? "Génération en cours..." : "Que faites-vous ?"}
          className="w-full font-[family-name:var(--font-syne-mono)]"
          autoFocus
          disabled={isGenerating}
        />
      </footer>
    </div>
  )
}
