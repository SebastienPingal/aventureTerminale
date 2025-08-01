"use client"

import { useState, useEffect } from 'react'
import { calculateAtmosphericData, demonstrateAtmosphericSystem } from '@/lib/helper'

export default function TestAtmosphericPage() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState<'humidity' | 'temperature' | 'pressure' | 'turbulence'>('temperature')
  const [timeOffset, setTimeOffset] = useState(0)
  const [gridSize] = useState(15)

  // Unified gradient system
  const createGradient = (colors: number[][], value: number): string => {
    const clampedValue = Math.max(0, Math.min(1, value))
    
    if (colors.length === 2) {
      // Simple two-color gradient
      const [start, end] = colors
      const r = Math.round(start[0] + (end[0] - start[0]) * clampedValue)
      const g = Math.round(start[1] + (end[1] - start[1]) * clampedValue)
      const b = Math.round(start[2] + (end[2] - start[2]) * clampedValue)
      return `rgb(${r}, ${g}, ${b})`
    } else if (colors.length === 3) {
      // Three-color gradient with midpoint at 0.5
      if (clampedValue < 0.5) {
        const t = clampedValue / 0.5
        const [start, mid] = colors
        const r = Math.round(start[0] + (mid[0] - start[0]) * t)
        const g = Math.round(start[1] + (mid[1] - start[1]) * t)
        const b = Math.round(start[2] + (mid[2] - start[2]) * t)
        return `rgb(${r}, ${g}, ${b})`
      } else {
        const t = (clampedValue - 0.5) / 0.5
        const [, mid, end] = colors
        const r = Math.round(mid[0] + (end[0] - mid[0]) * t)
        const g = Math.round(mid[1] + (end[1] - mid[1]) * t)
        const b = Math.round(mid[2] + (end[2] - mid[2]) * t)
        return `rgb(${r}, ${g}, ${b})`
      }
    }
    
    // Fallback for invalid configurations
    return `rgb(128, 128, 128)`
  }

  // Fonction pour obtenir la couleur basée sur la valeur atmosphérique
  const getColorForValue = (value: number, mode: string) => {
    const gradientConfigs = {
      temperature: [
        [135, 206, 235], // Light blue (cold)
        [255, 0, 0]      // Red (hot)
      ],
      humidity: [
        [255, 245, 200], // Light yellowish (dry)
        [220, 220, 120], // Mid yellow
        [30, 80, 255]    // Deep blue (humid)
      ],
      pressure: [
        [0, 0, 0],       // Black (low)
        [0, 255, 0],     // Green (mid)
        [255, 255, 255]  // White (high)
      ],
      turbulence: [
        [0, 0, 0],       // Black (calm)
        [255, 255, 255]  // White (agitated)
      ]
    }

    const colors = gradientConfigs[mode as keyof typeof gradientConfigs]
    if (!colors) {
      // Fallback for unknown modes
      const gray = Math.floor(value * 255)
      return `rgb(${gray}, ${gray}, ${gray})`
    }

    return createGradient(colors, value)
  }

  const formatValue = (value: number) => Math.floor(value * 100)

  const getCondition = (value: number, type: string) => {
    if (value < 0.3) {
      return type === 'temperature' ? 'froid' : type === 'humidity' ? 'sec' : type === 'pressure' ? 'basse' : 'calme'
    } else if (value > 0.7) {
      return type === 'temperature' ? 'chaud' : type === 'humidity' ? 'humide' : type === 'pressure' ? 'haute' : 'agité'
    }
    return type === 'temperature' ? 'tempéré' : type === 'humidity' ? 'modéré' : type === 'pressure' ? 'normale' : 'stable'
  }

  const currentData = calculateAtmosphericData(position.x, position.y, timeOffset)
  
  // Apply the same enhanced mapping for display consistency
  const getDisplayValue = (data: typeof currentData, mode: string) => {
    const rawValue = data[mode as keyof typeof data]
    return mode === 'temperature' ? Math.pow(rawValue, 1.5) : rawValue
  }

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col gap-4 w-full">
      <div className="border rounded-lg p-4 bg-card w-full">
        <h1 className="text-lg font-semibold mb-4">Système Atmosphérique</h1>

        {/* Contrôles minimalistes */}
        <div className="flex items-center gap-4 mb-4 text-sm w-full">
          <div className="flex items-center gap-2">
            <span>Position:</span>
            <input
              type="number"
              value={position.x}
              onChange={(e) => setPosition(prev => ({ ...prev, x: parseInt(e.target.value) || 0 }))}
              className="w-16 px-2 py-1 border rounded text-center"
            />
            <span>,</span>
            <input
              type="number"
              value={position.y}
              onChange={(e) => setPosition(prev => ({ ...prev, y: parseInt(e.target.value) || 0 }))}
              className="w-16 px-2 py-1 border rounded text-center"
            />
          </div>

          <div className="flex items-center gap-2">
            <span>Temps:</span>
            <input
              type="range"
              min="0"
              max="50"
              value={timeOffset}
              onChange={(e) => setTimeOffset(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground">{timeOffset}</span>
          </div>

          <button
            onClick={() => setPosition({ x: Math.floor(Math.random() * 20) - 10, y: Math.floor(Math.random() * 20) - 10 })}
            className="px-2 py-1 text-xs border rounded hover:bg-accent transition-colors"
          >
            Aléatoire
          </button>

          <button
            onClick={() => demonstrateAtmosphericSystem()}
            className="px-2 py-1 text-xs border rounded hover:bg-accent transition-colors"
          >
            Console
          </button>
        </div>

        {/* Mode de vue */}
        <div className="flex gap-2 mb-4">
          {(['temperature', 'humidity', 'pressure', 'turbulence'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 text-xs rounded transition-colors ${viewMode === mode
                ? 'bg-primary text-primary-foreground'
                : 'border hover:bg-accent'
                }`}
            >
              {mode === 'temperature' ? '🌡️' : mode === 'humidity' ? '💧' : mode === 'pressure' ? '🌊' : '🌪️'}
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Données actuelles */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="text-sm font-medium mb-2">
          Position ({position.x}, {position.y}) - {viewMode}
        </div>
        <div className="text-lg font-mono">
          {formatValue(getDisplayValue(currentData, viewMode))}% - {getCondition(getDisplayValue(currentData, viewMode), viewMode)}
        </div>
      </div>

      {/* Visualisation colorée */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-semibold">Carte atmosphérique</h3>
          <span className="text-xs text-muted-foreground">
            {gridSize}x{gridSize} - Mode: {viewMode}
          </span>
        </div>

        <div className="grid gap-px bg-border p-1 rounded" style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}>
          {Array.from({ length: gridSize * gridSize }, (_, i) => {
            const x = position.x + (i % gridSize) - Math.floor(gridSize / 2)
            const y = position.y + Math.floor(i / gridSize) - Math.floor(gridSize / 2)
            const data = calculateAtmosphericData(x, y, timeOffset)
            const rawValue = data[viewMode]
            
            // Enhanced temperature mapping to spread the range better
            const value = viewMode === 'temperature' 
              ? Math.pow(rawValue, 1.5) // Power curve to push low values lower and spread the range
              : rawValue
            
            const isCenter = i === Math.floor((gridSize * gridSize) / 2)

            return (
              <div
                key={i}
                className={`w-4 h-4 text-[8px] flex items-center justify-center font-mono ${isCenter ? 'ring-2 ring-foreground' : ''
                  }`}
                style={{ backgroundColor: getColorForValue(value, viewMode) }}
                title={`(${x},${y}) - Raw: ${Math.round(rawValue * 100)}% | Mapped: ${formatValue(value)}%`}
              >
                {isCenter ? '●' : ''}
              </div>
            )
          })}
        </div>

        <div className="mt-2 text-xs text-muted-foreground text-center">
          ● = Position actuelle • Survolez pour voir les valeurs
        </div>
      </div>

      {/* Toutes les données */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="text-sm font-semibold mb-2">Toutes les conditions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-mono">🌡️ {formatValue(getDisplayValue(currentData, 'temperature'))}%</div>
            <div className="text-xs text-muted-foreground">{getCondition(getDisplayValue(currentData, 'temperature'), 'temperature')}</div>
          </div>
          <div>
            <div className="font-mono">💧 {formatValue(getDisplayValue(currentData, 'humidity'))}%</div>
            <div className="text-xs text-muted-foreground">{getCondition(getDisplayValue(currentData, 'humidity'), 'humidity')}</div>
          </div>
          <div>
            <div className="font-mono">🌊 {formatValue(getDisplayValue(currentData, 'pressure'))}%</div>
            <div className="text-xs text-muted-foreground">{getCondition(getDisplayValue(currentData, 'pressure'), 'pressure')}</div>
          </div>
          <div>
            <div className="font-mono">🌪️ {formatValue(getDisplayValue(currentData, 'turbulence'))}%</div>
            <div className="text-xs text-muted-foreground">{getCondition(getDisplayValue(currentData, 'turbulence'), 'turbulence')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}