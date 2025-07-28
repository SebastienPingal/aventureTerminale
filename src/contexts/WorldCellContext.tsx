"use client"

import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { WorldCell } from '@/lib/types'
import { fetchWorldCells, fetchWorldCellsInArea, createWorldCell } from '@/actions/worldCell'

interface WorldCellState {
  worldCells: WorldCell[]
  loading: boolean
  error: string | null
}

interface WorldCellContextType extends WorldCellState {
  setWorldCells: (cells: WorldCell[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateWorldCell: (cell: WorldCell) => void
  getWorldCellAt: (x: number, y: number) => WorldCell | undefined
  loadWorldCells: () => Promise<void>
  loadWorldCellsInArea: (minX: number, maxX: number, minY: number, maxY: number) => Promise<void>
  createNewWorldCell: (x: number, y: number, mapCharacter: string, title: string, description: string) => Promise<WorldCell | null>
  reset: () => void
}

type WorldCellAction = 
  | { type: 'SET_WORLD_CELLS'; payload: WorldCell[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_WORLD_CELL'; payload: WorldCell }
  | { type: 'RESET' }

const WorldCellContext = createContext<WorldCellContextType | undefined>(undefined)

const worldCellReducer = (state: WorldCellState, action: WorldCellAction): WorldCellState => {
  switch (action.type) {
    case 'SET_WORLD_CELLS':
      return { ...state, worldCells: action.payload }
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'UPDATE_WORLD_CELL':
      const index = state.worldCells.findIndex(c => c.id === action.payload.id)
      if (index >= 0) {
        const newCells = [...state.worldCells]
        newCells[index] = action.payload
        return { ...state, worldCells: newCells }
      }
      return { ...state, worldCells: [...state.worldCells, action.payload] }
    case 'RESET':
      return { worldCells: [], loading: false, error: null }
    default:
      return state
  }
}

export function WorldCellProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(worldCellReducer, {
    worldCells: [],
    loading: false,
    error: null
  })

  const setWorldCells = (cells: WorldCell[]) => {
    dispatch({ type: 'SET_WORLD_CELLS', payload: cells })
  }

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading })
  }

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error })
  }

  const updateWorldCell = (cell: WorldCell) => {
    dispatch({ type: 'UPDATE_WORLD_CELL', payload: cell })
  }

  const getWorldCellAt = (x: number, y: number) => {
    return state.worldCells.find(cell => cell.x === x && cell.y === y)
  }

  const loadWorldCells = async () => {
    if (state.worldCells.length > 0) return // Don't reload if already loaded
    
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      console.log('🗺️ Loading world cells with React Context...')
      const cells = await fetchWorldCells()
      dispatch({ type: 'SET_WORLD_CELLS', payload: cells })
      console.log(`✅ Successfully loaded ${cells.length} world cells`)
    } catch (err) {
      console.error('❌ Failed to load world cells:', err)
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to load world cells' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const loadWorldCellsInArea = async (minX: number, maxX: number, minY: number, maxY: number) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      console.log('🔍 Loading world cells in area with React Context...')
      const cells = await fetchWorldCellsInArea(minX, maxX, minY, maxY)
      dispatch({ type: 'SET_WORLD_CELLS', payload: cells })
      console.log(`✅ Successfully loaded ${cells.length} world cells in area`)
    } catch (err) {
      console.error('❌ Failed to load world cells in area:', err)
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to load world cells in area' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const createNewWorldCell = async (x: number, y: number, mapCharacter: string, title: string, description: string) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    
    try {
      console.log('🏗️ Creating new world cell with React Context...')
      const newCell = await createWorldCell(x, y, mapCharacter, title, description)
      
      dispatch({ type: 'UPDATE_WORLD_CELL', payload: newCell })
      
      console.log(`✅ Successfully created world cell: ${newCell.title}`)
      return newCell
    } catch (err) {
      console.error('❌ Failed to create world cell:', err)
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to create world cell' })
      return null
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const reset = () => {
    dispatch({ type: 'RESET' })
  }

  const value: WorldCellContextType = {
    ...state,
    setWorldCells,
    setLoading,
    setError,
    updateWorldCell,
    getWorldCellAt,
    loadWorldCells,
    loadWorldCellsInArea,
    createNewWorldCell,
    reset
  }

  return (
    <WorldCellContext.Provider value={value}>
      {children}
    </WorldCellContext.Provider>
  )
}

export const useWorldCell = () => {
  const context = useContext(WorldCellContext)
  if (context === undefined) {
    throw new Error('useWorldCell must be used within a WorldCellProvider')
  }
  return context
}