import { RARITY_WEIGHTS, WORLD_GRID, ATMOSPHERIC_NOISE_CONFIG, AtmosphericLayer } from "./constants/world"

// 🌊 Perlin Noise Implementation for Atmospheric Data
class PerlinNoise {
  private permutation: number[] = []
  
  constructor(seed: number = 0) {
    // Initialize permutation table with seed
    const p = new Array(256)
    for (let i = 0; i < 256; i++) p[i] = i
    
    // Shuffle with seed
    let random = seed
    for (let i = 255; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280
      const j = Math.floor((random / 233280) * (i + 1))
      ;[p[i], p[j]] = [p[j], p[i]]
    }
    
    // Duplicate for overflow
    this.permutation = [...p, ...p]
  }
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a)
  }
  
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 3
    const u = h < 2 ? x : y
    const v = h < 2 ? y : x
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
  
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255
    const Y = Math.floor(y) & 255
    
    x -= Math.floor(x)
    y -= Math.floor(y)
    
    const u = this.fade(x)
    const v = this.fade(y)
    
    const A = this.permutation[X] + Y
    const AA = this.permutation[A]
    const AB = this.permutation[A + 1]
    const B = this.permutation[X + 1] + Y
    const BA = this.permutation[B]
    const BB = this.permutation[B + 1]
    
    return this.lerp(v,
      this.lerp(u, this.grad(this.permutation[AA], x, y),
                   this.grad(this.permutation[BA], x - 1, y)),
      this.lerp(u, this.grad(this.permutation[AB], x, y - 1),
                   this.grad(this.permutation[BB], x - 1, y - 1))
    )
  }
}

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

// 🌊 Atmospheric System - Perlin Noise Functions

/**
 * 🕒 Calculates current time offset for atmospheric animation
 */
function getCurrentTimeOffset(): number {
  const now = Date.now()
  const hours = now / (1000 * 60 * 60) // Convert to hours
  return Math.floor(hours / ATMOSPHERIC_NOISE_CONFIG.ANIMATION_INTERVAL_HOURS)
}

/**
 * 🌊 Generates noise value for a specific atmospheric layer at given coordinates
 */
function getNoiseValue(
  layer: AtmosphericLayer,
  x: number,
  y: number,
  timeOffset: number = getCurrentTimeOffset()
): number {
  const config = ATMOSPHERIC_NOISE_CONFIG
  const noise = new PerlinNoise(config.SEEDS[layer])
  
  // Apply scale and time animation
  const scaledX = x * config.SCALES[layer]
  const scaledY = y * config.SCALES[layer] 
  const animationOffset = timeOffset * config.ANIMATION_SPEEDS[layer]
  
  // Generate noise with time offset for animation
  const rawNoise = noise.noise(scaledX + animationOffset, scaledY + animationOffset)
  
  // Normalize to 0-1 range
  return (rawNoise + 1) / 2
}

/**
 * 🌡️ Calculates all atmospheric values for a world cell
 */
export function calculateAtmosphericData(
  x: number,
  y: number,
  timeOffset: number = getCurrentTimeOffset()
): {
  humidity: number
  temperature: number
  pressure: number
  turbulence: number
} {
  return {
    humidity: getNoiseValue('HUMIDITY', x, y, timeOffset),
    temperature: getNoiseValue('TEMPERATURE', x, y, timeOffset),
    pressure: getNoiseValue('PRESSURE', x, y, timeOffset),
    turbulence: getNoiseValue('TURBULENCE', x, y, timeOffset)
  }
}

/**
 * 🎨 Visualizes atmospheric data for debugging
 */
export function visualizeAtmosphericData(
  centerX: number = 0,
  centerY: number = 0,
  size: number = 10
): void {
  console.log(`🌊 Atmospheric Data Visualization around (${centerX}, ${centerY})`)
  console.log("=" + "=".repeat(50))
  
  const timeOffset = getCurrentTimeOffset()
  
  for (let y = centerY - size; y <= centerY + size; y++) {
    let row = ""
    for (let x = centerX - size; x <= centerX + size; x++) {
      const data = calculateAtmosphericData(x, y, timeOffset)
      // Show humidity as visualization (H=high, M=medium, L=low)
      const humidityLevel = data.humidity < 0.33 ? 'L' : data.humidity < 0.66 ? 'M' : 'H'
      row += humidityLevel + " "
    }
    console.log(`Y ${y.toString().padStart(3)}: ${row}`)
  }
  
  console.log("=" + "=".repeat(50))
  console.log("🌊 Legend: L=Low Humidity, M=Medium, H=High")
}



/**
 * 🧪 Demo function to test the atmospheric data system
 */
export function demonstrateAtmosphericSystem(): void {
  console.log("🌊 Atmospheric Data Demo")
  console.log("=" + "=".repeat(60))
  
  const testCells = [
    { x: 0, y: 0, title: "Centre Urbain", description: "Un croisement de routes abandonnées", mapCharacter: "+" },
    { x: 5, y: 0, title: "Champ en Friche", description: "Un ancien champ de blé retourné à l'état sauvage", mapCharacter: "~" },
    { x: -3, y: 2, title: "Station-Service", description: "Une station-service déserte aux pompes rouillées", mapCharacter: "#" },
  ]
  
  const timeOffset = getCurrentTimeOffset()
  
  testCells.forEach(cell => {
    const atmospheric = calculateAtmosphericData(cell.x, cell.y, timeOffset)
    
    console.log(`📍 ${cell.title} (${cell.x}, ${cell.y})`)
    console.log(`   🌡️ Temperature: ${atmospheric.temperature.toFixed(2)}`)
    console.log(`   💧 Humidity: ${atmospheric.humidity.toFixed(2)}`)
    console.log(`   🌊 Pressure: ${atmospheric.pressure.toFixed(2)}`)
    console.log(`   🌪️ Turbulence: ${atmospheric.turbulence.toFixed(2)}`)
    console.log("")
  })
  
  console.log("⏰ Time offset: " + timeOffset + " (changes every 3 hours)")
  console.log("🌊 These atmospheric values could be used for future features!")
  console.log("=" + "=".repeat(60))
}