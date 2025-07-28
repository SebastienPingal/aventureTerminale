"use client"

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { JournalEntry } from '@/lib/types'
import { getUserJournalEntries } from '@/actions/journalEntry'

interface JournalState {
  journal: JournalEntry[]
}

interface JournalContextType extends JournalState {
  setJournal: (journal: JournalEntry[]) => void
  addJournalEntry: (entry: JournalEntry) => void
  refreshJournal: (userId: string) => Promise<void>
}

type JournalAction =
  | { type: 'SET_JOURNAL'; payload: JournalEntry[] }
  | { type: 'ADD_ENTRY'; payload: JournalEntry }

const JournalContext = createContext<JournalContextType | undefined>(undefined)

const journalReducer = (state: JournalState, action: JournalAction): JournalState => {
  switch (action.type) {
    case 'SET_JOURNAL':
      return { journal: action.payload }
    case 'ADD_ENTRY':
      return { journal: [...state.journal, action.payload] }
    default:
      return state
  }
}

const JOURNAL_STORAGE_KEY = 'journal-storage'

const loadFromStorage = (): JournalEntry[] => {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(JOURNAL_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed.state?.journal || []
    }
  } catch (error) {
    console.error('📖 Failed to load journal from storage:', error)
  }
  return []
}

const saveToStorage = (journal: JournalEntry[]) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify({
      state: { journal },
      version: 0
    }))
  } catch (error) {
    console.error('📖 Failed to save journal to storage:', error)
  }
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(journalReducer, { journal: [] })

  useEffect(() => {
    const storedJournal = loadFromStorage()
    if (storedJournal.length > 0) {
      dispatch({ type: 'SET_JOURNAL', payload: storedJournal })
    } else {
      console.log('📖 Adding initial history entries for new user')
    }
  }, [])

  useEffect(() => {
    saveToStorage(state.journal)
  }, [state.journal])

  const setJournal = (journal: JournalEntry[]) => {
    dispatch({ type: 'SET_JOURNAL', payload: journal })
  }

  const addJournalEntry = (entry: JournalEntry) => {
    dispatch({ type: 'ADD_ENTRY', payload: entry })
  }

  const refreshJournal = async (userId: string) => {
    try {
      const journalEntries = await getUserJournalEntries(userId)
      dispatch({ type: 'SET_JOURNAL', payload: journalEntries })
    } catch (error) {
      console.error('📖 Failed to refresh journal:', error)
    }
  }

  const value: JournalContextType = {
    ...state,
    setJournal,
    addJournalEntry,
    refreshJournal
  }

  return (
    <JournalContext.Provider value={value}>
      {children}
    </JournalContext.Provider>
  )
}

export const useJournal = () => {
  const context = useContext(JournalContext)
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider')
  }
  return context
} 