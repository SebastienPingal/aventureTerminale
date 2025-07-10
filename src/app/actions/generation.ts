"use server"

import { WorldCell } from "@/lib/types"
import Together from "together-ai"

const apiKey = process.env.MISTRAL_API_KEY;
const together = new Together()

function randomRarity(): string {
  const rarityWeights = {
    "commun": 80,
    "peu commun": 20,
    "rare": 5,
    "epique": 1,
    "légendaire": 0.05,
  }

  const totalWeight = Object.values(rarityWeights).reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    random -= weight;
    if (random <= 0) {
      return rarity as keyof typeof rarityWeights;
    }
  }

  return "common";
}

// // 🎨 Éléments aléatoires pour diversifier la génération
// function getRandomElements() {
//   const materials = ["métal rouillé", "pierre érodée", "béton fissuré", "bois pourri", "verre brisé", "terre battue", "sable fin", "gravats", "cendres"]
//   const atmospheres = ["silence pesant", "écho lointain", "brume légère", "vent constant", "immobilité totale", "vibrations sourdes", "murmures du vent", "craquements discrets"]
//   const temporalMarkers = ["vestiges d'avant", "traces du passé", "marques du temps", "souvenirs figés", "empreintes anciennes", "cicatrices temporelles"]
//   const sensoryElements = ["odeur métallique", "goût de poussière", "texture rugueuse", "résonnance creuse", "reflets ternes", "ombres étranges"]

//   return {
//     material: materials[Math.floor(Math.random() * materials.length)],
//     atmosphere: atmospheres[Math.floor(Math.random() * atmospheres.length)],
//     temporal: temporalMarkers[Math.floor(Math.random() * temporalMarkers.length)],
//     sensory: sensoryElements[Math.floor(Math.random() * sensoryElements.length)],
//     seed: Math.floor(Math.random() * 10000)
//   }
// }

const explanations = {
  "commun": "Un lieu commun, banal et réaliste du monde d'avant. Abandonné depuis longtemps mais reconnaissable. Exemple : une station-service vide, un parking désert, une route craquelée, un champ en friche, un pont routier",
  "peu commun": "Un lieu peu commun mais toujours réaliste, avec un détail intrigant. Exemple : une pharmacie avec ses étagères encore pleines, un cinéma avec l'affiche du dernier film, une école avec un tableau encore écrit, une maison avec la table encore mise",
  "rare": "Un lieu rare mais ancré dans la réalité, avec un élément qui pose question. Exemple : un hôpital avec une salle d'opération prête, une banque avec son coffre entrouvert, une usine avec ses machines encore en marche, un commissariat avec ses dossiers éparpillés",
  "epique": "Un lieu epique, avec énormément d'intérêt et qui peut influencer les lieux environnants, ou etre a l'origine d'un évenement. Exemple : un château qui émet un brouillard, une base militaire désafectée dont une syrene sonne, l'entrée d'une bunker qui émet sur une fréquence radio, une tour radio qui émet un signal, un parc d'attraction qui est toujours en marche",
  "légendaire": "Un lieu legendaire, avec énormément d'intérêt qui apporte une dimension plus mystique et qui peut influencer les lieux environnants, ou etre a l'origine d'un évenement. Exemple : Un rituel de magie encore en cours qui fait perdre progressivement des couleurs aux lieux environnants, un maison avec des apparitions, une école ou l'on entend des enfants mais on ne les voit jamais et qui se balade dans les lieux environnants..."
}

export async function generateWorldCell(): Promise<{
  title: string
  description: string
  mapCharacter: string
  rarity: string
}> {
  const rarity = randomRarity()
  console.log('🚜 rarity', rarity)
  const rarityExplanation = explanations[rarity as keyof typeof explanations]
  console.log('🚜 rarityExplanation', rarityExplanation)

  // 🏗️ Adapter le ton selon la rareté
  const isRealistic = ['commun', 'peu commun', 'rare'].includes(rarity)
  const mysticalInstruction = isRealistic 
    ? "RESTE ANCRÉ DANS LA RÉALITÉ. Évite tout élément fantastique, magique ou surnaturel. Le lieu doit être plausible dans notre monde abandonné."
    : "Tu peux ajouter des éléments mystiques et oniriques pour ce niveau de rareté."

  const prompt = `
  Tu vas créer, inventer un lieu UNIQUE et ORIGINAL pour un jeu de role.
  IMPORTANT: Sois créatif et évite les clichés. Chaque lieu doit être différent des précédents.
  
  Contexte: Un monde apocalyptique très ancien, désolé et désert. Aucune forme de vie. Les joueurs sont seuls.
  Ambiance: Pas de violence, pas de méchant, pas de danger. Beaucoup de mystère et de contemplation.
  seed créatif: ${Math.floor(Math.random() * 10000)}
  
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
    "description": "Description immersive en 25 mots maximum",
    "mapCharacter": "caractère ASCII qui ressemble au lieu. PAS D'ÉMOJIS !!"
  }
  `

  const response = await together.chat.completions.create({
    model: "deepseek-ai/DeepSeek-V3",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.9, // 🎲 Augmente la créativité
    top_p: 0.95,
  })

  // console.log('🎨 Éléments aléatoires utilisés:', randomElements)
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