"use client";

import { useRef, useEffect } from "react";
import AsciiMap from "./Journal/AsciiMap";

export interface JournalEntry {
  type: 'command' | 'response'
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

      <div className="space-y-2 p-4">
        {history.map((entry, index) => (
          <div key={index}>
            {entry.type === 'command' ? (
              <blockquote className="font-bold border-l-4 border-primary pl-4 italic opacity-80">
                {entry.content}
              </blockquote>

            ) : (
              <div>
                {entry.content}
              </div>
            )}
          </div>
        ))}
        <AsciiMap />
      </div>
    </div>
  )
} 