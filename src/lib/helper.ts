import { RARITY_WEIGHTS, WORLD_GRID } from "./constants/world"

export function randomRarity(): string {
  const totalWeight = Object.values(RARITY_WEIGHTS).reduce((sum, weight) => sum + weight, 0)
  let random = Math.random() * totalWeight

  for (const [rarity, weight] of Object.entries(RARITY_WEIGHTS)) {
    random -= weight
    if (random <= 0) {
      return rarity as keyof typeof RARITY_WEIGHTS
    }
  }

  return "commun"
}

/**
 * 🎲 Generates random coordinates within the world boundaries
 */
export function generateRandomPosition(): { x: number, y: number } {
  const x = Math.floor(Math.random() * (WORLD_GRID.MAX_COORDINATE - WORLD_GRID.MIN_COORDINATE + 1)) + WORLD_GRID.MIN_COORDINATE
  const y = Math.floor(Math.random() * (WORLD_GRID.MAX_COORDINATE - WORLD_GRID.MIN_COORDINATE + 1)) + WORLD_GRID.MIN_COORDINATE
  
  console.log(`🎯 Generated random position: (${x}, ${y})`)
  return { x, y }
}