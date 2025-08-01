// 🌍 World Configuration Constants

export const ASCII_ART = `
        :::    ::: ::::    :::      :::::::::  :::::::::: ::::::::  :::::::::: ::::::::: ::::::::::: 
        :+:    :+: :+:+:   :+:      :+:    :+: :+:       :+:    :+: :+:        :+:    :+:    :+:     
        +:+    +:+ :+:+:+  +:+      +:+    +:+ +:+       +:+        +:+        +:+    +:+    +:+     
        +#+    +:+ +#+ +:+ +#+      +#+    +:+ +#++:++#  +#++:++#++ +#++:++#   +#++:++#:     +#+     
        +#+    +#+ +#+  +#+#+#      +#+    +#+ +#+              +#+ +#+        +#+    +#+    +#+     
        #+#    #+# #+#   #+#+#      #+#    #+# #+#       #+#    #+# #+#        #+#    #+#    #+#     
         ########  ###    ####      #########  ########## ########  ########## ###    ###    ###     
  
`

export const INTRO_TEXT = 'Vous vous réveillez dans un lieu inconnu, vous ne vous souvenez de rien. Autour de vous, tout est calme et désolé.'

// 🎲 Rarity system for world cell generation
export const RARITY_WEIGHTS = {
  "commun": 80,
  "peu commun": 20,
  "rare": 5,
  "epique": 1,
  "légendaire": 0.05,
} as const

export const RARITY_EXPLANATIONS = {
  "commun": "Un lieu commun, banal et réaliste du monde d'avant. Abandonné depuis longtemps mais reconnaissable. Exemple : une station-service vide, un parking désert, une route craquelée, un champ en friche, un pont routier",
  "peu commun": "Un lieu peu commun mais toujours réaliste, avec un détail intrigant. Exemple : une pharmacie avec ses étagères encore pleines, un cinéma avec l'affiche du dernier film, une école avec un tableau encore écrit, une maison avec la table encore mise",
  "rare": "Un lieu rare mais ancré dans la réalité, avec un élément qui pose question. Exemple : un hôpital avec une salle d'opération prête, une banque avec son coffre entrouvert, une usine avec ses machines encore en marche, un commissariat avec ses dossiers éparpillés",
  "epique": "Un lieu epique, avec énormément d'intérêt et qui peut influencer les lieux environnants, ou etre a l'origine d'un évenement. Exemple : un château qui émet un brouillard, une base militaire désafectée dont une syrene sonne, l'entrée d'une bunker qui émet sur une fréquence radio, une tour radio qui émet un signal, un parc d'attraction qui est toujours en marche",
  "légendaire": "Un lieu legendaire, avec énormément d'intérêt qui apporte une dimension plus mystique et qui peut influencer les lieux environnants, ou etre a l'origine d'un évenement. Exemple : Un rituel de magie encore en cours qui fait perdre progressivement des couleurs aux lieux environnants, un maison avec des apparitions, une école ou l'on entend des enfants mais on ne les voit jamais et qui se balade dans les lieux environnants..."
} as const

export const REALISTIC_RARITIES = ['commun', 'peu commun', 'rare']

// 🎨 Random elements for generation diversity (commented for future use)
export const GENERATION_ELEMENTS = {
  MATERIALS: ["métal rouillé", "pierre érodée", "béton fissuré", "bois pourri", "verre brisé", "terre battue", "sable fin", "gravats", "cendres"],
  ATMOSPHERES: ["silence pesant", "écho lointain", "brume légère", "vent constant", "immobilité totale", "vibrations sourdes", "murmures du vent", "craquements discrets"],
  TEMPORAL_MARKERS: ["vestiges d'avant", "traces du passé", "marques du temps", "souvenirs figés", "empreintes anciennes", "cicatrices temporelles"],
  SENSORY_ELEMENTS: ["odeur métallique", "goût de poussière", "texture rugueuse", "résonnance creuse", "reflets ternes", "ombres étranges"]
} as const

