// 🌍 World Configuration Constants

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

// 🗺️ World grid settings (for future expansion)
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

// 🎮 Rarity types for TypeScript
export type RarityType = keyof typeof RARITY_WEIGHTS
