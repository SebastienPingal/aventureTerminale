import { RARITY_WEIGHTS } from "./constants/world"

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