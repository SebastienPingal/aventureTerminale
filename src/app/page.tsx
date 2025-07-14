"use client"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import Journal, { JournalEntry } from "@/components/Journal"
import { useState } from "react"
import { ToggleTheme } from "@/components/ToggleTheme"
import { generateWorldCell } from "../actions/generation"

export default function Home() {
  const [currentInput, setCurrentInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const [history, setHistory] = useState<JournalEntry[]>([
    {
      type: 'response',
      content: "Bienvenue sur l'aventure terminale. Rejoignez, découvrez un monde persistant. Peut-être croiserez vous d'autre voyageurs."
    }
  ])

  const handleCommand = async (command: string) => {
    if (!command.trim()) return

    const newEntry: JournalEntry = {
      type: 'command',
      content: command
    }

    let response = ''

    try {
      switch (command.toLowerCase().trim()) {
        case 'help':
          response = 'Commandes disponibles: help, clear, generate'
          break;

        case 'generate':
          setIsGenerating(true)
          
          // Add loading entry
          const loadingEntry: JournalEntry = {
            type: 'response',
            content: 'Vous marchez ...'
          }
          setHistory(prev => [...prev, newEntry, loadingEntry])
          
          try {
            const worldCell = await generateWorldCell()
            response = `🏞️ **${worldCell.title}** (${worldCell.rarity})\n${worldCell.description}\nCaractère sur la carte: ${worldCell.mapCharacter}`
          } catch (error) {
            console.error('❌ Error generating world cell:', error)
            response = '❌ Erreur lors de la génération du lieu. Veuillez réessayer.'
          } finally {
            setIsGenerating(false)
          }
          break;

        case 'clear':
          setHistory([newEntry])
          setCurrentInput("")
          return

        default:
          response = `❓ Commande "${command}" non reconnue`
      }
    } catch (error) {
      console.error('❌ Error handling command:', error)
      response = '❌ Une erreur est survenue.'
    }

    const responseEntry: JournalEntry = {
      type: 'response',
      content: response
    }

    // For generate command, replace the loading message
    if (command.toLowerCase().trim() === 'generate') {
      setHistory(prev => [...prev.slice(0, -1), responseEntry])
    } else {
      setHistory(prev => [...prev, newEntry, responseEntry])
    }
    
    setCurrentInput("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput)
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-background w-full pt-5 px-4">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold font-[family-name:var(--font-zen-dots)]">
            Aventure Terminale
          </h1>
          <ToggleTheme />
        </div>
        <Separator className="w-full" />
      </header>

      <main className="flex-1 font-[family-name:var(--font-geist-sans)] overflow-hidden">
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
