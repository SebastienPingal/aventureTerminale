"use client"

import { useWorldCell } from '@/contexts/WorldCellContext'
import { useEffect } from 'react'

export default function AsciiMap() {
  const {
    worldCells,
    loading,
    error,
    getWorldCellAt,
    loadWorldCells
  } = useWorldCell()

  useEffect(() => {
    loadWorldCells()
  }, [loadWorldCells])

  const renderMap = () => {
    if (worldCells.length === 0) {
      return (
        <div className="text-muted-foreground text-center p-4">
          No world discovered yet...
        </div>
      )
    }

    // Calculate map boundaries
    const minX = Math.min(...worldCells.map(cell => cell.x))
    const maxX = Math.max(...worldCells.map(cell => cell.x))
    const minY = Math.min(...worldCells.map(cell => cell.y))
    const maxY = Math.max(...worldCells.map(cell => cell.y))

    const rows = []

    for (let y = minY; y <= maxY; y++) {
      const cells = []
      for (let x = minX; x <= maxX; x++) {
        const cell = getWorldCellAt(x, y)
        cells.push(
          <span
            key={`${x}-${y}`}
            className={`inline-block w-6 h-6 text-center ${cell
              ? 'text-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors'
              : 'text-muted-foreground/30'
              }`}
            title={cell ? `${cell.title} (${x},${y})` : `Undiscovered (${x},${y})`}
          >
            {cell ? cell.mapCharacter : '?'}
          </span>
        )
      }
      rows.push(
        <div key={y} className="flex">
          {cells}
        </div>
      )
    }

    return (
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Carte du monde</h3>
          <span className="text-xs text-muted-foreground">
            {worldCells.length} lieux découverts
          </span>
        </div>
        <div className="font-mono text-sm leading-none space-y-0">
          {rows}
        </div>
        {worldCells.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground">
            Coordonnées: ({minX},{minY}) à ({maxX},{maxY})
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="inline-flex items-center gap-2">
          Chargement de la carte du monde...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-4">
        <div className="text-destructive">
          Erreur lors du chargement de la carte du monde: {error}
        </div>
      </div>
    )
  }

  return renderMap()
}