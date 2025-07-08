"use client";

import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import TerminalHistory, { TerminalEntry } from "@/components/TerminalHistory";
import { useState } from "react";

export default function Home() {
  const [currentInput, setCurrentInput] = useState("");
  const [history, setHistory] = useState<TerminalEntry[]>([
    {
      type: 'response',
      content: "Vous êtes un étudiant en terminale et vous avez besoin d'aide pour votre projet de fin d'année ?"
    }
  ]);

  const handleCommand = (command: string) => {
    if (!command.trim()) return;

    const newEntry: TerminalEntry = {
      type: 'command',
      content: command
    };

    let response = '';

    switch (command.toLowerCase().trim()) {
      case 'help':
        response = 'Commandes disponibles: help, about, clear';
        break;

      case 'about':
        response = 'Votre assistant pour les projets de terminale';
        break;

      case 'clear':
        setHistory([newEntry]);
        setCurrentInput("");
        return;

      default:
        response = `Commande "${command}" non reconnue`;
    }

    const responseEntry: TerminalEntry = {
      type: 'response',
      content: response
    };

    setHistory(prev => [...prev, newEntry, responseEntry]);
    setCurrentInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(currentInput);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 w-full gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] flex flex-col items-center sm:items-start">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-zen-dots)]">
          Aventure Terminale
        </h1>

        <TerminalHistory history={history} />
      </main>

      <footer className="sticky bottom-20 w-full bg-background flex flex-col gap-4">
        <Separator className="w-full" />
        <Input
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Que faites-vous ?"
          className="w-full font-[family-name:var(--font-syne-mono)]"
          autoFocus
        />
      </footer>
    </div>
  );
}
