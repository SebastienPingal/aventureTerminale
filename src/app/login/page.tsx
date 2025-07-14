"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FaGoogle, FaDiscord, FaGithub } from "react-icons/fa"

export default function Login() {
  return (
    <div className="flex flex-col gap-4 mt-20">
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Veuillez vous connecter pour commencer l&apos;aventure
      </p>

      <Button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="w-full flex items-center gap-2"
      >
        <FaGoogle className="w-4 h-4" />
        Se connecter avec Google
      </Button>

      <Button
        onClick={() => signIn('discord', { callbackUrl: '/' })}
        className="w-full flex items-center gap-2"
      >
        <FaDiscord className="w-4 h-4" />
        Se connecter avec Discord
      </Button>

      <Button
        onClick={() => signIn('github', { callbackUrl: '/' })}
        className="w-full flex items-center gap-2"
      >
        <FaGithub className="w-4 h-4" />
        Se connecter avec GitHub
      </Button>
    </div>
  )
}