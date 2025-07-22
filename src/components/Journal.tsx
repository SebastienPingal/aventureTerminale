"use client"

import { useRef, useEffect } from "react"

export interface JournalEntry {
  type: 'prompt' | 'response' | 'system' | 'error'
  content: string
  actions?: string[]
  timestamp?: number
}

interface JournalProps {
  history: JournalEntry[]
}

export default function Journal({ history }: JournalProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  return (
    <div
      ref={scrollRef}
      className="h-full w-full overflow-y-auto font-[family-name:var(--font-syne-mono)] flex flex-col"
    >
      <div className="flex-1" />

      <div className="flex flex-col gap-2 p-4">
        {history.map((entry, index) => (
          <div key={index}>
            {entry.type === 'prompt' ? (
              <blockquote className="italic border-l-4 border-primary pl-4">
                <div className="flex items-center gap-2">
                  <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-[family-name:var(--font-syne-mono)] text-justify">
                    {entry.content}
                  </pre>
                </div>
              </blockquote>
            ) : entry.type === 'system' ? (
              <div className="rounded p-2 bg-muted/50">
                <div className="flex items-center gap-2">
                  <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-[family-name:var(--font-syne-mono)] text-justify">
                    {entry.content}
                  </pre>
                </div>
              </div>
            ) : entry.type === 'error' ? (
              <div className="rounded p-2 bg-destructive/10 border border-destructive/20">
                <div className="flex items-center gap-2">
                  <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-[family-name:var(--font-syne-mono)] text-destructive text-justify">
                    {entry.content}
                  </pre>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-[family-name:var(--font-syne-mono)] text-justify">
                    {entry.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        ))}

        {history.length === 0 && (
          <div className="text-muted-foreground text-center p-8">
            <p>Bienvenue dans votre aventure...</p>
            <p className="text-sm mt-2">Commencez par vous présenter ou dites-moi ce que vous voulez faire!</p>
          </div>
        )}
      </div>
    </div>
  )
} 