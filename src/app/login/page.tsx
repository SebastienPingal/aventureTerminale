"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold font-[family-name:var(--font-zen-dots)] mb-8">
        🎮 Aventure Terminale
      </h1>
      
      <div className="flex flex-col gap-4 w-64">
        <Button 
          onClick={() => signIn('google')}
          className="w-full"
        >
          🔍 Continue with Google
        </Button>
        
        <Button 
          onClick={() => signIn('discord')}
          className="w-full"
        >
          💬 Continue with Discord
        </Button>
        
        <Button 
          onClick={() => signIn('github')}
          className="w-full"
        >
          🐱 Continue with GitHub
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Choisissez votre méthode de connexion pour commencer l'aventure
      </p>
    </div>
  )
}