"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { FaGoogle, FaDiscord, FaGithub } from "react-icons/fa"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function Login() {
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')

    if (error) {
      console.log('🚨 Auth error detected:', error)

      // Map NextAuth errors to user-friendly messages
      switch (error) {
        case 'OAuthAccountNotLinked':
          setErrorMessage("Ce compte email est déjà associé à un autre fournisseur. Essayez de vous connecter avec le fournisseur que vous avez utilisé la première fois, ou contactez le support.")
          break
        case 'OAuthSignin':
          setErrorMessage("Erreur lors de la connexion avec le fournisseur OAuth. Veuillez réessayer.")
          break
        case 'OAuthCallback':
          setErrorMessage("Erreur lors du traitement de la réponse OAuth. Veuillez réessayer.")
          break
        case 'OAuthCreateAccount':
          setErrorMessage("Impossible de créer le compte. Veuillez réessayer ou contacter le support.")
          break
        case 'EmailCreateAccount':
          setErrorMessage("Impossible de créer le compte avec cet email. Veuillez réessayer.")
          break
        case 'Callback':
          setErrorMessage("Erreur lors de la connexion. Veuillez réessayer.")
          break
        case 'OAuthProfile':
          setErrorMessage("Impossible de récupérer les informations de profil. Veuillez réessayer.")
          break
        case 'EmailSignin':
          setErrorMessage("Erreur lors de l'envoi de l'email de connexion. Veuillez réessayer.")
          break
        case 'CredentialsSignin':
          setErrorMessage("Identifiants incorrects. Veuillez vérifier et réessayer.")
          break
        case 'SessionRequired':
          setErrorMessage("Session requise. Veuillez vous connecter.")
          break
        default:
          setErrorMessage("Une erreur inattendue s'est produite. Veuillez réessayer.")
      }
    }
  }, [searchParams])

  // Clear error when user tries again
  const handleSignIn = async (provider: string) => {
    setErrorMessage(null)
    await signIn(provider, { callbackUrl: '/' })
  }

  return (
    <div className="flex flex-col gap-4 mt-20 w-xl mx-auto">
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Veuillez vous connecter pour commencer l&apos;aventure
      </p>

      {/* 🚨 Display error message */}
      {errorMessage && (
        <div className="rounded p-4 bg-destructive/10 border border-destructive/20">
          <div className="flex items-start gap-2">
            <div className="text-sm text-destructive whitespace-pre-wrap">
              {errorMessage}
            </div>
          </div>
          {/* Add a dismiss button */}
          <Button
            onClick={() => setErrorMessage(null)}
            variant="ghost"
            className="text-xs hover:text-foreground mt-2 underline"
          >
            Fermer
          </Button>
        </div>
      )}

      <Button
        onClick={() => handleSignIn('google')}
        className="w-full flex items-center gap-2"
      >
        <FaGoogle className="w-4 h-4" />
        Se connecter avec Google
      </Button>

      <Button
        onClick={() => handleSignIn('discord')}
        className="w-full flex items-center gap-2"
      >
        <FaDiscord className="w-4 h-4" />
        Se connecter avec Discord
      </Button>

      <Button
        onClick={() => handleSignIn('github')}
        className="w-full flex items-center gap-2"
      >
        <FaGithub className="w-4 h-4" />
        Se connecter avec GitHub
      </Button>
    </div>
  )
}