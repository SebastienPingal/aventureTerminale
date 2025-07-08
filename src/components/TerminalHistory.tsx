"use client";

import { useRef, useEffect } from "react";

export interface TerminalEntry {
  type: 'command' | 'response';
  content: string;
}

interface TerminalHistoryProps {
  history: TerminalEntry[];
}

export default function TerminalHistory({ history }: TerminalHistoryProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-y-auto gap-2 font-[family-name:var(--font-syne-mono)] flex flex-col"
    >
      {history.map((entry, index) => (
        <div key={index}>
          {entry.type === 'command' ? (
            <div className="font-bold">
              → {entry.content}
            </div>
          ) : (
            <div>
              {entry.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 