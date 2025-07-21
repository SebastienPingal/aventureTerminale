import type { Metadata } from "next"
import { Syne_Mono, Rubik_Dirt } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthSessionProvider } from "@/components/SessionProvider"
import { Separator } from "@/components/ui/separator"
import { ToggleTheme } from "@/components/ToggleTheme"
import { auth, signOut } from "@/auth"

const rubikDirt = Rubik_Dirt({
  variable: "--font-rubik-dirt",
  subsets: ["latin"],
  weight: ["400"],
})

const syneMono = Syne_Mono({
  variable: "--font-syne-mono",
  subsets: ["latin"],
  weight: ["400"],
})

export const metadata: Metadata = {
  title: "Aventure Terminale",
  description: "Aventure Terminale",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${rubikDirt.variable} ${syneMono.variable} antialiased h-screen overflow-hidden relative flex flex-col font-[family-name:var(--font-syne-mono)]`}
      >
        <AuthSessionProvider >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <header className="bg-background w-full pt-5 px-4">
              <div className="flex justify-between items-center max-w-6xl mx-auto">
                <h1 className="text-4xl font-[family-name:var(--font-rubik-dirt)]">
                  Un Désert
                </h1>

                <div className="flex items-center gap-2">
                  {session && (
                    <div className="flex items-center gap-2 text-sm">
                      <p>{session.user?.name}</p>
                      <form action={async () => {
                        "use server"
                        await signOut()
                      }}>
                        <button
                          type="submit"
                          className="text-sm underline cursor-pointer"
                        >
                          Logout
                        </button>
                      </form>
                    </div>
                  )}
                  <ToggleTheme />
                </div>
              </div>
              <Separator className="w-full" />
            </header>

            <div className="flex flex-col items-center max-w-6xl mx-auto flex-1 overflow-y-auto w-full">
              {children}
            </div>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
