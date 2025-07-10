"use server"

import { RARITY_WEIGHTS, RARITY_EXPLANATIONS } from "@/lib/constants/world"
import { GENERATION_CONFIG } from "@/lib/constants/ai"
import Together from "together-ai"

const together = new Together()

function randomRarity(): string {
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

export async function generateWorldCell(): Promise<{
  title: string
  description: string
  mapCharacter: string
  rarity: string
}> {
  const rarity = randomRarity()
  console.log('🚜 rarity', rarity)
  const rarityExplanation = RARITY_EXPLANATIONS[rarity as keyof typeof RARITY_EXPLANATIONS]
  console.log('🚜 rarityExplanation', rarityExplanation)

  // 🏗️ Adapter le ton selon la rareté
  const isRealistic = GENERATION_CONFIG.REALISTIC_RARITIES.includes(rarity)
  const mysticalInstruction = isRealistic
    ? "RESTE ANCRÉ DANS LA RÉALITÉ. Évite tout élément fantastique, magique ou surnaturel. Le lieu doit être plausible dans notre monde abandonné."
    : "Tu peux ajouter des éléments mystiques et oniriques pour ce niveau de rareté."

  const prompt = `
  Tu vas créer, inventer un lieu UNIQUE et ORIGINAL pour un jeu de role.
  IMPORTANT: Sois créatif et évite les clichés. Chaque lieu doit être différent des précédents.
  
  Contexte: Un monde apocalyptique très ancien, désolé et désert. Aucune forme de vie. Les joueurs sont seuls.
  Ambiance: Pas de violence, pas de méchant, pas de danger. Beaucoup de mystère et de contemplation.
  seed créatif: ${Math.floor(Math.random() * GENERATION_CONFIG.CREATIVE_SEED_RANGE)}
  
  ${mysticalInstruction}
  
  Rareté du lieu: ${rarityExplanation}
  
  EXIGENCES:
  - Le lieu doit être traversable
  - Le lieu doit être une zone de jeu, pas un objet
  - Apporte une touche unique qui le distingue
  - Évite les noms génériques comme "Plaine de..."
  - Sois inventif avec les détails
  - Le lieu doit etre unique et original
  - Ne fait pas de référence a l'heure qu'il est, au soleil, ou a la météo
  ${isRealistic ? '- RÉALISME OBLIGATOIRE: Pas de magie, pas de surnaturel, juste des vestiges du monde d\'avant' : ''}
  
  Format de réponse JSON:
  {
    "title": "Nom unique et évocateur du lieu",
    "description": "Description immersive en ${GENERATION_CONFIG.MAX_DESCRIPTION_WORDS} mots maximum",
    "mapCharacter": "caractère ASCII qui ressemble au lieu. PAS D'ÉMOJIS !!"
  }
  `

  const response = await together.chat.completions.create({
    model: GENERATION_CONFIG.AI_MODEL,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: GENERATION_CONFIG.TEMPERATURE,
    top_p: GENERATION_CONFIG.TOP_P,
  })

  console.log('💌 response', response)

  const json = response.choices[0]?.message?.content
  console.log('📉 json', json)

  if (!json) {
    throw new Error("No content received from API")
  }

  const parsedJson = JSON.parse(json)
  console.log('📉 parsedJson', parsedJson)

  return {
    title: parsedJson.title,
    description: parsedJson.description,
    mapCharacter: parsedJson.mapCharacter,
    rarity: rarity,
  }
}