// Add to src/lib/constants/world.ts
export const STARTER_LOCATIONS = [
  {
    title: "L'Ancienne Route",
    description: "Une route goudronnée craquelée serpente à travers le paysage désolé. Les lignes blanches s'effacent par endroits, et de mauvaises herbes percent l'asphalte fissuré. Des débris de verre scintillent sur les bas-côtés, vestiges de véhicules depuis longtemps disparus. Le silence n'est troublé que par le sifflement occasionnel du vent entre les fissures.",
    mapCharacter: "=",
    rarity: "commun"
  },
  {
    title: "La Station-Service Abandonnée",
    description: "Une station-service déserte se dresse comme un fantôme du passé. Les pompes à essence, couvertes de rouille et de graffitis délavés, pointent vers un ciel indifférent. La vitrine du magasin, fissurée en toile d'araignée, laisse entrevoir des étagères vides et poussiéreuses. Un panneau publicitaire à demi effondré grince dans la brise.",
    mapCharacter: "#",
    rarity: "commun"
  },
  {
    title: "Le Parking Oublié",
    description: "Un vaste parking en béton s'étend dans un silence pesant. Des lignes de stationnement fantômes dessinent un quadrillage régulier sur la surface grise, tandis que des touffes d'herbe sauvage émergent des fissures. Quelques lampadaires tordus se dressent comme des sentinelles muettes, leurs ampoules depuis longtemps brisées par les intempéries.",
    mapCharacter: "□",
    rarity: "commun"
  },
  {
    title: "Le Champ en Friche",
    description: "Un ancien champ cultivé retourne lentement à l'état sauvage. Des sillons encore visibles dessinent des lignes irrégulières dans la terre durcie. Des épis de blé sauvage dansent mollement au gré du vent, mêlés à une végétation anarchique. Au loin, les vestiges rouillés d'un tracteur abandonné émergent de la végétation comme les ossements d'un géant endormi.",
    mapCharacter: "~",
    rarity: "commun"
  },
  {
    title: "Le Pont de Béton",
    description: "Un pont routier enjambe une rivière paresseuse aux eaux troubles. Le garde-corps en métal présente de nombreuses brèches, et des stalactites de rouille s'accrochent sous la structure. L'écho des pas résonne étrangement dans ce corridor suspendu, où seules quelques hirondelles osent encore faire leur nid dans les recoins sombres.",
    mapCharacter: "╫",
    rarity: "commun"
  },
  {
    title: "L'Arrêt de Bus Solitaire",
    description: "Un abribus en plexiglas terne se dresse au bord d'une route déserte. Les horaires jaunis et déchirés flottent encore derrière la vitre craquelée, témoins d'une époque où les bus circulaient encore. Un banc en métal froid attend des voyageurs qui ne viendront plus, tandis que des feuilles mortes s'accumulent dans les coins de l'abri.",
    mapCharacter: "⌐",
    rarity: "commun"
  },
  {
    title: "La Clairière Silencieuse",
    description: "Une clairière naturelle s'ouvre dans ce qui fut autrefois une zone urbanisée. Des fondations de béton affleurent entre les herbes hautes, derniers vestiges de constructions disparues. Des arbres jeunes poussent entre les ruines, leurs racines s'insinuant dans les fissures du béton. L'air y est étrangement calme, comme si la nature reprenait ses droits avec une patience millénaire.",
    mapCharacter: "○",
    rarity: "commun"
  },
  {
    title: "Le Terrain Vague Urbain",
    description: "Un terrain vague parsemé de gravats et de débris métalliques s'étend entre des murs de béton lépreux. Des graffitis décolorés racontent des histoires depuis longtemps oubliées sur les parois taguées. Quelques poteaux électriques penchés créent un réseau désordonné de câbles pendants, et l'odeur de métal rouillé flotte dans l'air stagnant.",
    mapCharacter: "▓",
    rarity: "commun"
  },
  {
    title: "L'Ancien Passage Piéton",
    description: "Un passage piéton désaffecté traverse une avenue maintenant envahie par la végétation. Les bandes blanches, presque effacées, zigzaguent entre les nids-de-poule et les racines d'arbres. Des feux de circulation éteints se balancent au bout de leurs câbles, créant des ombres dansantes sur le bitume craquelé où poussent maintenant des pissenlits sauvages.",
    mapCharacter: "‡",
    rarity: "commun"
  },
  {
    title: "Le Carrefour Silencieux",
    description: "Un croisement de chemins où quatre routes convergent dans un silence absolu. Les panneaux indicateurs, rongés par les intempéries, affichent des directions vers des villes aux noms désormais illisibles. Un stop rouillé penche dangereusement, et des traces de pneus fantômes marquent encore le macadam, témoins des derniers passages d'une circulation depuis longtemps éteinte.",
    mapCharacter: "+",
    rarity: "commun"
  },
  {
    title: "L'Ancienne Aire de Repos",
    description: "Une aire de repos autoroutière abandonnée où subsistent quelques tables de pique-nique en béton, tachées par les intempéries. Des poubelles renversées gisent au sol, et un panneau d'information touristique délavé flotte au vent. L'ombre des arbres morts dessine des formes inquiétantes sur le sol craquelé, où seuls quelques insectes troublent encore le silence.",
    mapCharacter: "⌂",
    rarity: "commun"
  }
]

export const WORLD_GRID = {
  MAX_SIZE: 100,
  MIN_COORDINATE: -50,
  MAX_COORDINATE: 50,
  INITIAL_PLAYER_POSITION: { x: 0, y: 0 }
} as const

// 🎯 Map display settings
export const MAP_DISPLAY = {
  CELL_SIZE: 6,
  UNKNOWN_CHARACTER: '?',
  DEFAULT_VIEWPORT_SIZE: 20
} as const

// 🌊 Atmospheric System - Perlin Noise Configuration
export const ATMOSPHERIC_NOISE_CONFIG = {
  // Base seeds for different atmospheric layers
  SEEDS: {
    HUMIDITY: 12345,
    TEMPERATURE: 67890,
    PRESSURE: 54321,
    TURBULENCE: 98765
  },
  
  // Scale factors for noise (smaller = more zoomed out patterns)
  SCALES: {
    HUMIDITY: 0.05,      // Large moisture patterns
    TEMPERATURE: 0.03,    // Very large temperature zones  
    PRESSURE: 0.08,       // Medium pressure systems
    TURBULENCE: 0.12      // Smaller, more chaotic patterns
  },
  
  // Animation speeds (how much time offset affects each layer)
  ANIMATION_SPEEDS: {
    HUMIDITY: 0.1,        // Slow-moving moisture
    TEMPERATURE: 0.05,    // Very slow temperature changes
    PRESSURE: 0.15,       // Faster pressure changes
    TURBULENCE: 0.25      // Quick turbulence shifts
  },
  
  // How often the noise animates (in hours)
  ANIMATION_INTERVAL_HOURS: 3
} as const

// 🎮 Types for TypeScript
export type RarityType = keyof typeof RARITY_WEIGHTS
export type AtmosphericLayer = keyof typeof ATMOSPHERIC_NOISE_CONFIG.SEEDS
