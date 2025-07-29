'use client'

import { Separator } from "@/components/ui/separator"
import { ToggleTheme } from "./ToggleTheme"
import { signOut } from "next-auth/react"
import { useUser } from "@/contexts/UserContext"

export default function Header() {
  const { userWorldCell, user } = useUser()

  return (
    <header className="bg-background w-full pt-5 px-4">
      <div className="flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-4xl font-[family-name:var(--font-rubik-dirt)]">
          {userWorldCell?.title || "Un Désert"}
        </h1>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-2 text-sm">
              <p>{user.name}</p>
              <button
                onClick={() => signOut()}
                className="text-sm underline cursor-pointer"
              >
                Logout
              </button>
            </div>
          )}

          <ToggleTheme />
        </div>
      </div>
      <Separator className="w-full" />
    </header>
  )
}