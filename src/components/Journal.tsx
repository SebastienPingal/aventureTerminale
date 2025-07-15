"use client"

import { useRef, useEffect } from "react";
import AsciiMap from "./Journal/AsciiMap";

export interface JournalEntry {
  type: 'command' | 'response' | 'system'
  content: string
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

            {entry.type === 'command' ? (
              <blockquote className="italic border-l-4 border-primary pl-4">
                <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-[family-name:var(--font-syne-mono)]">
                  {entry.content}
                </pre>
              </blockquote>

            ) : entry.type === 'system' ? (
              <div className="rounded p-2">
                <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-[family-name:var(--font-syne-mono)]">
                  {entry.content}
                </pre>
              </div>

            ) : (
              <div>
                <pre className="whitespace-pre-wrap bg-transparent p-0 m-0 font-[family-name:var(--font-syne-mono)]">
                  {entry.content}
                </pre>
              </div>
            )}
          </div>
        ))}

        <AsciiMap />
      </div>
    </div>
  )
} 