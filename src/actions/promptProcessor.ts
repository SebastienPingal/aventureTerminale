"use server"

import { GENERATION_CONFIG } from "@/lib/constants/ai"
import Together from "together-ai"
import { RARITY_EXPLANATIONS } from "@/lib/constants/world"
import { Loot, UserTraceType, WorldCell } from "@/lib/types"
import { randomRarity } from "@/lib/helper"

const together = new Together()

export interface PromptResponse {
  narration: string
  actions?: string[]
  newWorldCell?: Partial<WorldCell>
  newObject?: Loot
  newTrace?: {
    type: UserTraceType
    description: string
  }
}

export async function processPrompt(
  userInput: string,
  context?: {
    currentLocation?: string
    previousMessages?: string[]
    playerPosition?: {
      x: number
      y: number
    }
    playerInventory?: Loot[]
    currentCell?: WorldCell
    surroundingCells?: {
      north?: WorldCell
      south?: WorldCell
      east?: WorldCell
      west?: WorldCell
    }
  }
): Promise<PromptResponse> {
  console.log('🤖 Processing prompt with AI:', userInput)

  const rarity = randomRarity()
  const rarityExplanation = RARITY_EXPLANATIONS[rarity as keyof typeof RARITY_EXPLANATIONS]

  const systemPrompt = `
Tu es un maître de jeu pour une aventure textuelle dans un monde post-apocalyptique désertique.
Le monde est ancien, désolé, sans vie. L'ambiance est contemplative et mystérieuse, sans violence.
Tu vouvoies le joueur.

CONTEXTE ACTUEL:
- Lieu actuel: ${context?.currentCell?.title} - ${context?.currentCell?.description}
- Cellules environnantes:
  Nord: ${context?.surroundingCells?.north?.title || 'Inconnu'} - ${context?.surroundingCells?.north?.description || 'Inconnu'}
  Sud: ${context?.surroundingCells?.south?.title || 'Inconnu'} - ${context?.surroundingCells?.south?.description || 'Inconnu'}
  Est: ${context?.surroundingCells?.east?.title || 'Inconnu'} - ${context?.surroundingCells?.east?.description || 'Inconnu'}
  Ouest: ${context?.surroundingCells?.west?.title || 'Inconnu'} - ${context?.surroundingCells?.west?.description || 'Inconnu'}

INSTRUCTIONS:
1. Analyse l'action du joueur
2. Si mouvement vers cellule inexistante, génère-la avec rareté appropriée
3. Si le joueur récupère un objet, crée-le
4. Fournis une narration complète et immersive
5. Considère l'influence des cellules environnantes sur la génération
6. Si le joueur fait quelque chose qui pourrait laisser une trace signifiante, génère une trace avec le type approprié

La rareté est la suivante :
${rarityExplanation}

Réponds TOUJOURS en JSON avec cette structure:
{
  "actions": ["move_north" | "move_south" | "move_east" | "move_west" | null], // there could be multiple actions, if player doesn't specify the direction, move north
  "newWorldCell": {
    "title": "string",
    "description": "string (max ${GENERATION_CONFIG.MAX_DESCRIPTION_WORDS} mots)",
    "mapCharacter": "single ASCII char",
  } | null, // null si le joueur ne bouge pas ou se déplace dans une cellule existante
  "newTrace": {
    "type": "LOOT" | "MESSAGE" | "OTHER",
    "description": "string (max ${GENERATION_CONFIG.MAX_DESCRIPTION_WORDS} mots)",
  } | null, // null si le joueur ne laisse pas de trace
  "newObject": {
    "name": "string",
    "description": "string (max ${GENERATION_CONFIG.MAX_DESCRIPTION_WORDS} mots)",
  } | null, // null si le joueur ne récupère pas d'objet
  "narration": "Réponse immersive complète au joueur en te basant sur le contexte actuel et l'input du joueur"
}

Contexte actuel: ${context?.currentLocation || 'Début de l\'aventure'}
Sois créatif et immersif dans tes réponses.
`

  try {
    const response = await together.chat.completions.create({
      model: GENERATION_CONFIG.AI_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInput }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      top_p: 0.9,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from AI")
    }

    const result = JSON.parse(content) as PromptResponse
    console.log('🎯 AI Response:', result)

    return result

  } catch (error) {
    console.error('❌ Error processing prompt:', error)
    return {
      narration: 'Le vent a emporté votre demande. Veuillez réessayer.',
    }
  }
} 