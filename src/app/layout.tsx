import type { Metadata } from "next";
import { Syne_Mono, Zen_Dots } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthSessionProvider } from "@/components/SessionProvider";
import { Separator } from "@/components/ui/separator";
import { ToggleTheme } from "@/components/ToggleTheme";
import { auth } from "@/auth";

const zenDots = Zen_Dots({
  variable: "--font-zen-dots",
  subsets: ["latin"],
  weight: ["400"],
});

const syneMono = Syne_Mono({
  variable: "--font-syne-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Aventure Terminale",
  description: "Aventure Terminale",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const session = await auth()
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${zenDots.variable} ${syneMono.variable} antialiased h-screen overflow-hidden relative flex flex-col`}
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
                <h1 className="text-4xl font-bold font-[family-name:var(--font-zen-dots)]">
                  Aventure Terminale
                </h1>
                <div className="flex items-center gap-2">
                  {session && <p>{session.user?.name}</p>}
                  <ToggleTheme />
                </div>
              </div>
              <Separator className="w-full" />
            </header>

            <div className="flex flex-col items-center max-w-6xl mx-auto flex-1 overflow-y-auto">
              {children}
            </div>
          </ThemeProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
