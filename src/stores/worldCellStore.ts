import { create } from 'zustand'
import { WorldCell } from '@/lib/types'
import { fetchWorldCells } from '@/actions/worldCell'

interface WorldCellState {
  worldCells: WorldCell[]
  loading: boolean
  error: string | null
  
  // Actions
  setWorldCells: (cells: WorldCell[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateWorldCell: (cell: WorldCell) => void
  getWorldCellAt: (x: number, y: number) => WorldCell | undefined
  loadWorldCells: () => Promise<void>
  reset: () => void
}

export const useWorldCellStore = create<WorldCellState>((set, get) => ({
  worldCells: [],
  loading: false,
  error: null,

  setWorldCells: (cells) => set({ worldCells: cells }),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  updateWorldCell: (cell) => set((state) => {
    const index = state.worldCells.findIndex(c => c.id === cell.id)
    if (index >= 0) {
      const newCells = [...state.worldCells]
      newCells[index] = cell
      return { worldCells: newCells }
    }
    return { worldCells: [...state.worldCells, cell] }
  }),
  
  getWorldCellAt: (x, y) => {
    const { worldCells } = get()
    return worldCells.find(cell => cell.x === x && cell.y === y)
  },
  
  loadWorldCells: async () => {
    const { worldCells, setLoading, setError, setWorldCells } = get()
    
    if (worldCells.length > 0) return // Don't reload if already loaded
    
    setLoading(true)
    setError(null)
    
    try {
      console.log("🗺️ Loading world cells with Zustand...")
      const cells = await fetchWorldCells()
      setWorldCells(cells)
      console.log(`✅ Successfully loaded ${cells.length} world cells`)
    } catch (err) {
      console.error("❌ Failed to load world cells:", err)
      setError(err instanceof Error ? err.message : 'Failed to load world cells')
    } finally {
      setLoading(false)
    }
  },
  
  reset: () => set({
    worldCells: [],
    loading: false,
    error: null
  })
})) 