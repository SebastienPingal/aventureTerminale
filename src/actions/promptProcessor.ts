"use server"

import { GENERATION_CONFIG } from "@/lib/constants/ai"
import Together from "together-ai"
import { RARITY_EXPLANATIONS } from "@/lib/constants/world"
import { ExtendedWorldCell, Loot, UserTrace, UserTraceType } from "@/lib/types"
import { randomRarity } from "@/lib/helper"
import { createJournalEntry, getUserJournalEntries } from "./journalEntry"
import { JournalEntryType } from "@prisma/client"
import { getUser, updateUser } from "./user"
import { fetchWorldCell, createWorldCell, updateWorldCell } from "./worldCell"
import { createUserTrace } from "./traces"
import { createAndAddObjectToInventory } from "./object"
import { ExtendedUser } from "@/lib/types"

const together = new Together()

export interface PromptResponse {
  narration: string
  actions?: string[]
  newWorldCell?: Partial<ExtendedWorldCell>
  updateWorldCell?: Partial<ExtendedWorldCell>
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
    currentCell?: ExtendedWorldCell
    surroundingCells?: {
      north?: ExtendedWorldCell // Updated to ExtendedWorldCell since they include traces
      south?: ExtendedWorldCell
      east?: ExtendedWorldCell
      west?: ExtendedWorldCell
    }
  }
): Promise<PromptResponse> {
  console.log('🤖 Processing prompt with AI:', userInput)

  const rarity = randomRarity()
  const rarityExplanation = RARITY_EXPLANATIONS[rarity as keyof typeof RARITY_EXPLANATIONS]

  // Helper function to format traces
  const formatTraces = (traces?: Array<UserTrace>) => {
    if (!traces || traces.length === 0) return "Aucune trace"

    return traces
      .filter(trace => new Date(trace.expiresAt) > new Date()) // Only active traces
      .map(trace => {
        const traceInfo = `${trace.traceType}`
        if (trace.description) {
          return `${traceInfo}: ${trace.description}`
        }
        return traceInfo
      })
      .join(", ") || "Aucune trace active"
  }

  const systemPrompt = `
Tu es un maître de jeu pour une aventure textuelle dans un monde post-apocalyptique désertique.
Le monde est ancien, désolé, sans vie. L'ambiance est contemplative et mystérieuse, sans violence.
Tu vouvoies le joueur.

CONTEXTE ACTUEL:
- Lieu actuel: ${context?.currentCell?.title} - ${context?.currentCell?.description}
- Traces présentes: ${formatTraces(context?.currentCell?.traces)}
- Cellules environnantes:
  Nord: ${context?.surroundingCells?.north?.title || 'Inconnu'} - ${context?.surroundingCells?.north?.description || 'Inconnu'}
    Traces: ${formatTraces(context?.surroundingCells?.north?.traces)}
  Sud: ${context?.surroundingCells?.south?.title || 'Inconnu'} - ${context?.surroundingCells?.south?.description || 'Inconnu'}
    Traces: ${formatTraces(context?.surroundingCells?.south?.traces)}
  Est: ${context?.surroundingCells?.east?.title || 'Inconnu'} - ${context?.surroundingCells?.east?.description || 'Inconnu'}
    Traces: ${formatTraces(context?.surroundingCells?.east?.traces)}
  Ouest: ${context?.surroundingCells?.west?.title || 'Inconnu'} - ${context?.surroundingCells?.west?.description || 'Inconnu'}
    Traces: ${formatTraces(context?.surroundingCells?.west?.traces)}
- Inventaire: ${context?.playerInventory?.map(item => `${item.name} - ${item.description}`).join(", ")}

INSTRUCTIONS:
1. Analyse l'action du joueur
2. Si mouvement vers cellule inexistante, génère-la avec rareté appropriée
3. Si le joueur récupère un objet, crée-le
4. Fournis une narration complète et immersive
5. Considère l'influence des cellules environnantes sur la génération
6. Si le joueur fait quelque chose qui pourrait laisser une trace signifiante, génère une trace avec le type approprié
7. Si le joueur fait quelque chose qui impacterait majoritairement la cellule, modifie la description de la cellule, et le titre si nécessaire
8. **IMPORTANT**: Mentionne les traces visibles dans ta narration quand c'est pertinent (empreintes, objets abandonnés, messages, etc.) si il n'y en a pas, ne mentionne pas les traces

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
  "updateWorldCell": {
    "title": "string",
    "description": "string (max ${GENERATION_CONFIG.MAX_DESCRIPTION_WORDS} mots)",
    "mapCharacter": "single ASCII char",
  } | null, // null si le joueur ne modifie pas la cellule
  "newTrace": {
    "type": "LOOT" | "MESSAGE" | "OTHER",
    "description": "string (max ${GENERATION_CONFIG.MAX_DESCRIPTION_WORDS} mots)", // description de la trace et du message si type est MESSAGE
  } | null, // null si le joueur ne laisse pas de trace
  "newObject": {
    "name": "string",
    "description": "string (max ${GENERATION_CONFIG.MAX_DESCRIPTION_WORDS} mots)",
  } | null, // null si le joueur ne récupère pas d'objet
  "narration": "Réponse immersive complète au joueur en te basant sur le contexte actuel et l'input du joueur. Mentionne les traces visibles si pertinent."
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

/**
 * 🚀 COMPREHENSIVE: Handles the entire prompt processing workflow server-side
 * This prevents issues with page refreshes interrupting the process
 */
export async function processUserPrompt(
  userId: string,
  prompt: string
): Promise<{
  success: boolean
  message?: string
  shouldRefreshData?: boolean
}> {
  try {
    console.log('🚀 Starting comprehensive prompt processing for user:', userId)

    // 1. Create journal entry for the prompt
    await createJournalEntry(userId, prompt, JournalEntryType.PROMPT)

    // 2. Get user data and context
    const user = await getUser({ id: userId })
    if (!user) {
      throw new Error('User not found')
    }

    // Get surrounding cells for context
    const surroundingCells: { north?: ExtendedWorldCell, south?: ExtendedWorldCell, east?: ExtendedWorldCell, west?: ExtendedWorldCell } = {}
    if (user.worldCell) {
      const [north, south, east, west] = await Promise.all([
        fetchWorldCell(user.worldCell.x, user.worldCell.y + 1),
        fetchWorldCell(user.worldCell.x, user.worldCell.y - 1),
        fetchWorldCell(user.worldCell.x + 1, user.worldCell.y),
        fetchWorldCell(user.worldCell.x - 1, user.worldCell.y)
      ])

      surroundingCells.north = north || undefined
      surroundingCells.south = south || undefined
      surroundingCells.east = east || undefined
      surroundingCells.west = west || undefined
    }

    // Get recent journal entries for context
    const recentJournal = await getUserJournalEntries(userId)

    const context = {
      user: user,
      currentLocation: user.worldCell?.title,
      previousMessages: recentJournal.slice(-6).map(entry => entry.content),
      playerInventory: user.inventory,
      currentCell: user.worldCell || undefined,
      surroundingCells: surroundingCells
    }

    // 3. Process prompt with AI
    const aiResponse = await processPrompt(prompt, context)

    // 4. Execute all commands in sequence (server-side)
    await executeCommandsServerSide(aiResponse, user)

    // 5. Create response journal entry
    await createJournalEntry(userId, aiResponse.narration, JournalEntryType.RESPONSE)

    console.log('✅ Comprehensive prompt processing completed successfully')
    return {
      success: true,
      shouldRefreshData: true
    }

  } catch (error) {
    console.error('❌ Error in comprehensive prompt processing:', error)

    // Create error journal entry
    try {
      await createJournalEntry(userId, 'Une erreur est survenue lors du traitement de votre demande.', JournalEntryType.ERROR)
    } catch (journalError) {
      console.error('❌ Error creating error journal entry:', journalError)
    }

    return {
      success: false,
      message: 'Une erreur est survenue lors du traitement de votre demande.',
      shouldRefreshData: true
    }
  }
}

/**
 * 🎯 Server-side command execution (moved from client-side executeCommand)
 */
async function executeCommandsServerSide(
  aiResponse: PromptResponse,
  user: ExtendedUser
): Promise<void> {
  if (!user.worldCell) {
    throw new Error('User has no world cell')
  }

  // Handle movement actions
  if (aiResponse.actions?.includes('move_north')) {
    const newY = user.worldCell.y + 1
    await handleMovement(user, user.worldCell.x, newY, 'north', aiResponse)
  } else if (aiResponse.actions?.includes('move_south')) {
    const newY = user.worldCell.y - 1
    await handleMovement(user, user.worldCell.x, newY, 'south', aiResponse)
  } else if (aiResponse.actions?.includes('move_east')) {
    const newX = user.worldCell.x + 1
    await handleMovement(user, newX, user.worldCell.y, 'east', aiResponse)
  } else if (aiResponse.actions?.includes('move_west')) {
    const newX = user.worldCell.x - 1
    await handleMovement(user, newX, user.worldCell.y, 'west', aiResponse)
  }

  // Handle new objects
  if (aiResponse.newObject) {
    console.log('🎒 Processing new object from AI:', aiResponse.newObject)
    await createAndAddObjectToInventory(user.id, {
      name: aiResponse.newObject.name || "",
      description: aiResponse.newObject.description || ""
    })
    console.log('✅ Loot successfully added to inventory')
  }

  // Handle new traces
  if (aiResponse.newTrace) {
    console.log('👣 Processing new trace from AI:', aiResponse.newTrace)
    await createUserTrace(
      user.id,
      user.worldCell.id,
      aiResponse.newTrace.type,
      aiResponse.newTrace.description || ""
    )
    console.log('✅ Trace successfully created')
  }

  // Handle world cell update
  if (aiResponse.updateWorldCell) {
    console.log('🏗️ Processing world cell update from AI:', aiResponse.updateWorldCell)
    await updateWorldCell(user.worldCell.id, {
      title: aiResponse.updateWorldCell.title,
      description: aiResponse.updateWorldCell.description,
      mapCharacter: aiResponse.updateWorldCell.mapCharacter
    })
    console.log('✅ World cell successfully updated')
  }
}

/**
 * 🏃 Handle user movement with world cell creation
 */
async function handleMovement(
  user: ExtendedUser,
  newX: number,
  newY: number,
  direction: string,
  aiResponse: PromptResponse
): Promise<void> {
  try {
    // Check if target cell exists, create if needed
    let targetCell = await fetchWorldCell(newX, newY)

    if (!targetCell && aiResponse.newWorldCell) {
      console.log(`🏗️ Creating new world cell at (${newX},${newY})`)
      targetCell = await createWorldCell(
        newX,
        newY,
        aiResponse.newWorldCell.mapCharacter || ".",
        aiResponse.newWorldCell.title || "Unknown",
        aiResponse.newWorldCell.description || "A mysterious place"
      )
    }

    if (!targetCell) {
      throw new Error(`Failed to create or find world cell at (${newX},${newY})`)
    }

    // Create movement trace at current location
    if (user.worldCell) {
      await createUserTrace(
        user.id,
        user.worldCell.id,
        'FOOTPRINT',
        `Moved ${direction}`
      )
    }

    // Move user to new cell
    await updateUser({ id: user.id }, {
      worldCell: { connect: { x_y: { x: newX, y: newY } } }
    })

    console.log(`🏜️ User moved ${direction} to (${newX},${newY})`)

  } catch (error) {
    console.error(`❌ Error handling movement ${direction}:`, error)
    throw error
  }
} 