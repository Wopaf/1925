// ============================================================
//  VERSION DE L'APP (affichée sur l'écran de chargement)
// ============================================================
const APP_VERSION = '1.3.0';

// ============================================================
//  CONFIGURATION FIREBASE
// ============================================================
const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBsjr0peOj1jFPhAA080MWuUGlyYapjxn0",
    authDomain: "moviegame-1b838.firebaseapp.com",
    databaseURL: "https://moviegame-1b838-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "moviegame-1b838",
    storageBucket: "moviegame-1b838.firebasestorage.app",
    messagingSenderId: "448540908211",
    appId: "1:448540908211:web:894cb1e8c38d59c4a9eec6"
};

firebase.initializeApp(FIREBASE_CONFIG);
const auth = firebase.auth();
const db = firebase.database();

// ============================================================
//  CARD DEFINITIONS
// ============================================================
function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const RAW_CARDS = [
  ['Matthias-ChefMatthias', 'Chef Matthias', 'common'],
  ['Matthias-PleinLeCul', 'Matthias Plein le Cul', 'common'],
  ['Matthias-Pirate', 'Matthias Pirate', 'common'],
  ['Matthias-Pizzaiolo', 'Matthias Pizzaziolo', 'rare'],
  ['Matthias-3Cannes', 'Matthias 3 Cannes', 'epic'],
  ['Matthias-Puant', 'Matthias Puant', 'legendary'],

  ['Valentin-Cuisinier', 'Valentin Cuisinier', 'common'],
  ['Valentin-Crepier', 'Valentin Crêpier', 'rare'],
  ['Valentin-Informaticien', 'Valentin Informaticien', 'epic'],
  ['Valentin-YesLife', 'Valentin Yes Life', 'epic'],
  ['Valentin-Laitier', 'Valentin Laitier', 'legendary'],

  ['Denis-Cuisinier', 'Denis Cuisinier', 'common'],
  ['Denis-Sparring', 'Denis Sparring', 'rare'],
  ['Denis-Konoha', 'Denis de Konoha', 'rare'],
  ['Denis-Attrapeur', 'Denis Attrapeur de Mouche', 'epic'],
  ['Denis-Marines', 'Denis Marines', 'legendary'],

  ['Elodie-Cuisniere', 'Elodie Cuisinière', 'common'],
  ['Elodie-Carton', 'Elodie Carton', 'rare'],
  ['Elodie-Mention', 'Elodie Mention "Très Bien"', 'rare'],
  ['Elodie-Permis', 'Elodie Permis de sortir', 'epic'],
  ['Elodie-MC', 'Elodie MC L.O.D', 'legendary'],

  ['Anais-Receptioniste', 'Anaïs Réceptioniste', 'common'],
  ['Anais-DanceFloor', 'Anaïs Dancefloor', 'rare'],
  ['Anais-Camisole', 'Anaïs Camisole', 'epic'],
  ['Anais-Joker', 'Anaïs Joker', 'legendary'],

  ['Bichu-Plongeuse', 'Bichu Plongeuse', 'common'],
  ['Bichu-Baba', 'Bichu Baba Ganoush', 'rare'],
  ['Bichu-paleo', 'Bichu Paléolithique', 'epic'],
  ['Bichu-Camtard', 'Bichu Camtard', 'legendary'],

  ['Emilie-réceptioniste', 'Emilie Réceptioniste', 'common'],
  ['Emilie-Culturiste', 'Emilie Culturiste', 'rare'],
  ['Emilie-Docker', 'Emilie Docker', 'epic'],
  ['Emilie-Ardente', 'Emilie Ardente', 'legendary'],

  ['Louann-Serveuse', 'Louann Serveuse', 'common'],
  ['Louann-Taxi', 'Louann Taxi', 'rare'],
  ['Louann-Casino', 'Louann Casino', 'epic'],
  ['Louann-Fashion', 'Louann Fashion Week', 'legendary'],

  ['Louis-Serveur', 'Louis Serveur', 'common'],
  ['Louis-Fugitif', 'Louis Fugitif', 'rare'],
  ['Louis-Bonaparte', 'Louis Bonaparte', 'epic'],
  ['Louis-KO', 'Louis KO', 'epic'],
  ['Louis-3Vallees', 'Louis 3 Vallées', 'legendary'],

  ['Val-Salle', 'Val Salle', 'common'],
  ['Val-Sale', 'Val Sale', 'rare'],
  ['Val-Skibidi', 'Val Skibidi', 'epic'],
  ['Val-Raciste', 'Val Raciste', 'epic'],
  ['Val-NewBeach', 'Val New Beach', 'legendary'],
];

const CARD_DEFS = RAW_CARDS.map(([file, name, rarity]) => ({
  id: slugify(file),
  name,
  file: `${file}.png`,
  rarity,
  character: file.split('-')[0],
  type: 'character',
  extension: 'classic',
}));

// ============================================================
//  PERSONNAGES SPÉCIAUX (catégorie à part, ne suit pas le cycle
//  common/rare/epic/legendary d'un personnage classique)
// ============================================================
const RAW_SPECIAL_CARDS = [
  ['Gabin-maitre', 'Gabin Maître des horloges', 'legendary'],
  ['Johnny', 'Johnny 50 Euros', 'legendary'],
  ['Elodie-Fantome', 'Elodie Fantôme de Diane', 'legendary'],
  ['Mikoo-Furtif', 'Mikoo Furtif', 'common'],
  ['Tete-Sniper', "Tété Sniper d'Elite", 'epic'],
  ['Maho-SousSucre', 'Maho Sous Sucre', 'epic'],
  ['RomainUgo-3Cannes', 'Romain et Ugo 3 Cannes', 'rare'],
];

const SPECIAL_CARD_DEFS = RAW_SPECIAL_CARDS.map(([file, name, rarity]) => ({
  id: slugify(file),
  name,
  file: `${file}.png`,
  rarity,
  character: file.split('-')[0],
  type: 'special',
  extension: 'classic',
}));

// ============================================================
//  LIEUX (cartes de lieu à effet passif)
// ============================================================
// Chaque personnage est rattaché à un lieu ; ce lieu, une fois équipé,
// booste les chances d'obtenir les personnages qui lui sont liés.
const CHARACTER_LOCATIONS = {
  Matthias: 'cuisine',
  Valentin: 'cuisine',
  Denis: 'cuisine',
  Elodie: 'cuisine',
  Anais: 'reception',
  Bichu: 'cuisine',
  Emilie: 'reception',
  Louann: 'salle',
  Louis: 'salle',
  Val: 'salle',
};
const LOCATION_ICONS = { cuisine: '🍳', salle: '🍽️', reception: '🛎️' };
// Artwork des cartes lieu (facultatif tant que les visuels n'existent pas : fallback icône)
const LOCATION_CARD_FILES = { cuisine: 'La Cuisine.png', salle: 'La Salle.png', reception: 'La Réception.png' };
// Fond d'écran d'accueil affiché (N&B, 15% d'opacité) quand le lieu est équipé
const LOCATION_BG_FILES = { cuisine: 'Cuisine-BG.png', salle: 'Salle-BG.png', reception: 'Réception-BG.png' };
const JACUZZI_BG_FILE = 'Jacuzzi-BG.png';
const LOCATION_BONUS = 0.10; // +10% de chance relative pour les personnages du lieu équipé
const NEW_CARD_BONUS = 0.10; // +10% de chance relative pour les cartes non encore possédées (Le Jacuzzi)
const LOCATION_CARD_RARITY = 'rare';

const RAW_LOCATIONS = [
  ['cuisine', 'La Cuisine', "Offre un bonus de +10% de chance d'obtenir des personnages de la Cuisine dans vos prochains boosters."],
  ['salle', 'La Salle', "Offre un bonus de +10% de chance d'obtenir des personnages de la Salle dans vos prochains boosters."],
  ['reception', 'La Réception', "Offre un bonus de +10% de chance d'obtenir des personnages de la Réception dans vos prochains boosters."],
];

const LOCATION_CARD_DEFS = RAW_LOCATIONS.map(([locationId, name, description]) => ({
  id: `lieu-${locationId}`,
  name,
  rarity: LOCATION_CARD_RARITY,
  character: 'Cartes Lieux',
  type: 'lieu',
  extension: 'classic',
  location: locationId,
  icon: LOCATION_ICONS[locationId],
  file: LOCATION_CARD_FILES[locationId] || null,
  description,
}));

// Carte lieu spéciale : pas rattachée à un lieu, elle booste les cartes non encore possédées.
LOCATION_CARD_DEFS.push({
  id: 'lieu-jacuzzi',
  name: 'Le Jacuzzi',
  rarity: 'epic',
  character: 'Cartes Lieux',
  type: 'lieu',
  extension: 'classic',
  location: null,
  effect: 'newCard',
  icon: '🛁',
  file: 'Le Jacuzzi.png',
  description: "Offre un bonus de +10% de chance d'obtenir de nouvelles cartes dans vos prochains boosters.",
});

// Cartes lieu de l'extension "Across the verse" : pas de visuel pour l'instant
// (icône de repli via cardArtHtml), et un effet déclenché à l'ouverture d'un booster
// plutôt qu'un bonus de tirage.
LOCATION_CARD_DEFS.push({
  id: 'lieu-aveyron',
  name: 'Aveyron',
  rarity: 'rare',
  character: 'Cartes Lieux',
  type: 'lieu',
  extension: 'ext2',
  location: null,
  effect: 'boosterPascades',
  effectAmount: 3,
  icon: '🐄',
  file: 'Aveyron.png',
  bg: 'Aveyron-BG.png',
  description: 'Pour chaque booster que vous ouvrez, obtenez 3 pascades.',
});
LOCATION_CARD_DEFS.push({
  id: 'lieu-alibaba',
  name: "Caverne d'Alibaba",
  rarity: 'epic',
  character: 'Cartes Lieux',
  type: 'lieu',
  extension: 'ext2',
  location: null,
  effect: 'boosterRandomReward',
  icon: '💰',
  file: 'Caverne.png',
  bg: 'Caverne-BG.png',
  description: "Ouvre-toi, Sésame ! Chaque booster ouvert révèle en prime un trésor tiré au hasard dans la caverne : crédits, gemmes, pascades, ou un objet de la boutique.",
});

// ============================================================
//  EXTENSION "POWER" (ext2)
// ============================================================
// Le 1er élément est le nom de fichier (sans extension = .png ; avec extension
// explicite, ex. "X.PNG", il est utilisé tel quel — certains assets sont en .PNG).
function makeExt2Def(type) {
  return ([token, name, rarity]) => {
    const dot = token.lastIndexOf('.');
    const base = dot > 0 ? token.slice(0, dot) : token;
    return {
      id: slugify(base),
      name,
      file: dot > 0 ? token : `${token}.png`,
      rarity,
      character: base.split('-')[0],
      type,
      extension: 'ext2',
    };
  };
}

const RAW_EXT2_CARDS = [
  ['Bichu-Power', 'Bichu Power', 'common'],
  ['Elodie-Power', 'Elodie Power', 'common'],
  ['Valentin-Power', 'Valentin Power', 'common'],
  ['Matthias-Power', 'Matthias Power', 'common'],
  ['Denis-Power', 'Denis Power', 'common'],
  ['Matthias-LeCringe', 'Matthias Le Cringe', 'common'],
  ['Valentin-LeCringe', 'Valentin Le Cringe', 'common'],
  ['Val-Shaolin', 'Val Moine Shaolin', 'rare'],
  ['Emilie-Catcheur', 'Emilie Catcheur', 'rare'],
  ['Elodie-degre', 'Elodie 1er Degré', 'common'],
  ['Louis-Bouzelouf', 'Louis Bouzelouf', 'epic'],
  ['Bichu-2249', 'Bichu 2249', 'rare'],
  ['Valentin-train', 'Valentin fan de train', 'epic'],
  ['Anais-Mugshot', 'Anaïs Mugshot', 'epic'],
  ['Matthias-Cruci', 'Matthias Cruciverbiste', 'common'],
  ['Bichu-MaitreChien', 'Bichu Maître Chien', 'common'],
  ['Denis-Kawaii', 'Denis Kawaii', 'epic'],
  ['Bichu-Rasta', 'Bichu Rasta', 'legendary'],
  ['Denis-Basket', 'Denis Basket', 'legendary'],
  ['Elodie-CartonV2', 'Elodie Carton V2.0', 'legendary'],
  ['Louis-Rayon', 'Louis Rayon de Soleil', 'legendary'],
  ['Val-Dirty', 'Val Dirty Dancing', 'legendary'],
  ['Valentin-Beauf', 'Valentin Beauf', 'common'],
];
const EXT2_CARD_DEFS = RAW_EXT2_CARDS.map(makeExt2Def('character'));

// Cartes spéciales de l'extension "Across the verse" (catégorie "Cartes Spécial").
const RAW_EXT2_SPECIAL_CARDS = [
  ['PhillipLacheau', 'Phillipe Lacheau', 'common'],
  ['William', 'William', 'rare'],
  ['Tete-pecheCanard', 'Tété Pêche aux Canard', 'rare'],
  ['Maho-Pop', 'Maho Roi de la Pop', 'epic'],
  ['Thermomix-Gaulois', 'Thermomix le Gaulois', 'legendary'],
];
const EXT2_SPECIAL_CARD_DEFS = RAW_EXT2_SPECIAL_CARDS.map(makeExt2Def('special'));

const ALL_CARD_DEFS = [
  ...CARD_DEFS,
  ...SPECIAL_CARD_DEFS,
  ...LOCATION_CARD_DEFS,
  ...EXT2_CARD_DEFS,
  ...EXT2_SPECIAL_CARD_DEFS,
];

// ============================================================
//  QUÊTES / SUCCÈS DE COLLECTION
// ============================================================
// Chaque quête = posséder (>= 1 exemplaire) toutes les cartes d'un ensemble.
// Une fois complète, le joueur récupère la récompense une seule fois.
const ACHIEVEMENT_TEAM_LABELS = { cuisine: 'Cuisine', salle: 'Salle', reception: 'Réception' };

function buildAchievements() {
  const list = [];

  // Une quête par personnage (cartes personnage classiques).
  [...new Set(CARD_DEFS.map((c) => c.character))].forEach((char) => {
    list.push({
      id: `char-${slugify(char)}`,
      label: `Collectionner toutes les cartes de ${char}`,
      cardIds: CARD_DEFS.filter((c) => c.character === char).map((c) => c.id),
      reward: { type: 'gems', amount: 5 },
    });
  });

  list.push({
    id: 'set-lieux',
    label: 'Collectionner toutes les cartes Lieux',
    cardIds: LOCATION_CARD_DEFS.map((c) => c.id),
    reward: { type: 'gems', amount: 5 },
  });
  list.push({
    id: 'set-special',
    label: 'Collectionner toutes les cartes Spéciales',
    cardIds: SPECIAL_CARD_DEFS.map((c) => c.id),
    reward: { type: 'gems', amount: 10 },
  });

  // Une quête par équipe (union des cartes personnage de l'équipe).
  Object.entries(ACHIEVEMENT_TEAM_LABELS).forEach(([loc, label]) => {
    const teamChars = Object.keys(CHARACTER_LOCATIONS).filter((ch) => CHARACTER_LOCATIONS[ch] === loc);
    list.push({
      id: `team-${loc}`,
      label: `Collectionner toutes les cartes de l'équipe ${label}`,
      sublabel: teamChars.join(', '),
      cardIds: CARD_DEFS.filter((c) => teamChars.includes(c.character)).map((c) => c.id),
      reward: { type: 'gems', amount: 10 },
    });
  });

  // Une quête par extension : toutes ses cartes, tous types confondus
  // (personnages, spéciales, lieux).
  list.push({
    id: 'ext-classic',
    label: "Collectionner toutes les cartes de l'extension Classic",
    cardIds: ALL_CARD_DEFS.filter((c) => c.extension === 'classic').map((c) => c.id),
    reward: { type: 'gems', amount: 20 },
  });
  list.push({
    id: 'ext-ext2',
    label: "Collectionner toutes les cartes de l'extension Across the verse",
    cardIds: ALL_CARD_DEFS.filter((c) => c.extension === 'ext2').map((c) => c.id),
    reward: { type: 'gems', amount: 15 },
  });

  // Quêtes à palier basées sur un compteur cumulé (pas un ensemble de cartes) :
  // le total de pascades offertes au fil du temps, toutes cibles confondues.
  [
    [10, 5],
    [50, 15],
    [100, 30],
    [1000, 300],
  ].forEach(([threshold, gems]) => {
    list.push({
      id: `gift-pascades-${threshold}`,
      label: `Offrir ${threshold} Pascade${threshold > 1 ? 's' : ''} à un joueur`,
      counterKey: 'totalPascadesGifted',
      threshold,
      reward: { type: 'gems', amount: gems },
    });
  });

  return list;
}
const ACHIEVEMENTS = buildAchievements();

const RARITY_WEIGHTS = { common: 50, rare: 25, epic: 15, legendary: 10 };
const RARITY_LABELS = { common: 'Commune', rare: 'Rare', epic: 'Épique', legendary: 'Légendaire' };
const CREDIT_INTERVAL_MS = 15 * 60 * 1000; // un palier de réserve toutes les 15 minutes
const CREDIT_PER_TICK = 2; // crédits gagnés à chaque palier
const RESERVE_MAX = 90; // capacité maximale de la réserve de crédits
const LOADING_SCREEN_MIN_MS = 1000; // durée d'affichage supplémentaire de l'écran de chargement
const BOOSTER_COST = 30;
const STARTING_CREDITS = 100;

// Extensions de cartes. La 1ère est "Classic" (toutes les cartes actuelles).
// Les extensions marquées `comingSoon` ne sont pas encore ouvrables (pas de cartes).
const EXTENSIONS = [
  { id: 'classic', name: 'Classic', front: 'Booster.png', back: 'Booster-dos.png' },
  { id: 'ext2', name: 'Across the verse', front: 'Booster2.png', back: 'Booster-Dos2.png' },
  { id: 'soon', name: 'Prochainement', front: 'Booster-Empty.png', back: 'Booster-Empty.png', comingSoon: true },
];
const EXT_INDEX_STORAGE_KEY = 'selectedExtIndex';
function loadStoredExtIndex() {
  try {
    const i = Number(localStorage.getItem(EXT_INDEX_STORAGE_KEY));
    return Number.isInteger(i) && i >= 0 && i < EXTENSIONS.length ? i : 0;
  } catch {
    return 0;
  }
}
let currentExtIndex = loadStoredExtIndex();
const JOHNNY_DONATION_COST = 50;
const DAILY_QUEST_RECYCLE_RARITIES = ['common', 'rare', 'epic'];
const DAILY_QUEST_LIST = [
  { id: 'openBooster', label: 'Ouvrir un booster' },
  { id: 'recycleCard', label: 'Recycler une carte' },
  { id: 'giftCard', label: 'Offrir une carte à un autre joueur' },
];
const DAILY_QUEST_GEM_REWARD = 10;

// ============================================================
//  BOUTIQUE (gemmes = monnaie premium, obtenue via les quêtes)
// ============================================================
// Les packs de gemmes sont une blague : aucun paiement réel n'est possible.
const GEM_PACKS = [
  { id: 'poignee', gems: 100, price: '4,99 €', img: 'G1.png', tier: 'poignee', tag: '' },
  { id: 'coffre', gems: 550, price: '19,99 €', img: 'G2.png', tier: 'coffre', tag: 'Populaire', bonus: '+10% offert' },
  { id: 'tresor', gems: 1500, price: '49,99 €', img: 'G3.png', tier: 'tresor', tag: 'Meilleure offre', bonus: '+25% offert' },
];
const CREDIT_MULTIPLIER_FACTOR = 2;
const CREDIT_MULTIPLIER_DURATION_MS = 60 * 60 * 1000; // 1 heure
const SHOP_ITEMS = {
  luckPotion: { cost: 25 },
  wheelReset: { cost: 5 },
  credits: { cost: 5, credits: 10 },  // 5 gemmes -> 10 crédits
  gems: { cost: 20, gems: 5 },        // 20 crédits -> 5 gemmes
};

// Titres : achetés en crédits, équipables depuis la modale de profil.
const TITLES = [
  { id: 'cuisinier-dur', name: 'Cuisinier dur au mal', cost: 5 },
  { id: 'serveur-patient', name: 'Serveur Patient', cost: 5 },
  { id: 'receptioniste-qualite', name: 'Réceptioniste de Qualité', cost: 5 },
  { id: 'ptit-zgeg', name: 'Ptit Zgeg', cost: 5 },
  { id: 'oui-oui-oui', name: '« Oui oui oui ! »', cost: 5 },
  { id: 'starfoullah', name: '« Starfoullah ! »', cost: 5 },
  { id: 'je-vais-serrer', name: '« Je vais serrer ! »', cost: 5 },
  { id: 'allo', name: '« Allo ! »', cost: 5 },
  { id: 'collectionneur', name: 'Collectionneur Expert', cost: 10 },
  { id: 'accro-au-jeu', name: 'Accro au jeu', cost: 10 },
  { id: 'professionnel', name: 'Professionnel', cost: 10 },
  { id: 'personnage-principal', name: 'Personnage principal', cost: 20 },
];
const TITLE_BY_ID = Object.fromEntries(TITLES.map((t) => [t.id, t]));
function titleName(id) {
  return id && TITLE_BY_ID[id] ? TITLE_BY_ID[id].name : '';
}

// Lots de pascades achetables en crédits (échange 1:1).
const PASCADE_PACKS = [
  { pascades: 1, cost: 1 },
  { pascades: 10, cost: 10 },
  { pascades: 20, cost: 20 },
];

// Raretés autorisées pour chacune des 5 cartes d'un booster (dans l'ordre du tirage)
const BOOSTER_SLOTS = [
  ['common', 'rare'],
  ['common', 'rare'],
  ['common', 'rare', 'epic'],
  ['common', 'rare', 'epic'],
  ['epic', 'legendary'],
];
const CARDS_PER_BOOSTER = BOOSTER_SLOTS.length;

// Recyclage des doublons : minOwned = nb d'exemplaires requis pour débloquer le recyclage,
// cost = nb d'exemplaires consommés, reward = crédits obtenus (garde toujours >= 1 exemplaire)
const RECYCLE_RULES = {
  common: { minOwned: 2, cost: 1, reward: 1 },
  rare: { minOwned: 2, cost: 1, reward: 2 },
  epic: { minOwned: 2, cost: 1, reward: 3 },
  legendary: { minOwned: 2, cost: 1, reward: 5 },
};

const RECYCLE_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M160-479q0 85 42.5 158T318-204q14 9 19.5 24.5T335-150q-8 15-24.5 19.5T279-134q-93-54-146-146T80-479q0-26 3.5-51t9.5-50l-13 8q-14 9-30 4.5T26-586q-8-14-3.5-30.5T41-641l121-70q14-8 30.5-3.5T217-696l70 120q8 14 3.5 30.5T272-521q-14 8-30.5 3.5T217-536l-34-59q-11 28-17 57t-6 59Zm320-321q-41 0-81 10.5T323-759q-15 8-31.5 5.5T267-770q-9-16-4-32.5t21-25.5q45-26 94.5-39T480-880q79 0 151.5 29.5T761-765v-15q0-17 11.5-28.5T801-820q17 0 28.5 11.5T841-780v140q0 17-11.5 28.5T801-600H661q-17 0-28.5-11.5T621-640q0-17 11.5-28.5T661-680h69q-46-57-111-88.5T480-800Zm242 531q38-44 58-97t20-111q0-17 11.5-30t28.5-13q17 0 28.5 13t11.5 30q0 65-20.5 125.5T800-239q-39 52-92.5 89T591-95l10 6q14 8 18 24.5T615-34q-8 14-24 18t-30-4L439-90q-14-8-18.5-24.5T424-145l70-121q8-14 24-18t30 4q14 8 18.5 24.5T563-225l-37 63q57-8 107.5-35.5T722-269Z"/></svg>';

const LOCK_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>';

const AVATAR_OPTIONS = ['PP/Defaut.png', 'PP/Matthias1.png', 'PP/Valentin1.png', 'PP/Denis1.png', 'PP/Elodie1.png', 'PP/Anais1.png', 'PP/Louis1.png', 'PP/Louann1.png', 'PP/Val1.png', 'PP/Bichu1.png', 'PP/Emilie1.png', 'PP/Matthias2.png', 'PP/Valentin2.png', 'PP/Denis2.png', 'PP/Elodie2.png', 'PP/Anais2.png', 'PP/Louis2.png', 'PP/Louann2.png', 'PP/Val2.png', 'PP/Bichu2.png', 'PP/Emilie2.png', 'PP/Denis3.png', 'PP/Aveyron.png', 'PP/Johnny.png', 'PP/Phillipe.png', 'PP/Tete1.png', 'PP/Tete2.png', 'PP/William.png', 'PP/Romain.png', 'PP/Ugo.png', 'PP/Maho.png', 'PP/Gabin.png', 'Pascade.png'];

// ============================================================
//  COULEUR PAR PHOTO DE PROFIL
// ============================================================
// Une couleur par photo précise (chaque entrée de AVATAR_OPTIONS a la
// sienne) — Matthias1.png et Matthias2.png ont donc des couleurs distinctes.
const AVATAR_COLORS = {
  'PP/Defaut.png': '#292929',
  'PP/Matthias1.png': '#29557c',
  'PP/Matthias2.png': '#c18a5a',
  'PP/Valentin1.png': '#bb6740',
  'PP/Valentin2.png': '#b47647',
  'PP/Denis1.png': '#f29dbb',
  'PP/Denis2.png': '#2a5a89',
  'PP/Denis3.png': '#dfc556',
  'PP/Elodie1.png': '#d3a15d',
  'PP/Elodie2.png': '#cca055',
  'PP/Anais1.png': '#eb8658',
  'PP/Anais2.png': '#aa9984',
  'PP/Louis1.png': '#3770ae',
  'PP/Louis2.png': '#6aa1de',
  'PP/Louann1.png': '#c3a382',
  'PP/Louann2.png': '#ddb385',
  'PP/Val1.png': '#b5345b',
  'PP/Val2.png': '#996030',
  'PP/Bichu1.png': '#344830',
  'PP/Bichu2.png': '#7f3c38',
  'PP/Emilie1.png': '#2f241c',
  'PP/Emilie2.png': '#a81809',
  'PP/Aveyron.png': '#90853d',
  'PP/Johnny.png': '#f7e9ac',
  'PP/Phillipe.png': '#393f54',
  'PP/Tete1.png': '#597680',
  'PP/Tete2.png': '#60899a',
  'PP/William.png': '#3a93d7',
  'PP/Romain.png': '#101c37',
  'PP/Ugo.png': '#101c37',
  'PP/Maho.png': '#882a3d',
  'PP/Gabin.png': '#b76963',
  'Pascade.png': '#ffad49',
};

function getAvatarColor(avatarPath) {
  return AVATAR_COLORS[avatarPath] || AVATAR_COLORS['PP/Defaut.png'];
}

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Roue quotidienne : 10 cases (3x1, 3x5, 3x10, 1x30 crédits), tirage équiprobable
const WHEEL_SLOTS = [
  { type: 'credits', amount: 1 },
  { type: 'credits', amount: 5 },
  { type: 'credits', amount: 10 },
  { type: 'credits', amount: 1 },
  { type: 'credits', amount: 30 },
  { type: 'credits', amount: 5 },
  { type: 'credits', amount: 10 },
  { type: 'credits', amount: 1 },
  { type: 'credits', amount: 5 },
  { type: 'credits', amount: 10 },
];
const WHEEL_COLORS = { 1: '#8a94a3', 5: '#0ac8b9', 10: '#a855f7', 30: '#e8b923' };

// ============================================================
//  ACTUALITÉS
// ============================================================
// Ajoute les nouvelles entrées en tête de liste (la plus récente en premier).
// date : 'AAAA-MM-JJ' — body : un paragraphe par chaîne du tableau.
const NEWS_ITEMS = [
  {
    date: '2026-09-04',
    title: 'Encore plein de nouveautés !',
    body: [
      "Comme vous le savez je n'ai pas de vie, et en plus je suis informaticien : je vous ai donc préparé une belle fournée de nouveautés.",
      "Un tout nouveau booster et sa première extension : « Across the Verse », avec ses propres cartes à collectionner.",
      "Refonte de plusieurs interfaces pour une navigation plus claire.",
      "De nouveaux objets à débloquer dans la boutique.",
      "Arrivée du système de Pascades, la monnaie qui s'offre entre joueurs.",
      "Vous pouvez maintenant afficher une bulle de dialogue sur votre profil dans l'onglet Communauté.",
      "Et plein d'autres petites choses à découvrir par vous-même.",
      "Bon jeu !",
    ],
  },
  {
    date: '2026-09-02',
    title: 'Une grosse mise à jour !',
    body: [
      "4 nouvelles cartes rejoignent la collection.",
      "Toutes les images du jeu ont été optimisées : le chargement est nettement plus rapide, même sur une connexion lente.",
      "Un nouvel onglet Boutique fait son apparition, avec sa toute nouvelle monnaie : les gemmes. On les gagne en accomplissant ses quêtes, puis on les dépense en boutique.",
      "Ajout du système de titres : achetez des titres en boutique et équipez-en un depuis votre profil pour l'afficher sous votre pseudo.",
      "Un panneau de Quêtes regroupe désormais tous vos objectifs de collection.",
      "Le Recyclage rapide, accessible depuis la collection, recycle d'un seul geste tous les doublons d'une rareté.",
      "Rééquilibrage de la roue de la fortune.",
      "Enfin, de nombreuses interfaces ont été retravaillées.",
      "Bon jeu à toutes et à tous !",
    ],
  },
  {
    date: '2026-08-30',
    title: "Un départ à célébrer",
    body: [
      "Pour célébrer le départ de nos chères collègues d'amour, nous vous offrons 30 crédits.",
    ],
    reward: { key: 'departCollegueBonus', amount: 30 },
  },
  {
    date: '2026-08-30',
    title: 'Quelques corrections',
    body: [
      'Une carte spéciale a été ajoutée.',
      'Correction de bugs.',
      "Ajout d'animations et d'effets sonores.",
      'Les taux de loot des cartes sont revus à la hausse : le légendaire passe de 5% à 10%, l\'épique passe de 10% à 15%.',
    ],
  },
  {
    date: '2026-08-29',
    title: 'Coup de boost !',
    body: [
      "Aujourd'hui on augmente la cadence !",
      'Le temps de récupération des crédits passe de 10 min à 15 min.',
      '« Oh trop nul c\'est déjà bien assez long ! »',
      'Oui, mais vous gagnez désormais 2 crédits à la place d\'un seul.',
      'Également, la réserve de crédits est désormais de 90.',
      'Amusez-vous bien !',
    ],
  },
  {
    date: '2026-08-29',
    title: '???',
    body: [
      'Tiens tiens… Vous lisez les actualités ?',
      "Intéressant, vous êtes sans doute quelqu'un de bien.",
      'Pour vous récompenser, voici un cadeau.',
    ],
    reward: { key: 'newsReaderBonus', amount: 30 },
  },
  {
    date: '2026-08-28',
    title: 'Déjà de nouvelles cartes !',
    body: [
      '7 nouvelles cartes ont été ajoutées : 6 cartes personnage et 1 carte lieu.',
      'Ouvrez des boosters pour tenter de les décrocher et compléter votre collection !',
    ],
  },
  {
    date: '2026-08-27',
    title: 'Lancement de la version 1.0.0 de 1925 TCG',
    body: [
      "Nous sommes ravis de vous présenter ce jeu, nous espérons qu'il vous plaira.",
      "Pour commencer votre aventure de collectionneur, nous vous avons laissé 100 crédits. Rassurez-vous, vous en gagnerez bien davantage durant votre aventure. Amusez-vous bien !",
    ],
  },
];

// Date de l'actu la plus récente (les entrées sont triées la plus récente en premier).
const LATEST_NEWS_DATE = NEWS_ITEMS.length ? NEWS_ITEMS[0].date : '';

// ============================================================
//  DOM REFS
// ============================================================
const el = (id) => document.getElementById(id);

const loadingScreen = el('loadingScreen');
const authScreen = el('authScreen');
const appShell = el('appShell');
const loaderStatus = el('loaderStatus');
const loaderVersion = el('loaderVersion');
if (loaderVersion) loaderVersion.textContent = `v${APP_VERSION}`;
function setLoaderStatus(text) {
  if (loaderStatus) loaderStatus.textContent = text;
}

const authForm = el('authForm');
const authEmail = el('authEmail');
const authPassword = el('authPassword');
const authName = el('authName');
const registerNameField = el('registerNameField');
const authError = el('authError');
const authSubmit = el('authSubmit');

const playerName = el('playerName');
const playerTitle = el('playerTitle');
const avatarImg = el('avatarImg');
const creditsValue = el('creditsValue');
const logoutBtn = el('logoutBtn');

const profileModal = el('profileModal');
const closeProfileModalBtn = el('closeProfileModal');
const profileNameInput = el('profileNameInput');
const profileTitleSelect = el('profileTitleSelect');
const avatarGrid = el('avatarGrid');
const saveProfileBtn = el('saveProfileBtn');
const titleShopList = el('titleShopList');

const nextCreditTimer = el('nextCreditTimer');
const creditProgressBar = el('creditProgressBar');
const creditProgressFill = el('creditProgressFill');
const reserveValue = el('reserveValue');
const claimReserveBtn = el('claimReserveBtn');
const openBoosterBtn = el('openBoosterBtn');
const boosterPack = el('boosterPack');
const boosterCarousel = el('boosterCarousel');
const boosterExtName = el('boosterExtName');
const boosterExtCount = el('boosterExtCount');
const boosterExtDots = el('boosterExtDots');
const boosterPrevBtn = el('boosterPrev');
const boosterNextBtn = el('boosterNext');
const luckPotionActiveLabel = el('luckPotionActiveLabel');
const addCreditsBtn = el('addCreditsBtn');
const addPascadesBtn = el('addPascadesBtn');
const resetCreditsBtn = el('resetCreditsBtn');
const resetGemsBtn = el('resetGemsBtn');
const resetPascadesBtn = el('resetPascadesBtn');
const resetWheelBtn = el('resetWheelBtn');
const resetQuestsBtn = el('resetQuestsBtn');
const addExt2LieuxBtn = el('addExt2LieuxBtn');
const statOwned = el('statOwned');
const statUnique = el('statUnique');
const johnnyDivider = el('johnnyDivider');
const johnnyPanel = el('johnnyPanel');
const donateJohnnyBtn = el('donateJohnnyBtn');
const dailyQuestList = el('dailyQuestList');
const claimDailyQuestBtn = el('claimDailyQuestBtn');

const cardGrid = el('cardGrid');

const playerList = el('playerList');
const myPlayerRow = el('myPlayerRow');
const giftsSection = el('giftsSection');
const sendGiftModal = el('sendGiftModal');
const closeSendGiftModalBtn = el('closeSendGiftModal');
const giftPartnerName = el('giftPartnerName');
const giftMyCards = el('giftMyCards');
const submitGiftBtn = el('submitGiftBtn');
const giftReceivedModal = el('giftReceivedModal');
const giftReceivedArt = el('giftReceivedArt');
const giftReceivedName = el('giftReceivedName');
const giftReceivedRarity = el('giftReceivedRarity');
const giftReceivedFrom = el('giftReceivedFrom');
const closeGiftReceivedModalBtn = el('closeGiftReceivedModal');

const sendPascadeModal = el('sendPascadeModal');
const closeSendPascadeModalBtn = el('closeSendPascadeModal');
const pascadeGiftPartnerName = el('pascadeGiftPartnerName');
const pascadeGiftAmountEl = el('pascadeGiftAmount');
const pascadeGiftBalanceEl = el('pascadeGiftBalance');
const pascadeGiftMinusBtn = el('pascadeGiftMinus');
const pascadeGiftPlusBtn = el('pascadeGiftPlus');
const submitPascadeGiftBtn = el('submitPascadeGiftBtn');

const giftChoiceModal = el('giftChoiceModal');
const closeGiftChoiceModalBtn = el('closeGiftChoiceModal');
const giftChoicePartnerName = el('giftChoicePartnerName');
const giftChoicePascadeBtn = el('giftChoicePascade');
const giftChoiceCardBtn = el('giftChoiceCard');

const bubbleEditModal = el('bubbleEditModal');
const closeBubbleEditModalBtn = el('closeBubbleEditModal');
const bubbleEditInput = el('bubbleEditInput');
const bubbleEditCount = el('bubbleEditCount');
const bubbleEditClearBtn = el('bubbleEditClear');
const bubbleEditSaveBtn = el('bubbleEditSave');

const boosterModal = el('boosterModal');
const revealCards = el('revealCards');
const revealProgress = el('revealProgress');
const revealHint = el('revealHint');
const revealBoosterArt = el('revealBoosterArt');
const revealBoosterFront = el('revealBoosterFront');
const revealBoosterBack = el('revealBoosterBack');
const revealRarityLabel = el('revealRarityLabel');
const revealNewBadge = el('revealNewBadge');
const revealRays = el('revealRays');

const cardDetailModal = el('cardDetailModal');
const closeCardDetail = el('closeCardDetail');
const cardDetailImg = el('cardDetailImg');
const cardDetailLieuArt = el('cardDetailLieuArt');
const cardDetailLieuIcon = el('cardDetailLieuIcon');
const cardDetailEffect = el('cardDetailEffect');
const cardDetailName = el('cardDetailName');
const cardDetailRarity = el('cardDetailRarity');
const cardDetailCount = el('cardDetailCount');
const recycleBtn = el('recycleBtn');
const recycleHint = el('recycleHint');
const quickRecycleBtn = el('quickRecycleBtn');
const quickRecycleModal = el('quickRecycleModal');
const closeQuickRecycleModalBtn = el('closeQuickRecycleModal');
const quickRecycleBody = el('quickRecycleBody');

const homeLieuBg = el('homeLieuBg');
const lieuSlotBtn = el('lieuSlotBtn');
const lieuSlotArt = el('lieuSlotArt');
const lieuSlotPassifLabel = el('lieuSlotPassifLabel');
const lieuSlotCaption = el('lieuSlotCaption');
const lieuSlotEffect = el('lieuSlotEffect');
const lieuModal = el('lieuModal');
const closeLieuModalBtn = el('closeLieuModal');
const lieuList = el('lieuList');
const lieuHint = el('lieuHint');
const unequipLieuBtn = el('unequipLieuBtn');

const wheelDial = el('wheelDial');
const wheelLabels = el('wheelLabels');
const spinWheelBtn = el('spinWheelBtn');
const wheelHint = el('wheelHint');
const wheelLaunchBtn = el('wheelLaunchBtn');
const wheelLaunchBadge = el('wheelLaunchBadge');
const wheelModal = el('wheelModal');
const closeWheelModalBtn = el('closeWheelModal');

const questsBtn = el('questsBtn');
const questsBadge = el('questsBadge');
const questsModal = el('questsModal');
const closeQuestsModalBtn = el('closeQuestsModal');
const questsList = el('questsList');

const multiplierBanner = el('multiplierBanner');
const multiplierBannerTimer = el('multiplierBannerTimer');
const gemsValue = el('gemsValue');
const pascadesValue = el('pascadesValue');
const gemPackGrid = el('gemPackGrid');
const shopItemList = el('shopItemList');
const gemJokeModal = el('gemJokeModal');
const closeGemJokeModalBtn = el('closeGemJokeModal');
const gemJokeDismissBtn = el('gemJokeDismiss');
const addGemsBtn = el('addGemsBtn');
const shopItemModal = el('shopItemModal');
const closeShopItemModalBtn = el('closeShopItemModal');
const shopItemModalIcon = el('shopItemModalIcon');
const shopItemModalBalance = el('shopItemModalBalance');
const shopItemModalBalanceLabel = el('shopItemModalBalanceLabel');
const shopItemModalBalanceIcon = el('shopItemModalBalanceIcon');
const shopItemModalName = el('shopItemModalName');
const shopItemModalDesc = el('shopItemModalDesc');
const shopItemModalUsage = el('shopItemModalUsage');
const shopItemModalNote = el('shopItemModalNote');
const shopItemModalBuy = el('shopItemModalBuy');

const newsBtn = el('newsBtn');
const newsBadge = el('newsBadge');
const newsModal = el('newsModal');
const closeNewsModalBtn = el('closeNewsModal');
const newsList = el('newsList');

const toast = el('toast');
const toastBackdrop = el('toastBackdrop');

// ============================================================
//  APP STATE
// ============================================================
let state = null; // { uid, email, displayName, credits, lastClaim, cards }
let isNewAccountThisSession = false;
let currentFilter = 'all';
let currentExtFilter = 'all'; // 'all' | id d'extension
let tickInterval = null;
let toastTimeout = null;
let toastHideTimeout = null;
let latestPublicProfiles = [];
let giftsRef = null;
const claimingGiftIds = new Set();
let giftTarget = null; // { uid, displayName, avatar }
let giftCardId = null;
let pendingGiftQueue = [];
let giftModalShowing = false;

// ============================================================
//  UTILITIES
// ============================================================
function showScreen(id) {
  ['loadingScreen', 'authScreen', 'appShell'].forEach((s) => {
    el(s).classList.toggle('hidden', s !== id);
  });
}

// ============================================================
//  ANIMATION : pièce qui plonge vers les crédits
// ============================================================
function isElementVisible(elm) {
  return !!(elm && elm.getClientRects().length);
}

function pulseValue(elm) {
  if (!elm) return;
  elm.classList.remove('credit-pop');
  void elm.offsetWidth; // force le redémarrage de l'animation CSS
  elm.classList.add('credit-pop');
}
function pulseCreditsValue() { pulseValue(creditsValue); }
function pulseGemsValue() { pulseValue(gemsValue); }

// Jeton volant (pièce ou gemme) du point `srcRect` vers `cfg.target`.
function spawnFlyingToken(srcRect, cfg) {
  new Audio('medias/Coin.wav').play().catch(() => {});
  const dstRect = cfg.target.getBoundingClientRect();
  const startX = srcRect.left + srcRect.width / 2;
  const startY = srcRect.top + srcRect.height / 2;
  const endX = dstRect.left + dstRect.width / 2;
  const endY = dstRect.top + dstRect.height / 2;
  const peakX = (startX + endX) / 2 + (Math.random() * 40 - 20);
  const peakY = Math.min(startY, endY) - 50;

  const token = document.createElement('img');
  token.src = cfg.img;
  token.className = cfg.className;
  token.style.left = `${startX}px`;
  token.style.top = `${startY}px`;
  document.body.appendChild(token);

  const anim = token.animate([
    { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', offset: 0, opacity: 1 },
    { transform: `translate(calc(-50% + ${peakX - startX}px), calc(-50% + ${peakY - startY}px)) scale(1.15) rotate(220deg)`, offset: 0.45, opacity: 1 },
    { transform: `translate(calc(-50% + ${endX - startX}px), calc(-50% + ${endY - startY}px)) scale(.25) rotate(400deg)`, offset: 1, opacity: 0.15 },
  ], { duration: 1400, easing: 'cubic-bezier(.3,.55,.35,1)' });

  anim.onfinish = () => {
    token.remove();
    cfg.pulse();
  };
}

function flyTokens(sourceEl, count, cfg) {
  if (!isElementVisible(sourceEl) || !isElementVisible(cfg.target)) {
    cfg.pulse();
    return;
  }
  // Capturé maintenant, avant qu'un re-render (ex: renderCardDetail après recyclage)
  // ne masque ou ne déplace sourceEl — sinon le setTimeout lirait une position obsolète.
  const srcRect = sourceEl.getBoundingClientRect();
  const n = Math.min(count, 3);
  for (let i = 0; i < n; i++) {
    setTimeout(() => spawnFlyingToken(srcRect, cfg), i * 220);
  }
}

function flyCoinToCredits(sourceEl, count = 1) {
  flyTokens(sourceEl, count, {
    target: creditsValue, img: 'medias/Credit.png', className: 'flying-coin', pulse: pulseCreditsValue,
  });
}

function flyGemToBalance(sourceEl, count = 1) {
  flyTokens(sourceEl, count, {
    target: gemsValue, img: 'medias/Gemme.png', className: 'flying-coin flying-gem', pulse: pulseGemsValue,
  });
}

function flyPascadeToBalance(sourceEl, count = 1) {
  flyTokens(sourceEl, count, {
    target: pascadesValue, img: 'medias/Pascade.png', className: 'flying-coin', pulse: () => pulseValue(pascadesValue),
  });
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden', 'leaving');
  // Rejoue l'animation d'entrée même si le toast est déjà affiché.
  toast.style.animation = 'none';
  void toast.offsetWidth;
  toast.style.animation = '';
  if (toastBackdrop) {
    toastBackdrop.classList.remove('hidden');
    void toastBackdrop.offsetWidth;
    toastBackdrop.classList.add('visible');
  }
  clearTimeout(toastTimeout);
  clearTimeout(toastHideTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.add('leaving');
    if (toastBackdrop) toastBackdrop.classList.remove('visible');
    toastHideTimeout = setTimeout(() => {
      toast.classList.add('hidden');
      toast.classList.remove('leaving');
      if (toastBackdrop) toastBackdrop.classList.add('hidden');
    }, 340);
  }, 2300);
}

function formatDuration(ms, minSecOnly = false) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (minSecOnly) {
    const mm = Math.floor(totalSec / 60);
    return [mm, s].map((n) => String(n).padStart(2, '0')).join(':');
  }
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function translateAuthError(code) {
  const map = {
    'auth/email-already-in-use': 'Cet email est déjà utilisé.',
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/user-not-found': 'Aucun compte ne correspond à cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/invalid-credential': 'Email ou mot de passe incorrect.',
    'auth/missing-password': 'Merci de renseigner un mot de passe.',
    'auth/too-many-requests': 'Trop de tentatives, réessayez plus tard.',
    'auth/network-request-failed': 'Problème de connexion réseau.',
  };
  return map[code] || 'Une erreur est survenue. Réessayez.';
}

// ============================================================
//  AUTH
// ============================================================
let authMode = 'login';

document.querySelectorAll('.auth-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    authMode = tab.dataset.tab;
    document.querySelectorAll('.auth-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    registerNameField.classList.toggle('hidden', authMode !== 'register');
    authSubmit.textContent = authMode === 'register' ? "S'inscrire" : 'Se connecter';
    authError.classList.add('hidden');
  });
});

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.classList.add('hidden');
  authSubmit.disabled = true;
  const email = authEmail.value.trim();
  const password = authPassword.value;

  try {
    if (authMode === 'register') {
      const name = (authName.value.trim() || email.split('@')[0]).slice(0, 20);
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
    } else {
      await auth.signInWithEmailAndPassword(email, password);
    }
    authForm.reset();
  } catch (err) {
    authError.textContent = translateAuthError(err.code);
    authError.classList.remove('hidden');
  } finally {
    authSubmit.disabled = false;
  }
});

logoutBtn.addEventListener('click', () => {
  auth.signOut();
});

// ============================================================
//  PROFIL (pseudo + avatar)
// ============================================================
let selectedAvatar = null;

avatarImg.addEventListener('click', openProfileModal);

function openProfileModal() {
  if (!state) return;
  profileNameInput.value = state.displayName;
  selectedAvatar = state.avatar;
  renderAvatarGrid();
  renderProfileTitleOptions();
  profileModal.classList.remove('hidden');
  profileModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  profileModal.classList.add('open');
}

function renderProfileTitleOptions() {
  const owned = TITLES.filter((t) => state.ownedTitles && state.ownedTitles[t.id]);
  profileTitleSelect.innerHTML = '<option value="">Aucun titre</option>' +
    owned.map((t) => `<option value="${t.id}">${escapeHtml(t.name)}</option>`).join('');
  profileTitleSelect.value = (state.equippedTitle && state.ownedTitles[state.equippedTitle]) ? state.equippedTitle : '';
  profileTitleSelect.disabled = owned.length === 0;
}

async function closeProfileModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  profileModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  profileModal.classList.add('hidden');
}

function renderAvatarGrid() {
  avatarGrid.innerHTML = AVATAR_OPTIONS.map((file) => `
    <button type="button" class="avatar-option ${file === selectedAvatar ? 'selected' : ''}" data-avatar="${file}">
      <img src="medias/${file}" alt="avatar" />
    </button>`).join('');
}

avatarGrid.addEventListener('click', (e) => {
  const btn = e.target.closest('.avatar-option');
  if (!btn) return;
  if (btn.dataset.avatar === AVATAR_OPTIONS[2]) registerDevUnlockTap();
  selectedAvatar = btn.dataset.avatar;
  renderAvatarGrid();
});

saveProfileBtn.addEventListener('click', async () => {
  if (!state) return;
  const name = profileNameInput.value.trim().slice(0, 20);
  if (!name) {
    showToast('Le pseudo ne peut pas être vide.');
    return;
  }
  state.displayName = name;
  state.avatar = selectedAvatar || state.avatar;
  const pickedTitle = profileTitleSelect.value || null;
  state.equippedTitle = (pickedTitle && state.ownedTitles[pickedTitle]) ? pickedTitle : null;
  playerName.textContent = state.displayName;
  avatarImg.src = `medias/${state.avatar}`;
  updatePlayerTitle();
  await persistUser();
  showToast('Profil mis à jour !');
  closeProfileModal();
});

closeProfileModalBtn.addEventListener('click', closeProfileModal);
profileModal.addEventListener('click', (e) => { if (e.target === profileModal) closeProfileModal(); });

auth.onAuthStateChanged(async (user) => {
  if (user) {
    showScreen('loadingScreen');
    setLoaderStatus('Connexion...');
    try {
      setLoaderStatus('Chargement de vos données...');
      await loadUserData(user);
      setLoaderStatus('Synchronisation...');
      await persistUser();
    } catch (err) {
      console.error('Lecture des données joueur refusée :', err);
      showScreen('authScreen');
      authError.textContent = 'Impossible de charger vos données (vérifiez les règles Firebase). Réessayez.';
      authError.classList.remove('hidden');
      auth.signOut();
      return;
    }
    setLoaderStatus("Préparation de l'interface...");
    renderAll();
    await wait(LOADING_SCREEN_MIN_MS);
    showScreen('appShell');
    revealHomeLieuBg();
    revealQuestsLaunchRow(true); // relance le compte à 1 s depuis l'affichage réel de l'accueil
    if (accrueReserve() > 0) {
      await persistUser();
    }
    startCreditTimer();
    startGiftsListener();
  } else {
    stopCreditTimer();
    stopGiftsListener();
    state = null;
    await wait(LOADING_SCREEN_MIN_MS);
    showScreen('authScreen');
  }
});

// ============================================================
//  DATA LOAD / SAVE (Firebase Realtime Database)
// ============================================================
async function loadUserData(user) {
  const snap = await db.ref(`users/${user.uid}`).once('value');
  if (snap.exists()) {
    const data = snap.val();
    state = {
      uid: user.uid,
      email: user.email,
      displayName: data.displayName || user.displayName || user.email.split('@')[0],
      credits: typeof data.credits === 'number' ? data.credits : STARTING_CREDITS,
      gems: typeof data.gems === 'number' ? data.gems : 0,
      pascades: typeof data.pascades === 'number' ? data.pascades : 0,
      creditMultiplierUntil: typeof data.creditMultiplierUntil === 'number' ? data.creditMultiplierUntil : 0,
      lastClaim: data.lastClaim || Date.now(),
      reserve: typeof data.reserve === 'number' ? data.reserve : 0,
      cards: data.cards || {},
      avatar: AVATAR_OPTIONS.includes(data.avatar) ? data.avatar : AVATAR_OPTIONS[0],
      lastWheelSpinDate: data.lastWheelSpinDate || null,
      equippedLieuId: data.equippedLieuId || null,
      johnnyDonated: !!data.johnnyDonated,
      dailyQuestDate: data.dailyQuestDate || null,
      dailyQuestRecycleRarity: data.dailyQuestRecycleRarity || null,
      dailyQuestProgress: data.dailyQuestProgress || { openBooster: false, recycleCard: false, giftCard: false },
      dailyQuestClaimed: !!data.dailyQuestClaimed,
      lastSeenNewsDate: data.lastSeenNewsDate || '',
      claimedNewsRewards: data.claimedNewsRewards || {},
      claimedAchievements: data.claimedAchievements || {},
      luckyBoosterPending: !!data.luckyBoosterPending,
      ownedTitles: data.ownedTitles || {},
      equippedTitle: data.equippedTitle || null,
      bubbleText: typeof data.bubbleText === 'string' ? data.bubbleText : '',
      totalPascadesGifted: typeof data.totalPascadesGifted === 'number' ? data.totalPascadesGifted : 0,
    };
  } else {
    isNewAccountThisSession = true;
    state = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      credits: STARTING_CREDITS,
      gems: 0,
      pascades: 0,
      creditMultiplierUntil: 0,
      lastClaim: Date.now(),
      reserve: 0,
      cards: {},
      avatar: AVATAR_OPTIONS[0],
      lastWheelSpinDate: null,
      equippedLieuId: null,
      johnnyDonated: false,
      dailyQuestDate: null,
      dailyQuestRecycleRarity: null,
      dailyQuestProgress: { openBooster: false, recycleCard: false, giftCard: false },
      dailyQuestClaimed: false,
      lastSeenNewsDate: LATEST_NEWS_DATE,
      claimedNewsRewards: {},
      claimedAchievements: {},
      luckyBoosterPending: false,
      ownedTitles: {},
      equippedTitle: null,
      bubbleText: '',
      totalPascadesGifted: 0,
    };
    await persistUser();
  }
}

function persistUser() {
  if (!state) return Promise.resolve();
  const uniqueCount = Object.keys(state.cards).length;
  const totalCount = Object.values(state.cards).reduce((a, b) => a + b, 0);

  // Two separate writes on purpose: db.ref().update() with slash-delimited keys is one
  // atomic multi-location write, so a rules issue on publicProfiles alone would also
  // silently block the users/{uid} save (credits/lastClaim never persisted -> timer
  // and credits reset to defaults on every reconnect).
  const coreSave = db.ref(`users/${state.uid}`).update({
    displayName: state.displayName,
    email: state.email,
    credits: state.credits,
    gems: state.gems,
    pascades: state.pascades,
    creditMultiplierUntil: state.creditMultiplierUntil,
    lastClaim: state.lastClaim,
    reserve: state.reserve,
    cards: state.cards,
    avatar: state.avatar,
    lastWheelSpinDate: state.lastWheelSpinDate,
    equippedLieuId: state.equippedLieuId,
    johnnyDonated: state.johnnyDonated,
    dailyQuestDate: state.dailyQuestDate,
    dailyQuestRecycleRarity: state.dailyQuestRecycleRarity,
    dailyQuestProgress: state.dailyQuestProgress,
    dailyQuestClaimed: state.dailyQuestClaimed,
    lastSeenNewsDate: state.lastSeenNewsDate,
    claimedNewsRewards: state.claimedNewsRewards,
    claimedAchievements: state.claimedAchievements,
    luckyBoosterPending: state.luckyBoosterPending,
    ownedTitles: state.ownedTitles,
    equippedTitle: state.equippedTitle,
    bubbleText: state.bubbleText || '',
    totalPascadesGifted: state.totalPascadesGifted || 0,
  }).catch((err) => {
    console.error('Sauvegarde des données joueur refusée :', err);
    showToast('Erreur de sauvegarde — vérifiez les règles Firebase.');
  });

  const publicSave = db.ref(`publicProfiles/${state.uid}`).set({
    displayName: state.displayName,
    avatar: state.avatar,
    uniqueCount,
    totalCount,
    credits: state.credits,
    pascades: state.pascades || 0,
    cards: state.cards,
    equippedTitle: state.equippedTitle || null,
    bubbleText: state.bubbleText || null,
    updatedAt: Date.now(),
  }).catch((err) => {
    console.error('Mise à jour du classement public refusée :', err);
  });

  return Promise.all([coreSave, publicSave]);
}

// ============================================================
//  RÉSERVE DE CRÉDITS (accumulation passive + récupération manuelle)
// ============================================================
// Le timer remplit une réserve (plafonnée à RESERVE_MAX) même hors-ligne ;
// les crédits ne sont ajoutés au solde que lorsque le joueur clique sur "Récupérer".
function accrueReserve() {
  if (!state) return 0;
  if (state.reserve >= RESERVE_MAX) {
    state.lastClaim = Date.now();
    return 0;
  }
  const ticks = Math.floor((Date.now() - state.lastClaim) / CREDIT_INTERVAL_MS);
  if (ticks <= 0) return 0;
  const added = Math.min(ticks * CREDIT_PER_TICK, RESERVE_MAX - state.reserve);
  state.reserve += added;
  state.lastClaim += ticks * CREDIT_INTERVAL_MS;
  return added;
}

// Multiplicateur x2 (objet boutique) : double les gains en crédits pendant 1 h.
function creditMultiplierActive() {
  return !!state && (state.creditMultiplierUntil || 0) > Date.now();
}

// Ajoute `base` crédits au solde, doublés si le multiplicateur est actif.
// Renvoie le montant réellement crédité.
function grantCredits(base) {
  const gained = creditMultiplierActive() ? base * CREDIT_MULTIPLIER_FACTOR : base;
  state.credits += gained;
  return gained;
}

async function claimReserve() {
  if (!state || state.reserve <= 0) return;
  const amount = grantCredits(state.reserve);
  state.reserve = 0;
  state.lastClaim = Date.now();
  await persistUser();
  updateHomeStats();
  updateCreditUI();
  showToast(`+${amount} crédit${amount > 1 ? 's' : ''} !`);
  flyCoinToCredits(creditProgressBar, amount);
}

claimReserveBtn.addEventListener('click', claimReserve);

function startCreditTimer() {
  stopCreditTimer();
  updateCreditUI();
  tickInterval = setInterval(async () => {
    if (!state) return;
    if (accrueReserve() > 0) {
      await persistUser();
    }
    updateCreditUI();
  }, 1000);
}

function stopCreditTimer() {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
  }
}

function updateCreditUI() {
  if (!state) return;
  creditsValue.textContent = state.credits;
  reserveValue.textContent = `${state.reserve} / ${RESERVE_MAX}`;
  const hasReserve = state.reserve > 0;
  claimReserveBtn.disabled = !hasReserve;
  claimReserveBtn.style.visibility = hasReserve ? '' : 'hidden';
  claimReserveBtn.innerHTML = hasReserve
    ? `Récupérer ${state.reserve} <img class="coin-icon" src="medias/Credit.png" alt="crédits" />`
    : 'Récupérer';
  const elapsed = Date.now() - state.lastClaim;
  const reserveFull = state.reserve >= RESERVE_MAX;
  nextCreditTimer.textContent = reserveFull ? 'Réserve pleine' : formatDuration(CREDIT_INTERVAL_MS - elapsed, true);
  // La barre suit le compte à rebours : progression vers le prochain palier de crédits.
  const pct = reserveFull ? 100 : Math.min(100, Math.max(0, (elapsed / CREDIT_INTERVAL_MS) * 100));
  creditProgressFill.style.width = `${pct}%`;
  updateMultiplierBanner();
  refreshOpenBoosterBtnState();
}

// ============================================================
//  BOUTIQUE : gemmes, multiplicateur, objets
// ============================================================
function updateGemUI() {
  if (!state) return;
  if (gemsValue) gemsValue.textContent = state.gems;
}

function updatePascadesUI() {
  if (!state) return;
  if (pascadesValue) pascadesValue.textContent = state.pascades || 0;
}

function updateLuckPotionLabel() {
  if (!luckPotionActiveLabel) return;
  luckPotionActiveLabel.classList.toggle('hidden', !state || !state.luckyBoosterPending);
}

// ---- Titres ----
function updatePlayerTitle() {
  if (!playerTitle) return;
  const name = state ? titleName(state.equippedTitle) : '';
  playerTitle.textContent = name;
  playerTitle.classList.toggle('hidden', !name);
}

function renderTitleShop() {
  if (!state || !titleShopList) return;
  titleShopList.innerHTML = TITLES.map((t) => {
    const owned = !!(state.ownedTitles && state.ownedTitles[t.id]);
    const canAfford = state.credits >= t.cost;
    const action = owned
      ? '<span class="title-shop-owned">Possédé</span>'
      : `<button type="button" class="title-shop-buy" data-title="${t.id}" ${canAfford ? '' : 'disabled'}>
           Acheter ${t.cost} <img class="coin-icon" src="medias/Credit.png" alt="crédits" />
         </button>`;
    return `
      <div class="title-shop-row ${owned ? 'owned' : ''}">
        <span class="title-shop-name">${escapeHtml(t.name)}</span>
        ${action}
      </div>`;
  }).join('');
}

async function buyTitle(id) {
  if (!state) return;
  const t = TITLE_BY_ID[id];
  if (!t || (state.ownedTitles && state.ownedTitles[id])) return;
  if (state.credits < t.cost) {
    showToast('Pas assez de crédits !');
    return;
  }
  state.credits -= t.cost;
  if (!state.ownedTitles) state.ownedTitles = {};
  state.ownedTitles[id] = true;
  new Audio('medias/buy.wav').play().catch(() => {});
  updateCreditUI();
  updateHomeStats();
  renderBoutique();
  await persistUser();
  showToast(`Titre débloqué : « ${t.name} »`);
}

titleShopList.addEventListener('click', (e) => {
  const btn = e.target.closest('.title-shop-buy[data-title]');
  if (btn && !btn.disabled) buyTitle(btn.dataset.title);
});

let multiplierWasActive = false;
function updateMultiplierBanner() {
  if (!state || !multiplierBanner) return;
  const active = creditMultiplierActive();
  multiplierBanner.classList.toggle('hidden', !active);
  if (active) {
    multiplierBannerTimer.textContent = formatDuration(state.creditMultiplierUntil - Date.now());
  }
  // Rafraîchit le compte à rebours "Actif encore …" de l'objet Multiplicateur ;
  // le `!== active` force un dernier rendu quand l'effet vient d'expirer.
  const boutiqueEl = el('view-boutique');
  if (boutiqueEl && boutiqueEl.classList.contains('active') && (active || multiplierWasActive !== active)) {
    renderBoutique();
  }
  multiplierWasActive = active;
}

function renderBoutique() {
  if (!state || !gemPackGrid) return;
  updateGemUI();

  gemPackGrid.innerHTML = GEM_PACKS.map((p) => `
    <button type="button" class="gem-pack gem-pack-${p.tier}" data-pack="${p.id}" style="background-image:url('medias/${encodeURIComponent(p.img)}')">
      <span class="gem-pack-shine"></span>
      ${p.tag ? `<span class="gem-pack-tag">${escapeHtml(p.tag)}</span>` : ''}
      <span class="gem-pack-info">
        <span class="gem-pack-amount"><img class="gem-icon-img" src="medias/Gemme.png" alt="" />${p.gems.toLocaleString('fr-FR')}</span>
        <span class="gem-pack-sub">${p.bonus ? escapeHtml(p.bonus) : 'gemmes'}</span>
      </span>
      <span class="gem-pack-price">${p.price}</span>
    </button>`).join('');

  shopItemList.innerHTML = getShopItems().map((it) => `
    <button type="button" class="shop-tile ${it.blocked ? 'shop-tile-locked' : ''}" data-item="${it.id}">
      <span class="shop-tile-name">${escapeHtml(it.name)}</span>
      <span class="shop-tile-art">
        <img class="shop-tile-icon" src="medias/${encodeURIComponent(it.img)}" alt="${escapeHtml(it.name)}" />
      </span>
      <span class="shop-tile-price shop-tile-price-${it.currency === 'credits' ? 'credits' : 'gems'}">${currencyIconImg(it.currency)}${it.cost}</span>
    </button>`).join('');

  renderTitleShop();

  // Garde la modale d'un objet synchro si elle est ouverte (dispo/gemmes qui changent).
  if (shopModalItemId && shopItemModal && !shopItemModal.classList.contains('hidden')) {
    renderShopItemModal(shopModalItemId);
  }
}

// Objets de la boutique + état calculé (dispo, note explicative).
// currency: 'gems' (défaut) ou 'credits'.
function getShopItems() {
  const wheelUsed = !isWheelAvailable();
  const poorGems = 'Pas assez de gemmes.';
  const poorCredits = 'Pas assez de crédits.';
  return [
    {
      id: 'credits',
      img: 'Credit.png',
      name: 'Crédits',
      desc: `Échangez ${SHOP_ITEMS.credits.cost} gemmes contre ${SHOP_ITEMS.credits.credits} crédits.`,
      usage: 'Les crédits servent à ouvrir des boosters, acheter des titres et des pascades.',
      currency: 'gems',
      cost: SHOP_ITEMS.credits.cost,
      disabled: state.gems < SHOP_ITEMS.credits.cost,
      blocked: false,
      note: state.gems < SHOP_ITEMS.credits.cost ? poorGems : '',
    },
    {
      id: 'gems',
      img: 'Gemme.png',
      name: 'Gemmes',
      desc: `Échangez ${SHOP_ITEMS.gems.cost} crédits contre ${SHOP_ITEMS.gems.gems} gemmes.`,
      usage: 'Les gemmes servent à acheter les objets de la boutique (Tourne-vis, Potion de Chance). On en gagne aussi via les quêtes.',
      currency: 'credits',
      cost: SHOP_ITEMS.gems.cost,
      disabled: state.credits < SHOP_ITEMS.gems.cost,
      blocked: false,
      note: state.credits < SHOP_ITEMS.gems.cost ? poorCredits : '',
    },
    {
      id: 'wheelReset',
      img: 'TourneVis.png',
      name: 'Tourne-vis',
      desc: "Relance la roue de la fortune une fois de plus aujourd'hui.",
      currency: 'gems',
      cost: SHOP_ITEMS.wheelReset.cost,
      disabled: !wheelUsed || state.gems < SHOP_ITEMS.wheelReset.cost,
      blocked: !wheelUsed,
      note: !wheelUsed
        ? 'La roue est déjà disponible.'
        : (state.gems < SHOP_ITEMS.wheelReset.cost ? poorGems : ''),
    },
    ...PASCADE_PACKS.map((p, i) => ({
      id: `pascade-${i}`,
      img: 'Pascade.png',
      name: `${p.pascades} Pascade${p.pascades > 1 ? 's' : ''}`,
      desc: `Échangez ${p.cost} crédit${p.cost > 1 ? 's' : ''} contre ${p.pascades} pascade${p.pascades > 1 ? 's' : ''}.`,
      usage: 'Offrez des pascades aux autres joueurs. Celui qui en possède le plus décroche la mention « Pascade Pro ».',
      currency: 'credits',
      cost: p.cost,
      disabled: state.credits < p.cost,
      blocked: false,
      note: state.credits < p.cost ? poorCredits : '',
    })),
    {
      id: 'luckPotion',
      img: 'Multiplicateur.png',
      name: 'Potion de Chance',
      desc: 'Vous assure une carte Légendaire dans le prochain booster que vous ouvrez.',
      currency: 'gems',
      cost: SHOP_ITEMS.luckPotion.cost,
      disabled: state.luckyBoosterPending || state.gems < SHOP_ITEMS.luckPotion.cost,
      blocked: state.luckyBoosterPending,
      note: state.luckyBoosterPending
        ? 'Déjà active — elle s\'applique à votre prochain booster.'
        : (state.gems < SHOP_ITEMS.luckPotion.cost ? poorGems : ''),
    },
  ];
}

function currencyIconImg(currency) {
  return currency === 'credits'
    ? '<img class="coin-icon" src="medias/Credit.png" alt="crédits" />'
    : '<img class="gem-icon-img" src="medias/Gemme.png" alt="" />';
}

let shopModalItemId = null;

function renderShopItemModal(id) {
  const it = getShopItems().find((x) => x.id === id);
  if (!it) return;
  const isCredits = it.currency === 'credits';
  if (shopItemModalBalance) shopItemModalBalance.textContent = isCredits ? state.credits : state.gems;
  if (shopItemModalBalanceLabel) shopItemModalBalanceLabel.textContent = isCredits ? 'Crédits possédés' : 'Gemmes possédées';
  if (shopItemModalBalanceIcon) {
    shopItemModalBalanceIcon.src = isCredits ? 'medias/Credit.png' : 'medias/Gemme.png';
    shopItemModalBalanceIcon.classList.toggle('coin-icon', isCredits);
    shopItemModalBalanceIcon.classList.toggle('gem-icon-img', !isCredits);
  }
  shopItemModalIcon.src = `medias/${encodeURIComponent(it.img)}`;
  shopItemModalIcon.alt = it.name;
  shopItemModalName.textContent = it.name;
  shopItemModalDesc.textContent = it.desc;
  shopItemModalUsage.textContent = it.usage || '';
  shopItemModalUsage.classList.toggle('hidden', !it.usage);
  shopItemModalNote.textContent = it.note;
  shopItemModalNote.classList.toggle('hidden', !it.note);
  shopItemModalBuy.disabled = it.disabled;
  shopItemModalBuy.innerHTML = `Acheter ${currencyIconImg(it.currency)}${it.cost}`;
}

function openShopItemModal(id) {
  if (!getShopItems().some((x) => x.id === id)) return;
  shopModalItemId = id;
  renderShopItemModal(id);
  new Audio('medias/Clic2.wav').play().catch(() => {});
  shopItemModal.classList.remove('hidden');
  shopItemModal.getBoundingClientRect();
  shopItemModal.classList.add('open');
}

async function closeShopItemModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  shopItemModal.classList.remove('open');
  await wait(300);
  shopItemModal.classList.add('hidden');
  shopModalItemId = null;
}

async function buyShopItem(id) {
  if (!state) return false;
  if (id === 'luckPotion') {
    if (state.luckyBoosterPending || state.gems < SHOP_ITEMS.luckPotion.cost) return false;
    state.gems -= SHOP_ITEMS.luckPotion.cost;
    state.luckyBoosterPending = true;
    showToast('Potion de Chance bue ! Une Légendaire vous attend au prochain booster.');
  } else if (id === 'wheelReset') {
    if (isWheelAvailable() || state.gems < SHOP_ITEMS.wheelReset.cost) return false;
    state.gems -= SHOP_ITEMS.wheelReset.cost;
    state.lastWheelSpinDate = null;
    updateWheelUI();
    showToast('La roue de la fortune est de nouveau disponible !');
  } else if (id === 'credits') {
    if (state.gems < SHOP_ITEMS.credits.cost) return false;
    state.gems -= SHOP_ITEMS.credits.cost;
    state.credits += SHOP_ITEMS.credits.credits;
    updateCreditUI();
    updateHomeStats();
    flyCoinToCredits(shopItemModalBuy, SHOP_ITEMS.credits.credits);
    showToast(`+${SHOP_ITEMS.credits.credits} crédits !`);
  } else if (id === 'gems') {
    if (state.credits < SHOP_ITEMS.gems.cost) return false;
    state.credits -= SHOP_ITEMS.gems.cost;
    state.gems += SHOP_ITEMS.gems.gems;
    updateCreditUI();
    updateHomeStats();
    flyGemToBalance(shopItemModalBuy, SHOP_ITEMS.gems.gems);
    showToast(`+${SHOP_ITEMS.gems.gems} gemmes !`);
  } else if (id.startsWith('pascade-')) {
    const p = PASCADE_PACKS[Number(id.slice('pascade-'.length))];
    if (!p || state.credits < p.cost) return false;
    state.credits -= p.cost;
    state.pascades = (state.pascades || 0) + p.pascades;
    updateCreditUI();
    updateHomeStats();
    updatePascadesUI();
    flyPascadeToBalance(shopItemModalBuy, p.pascades);
    showToast(`+${p.pascades} pascade${p.pascades > 1 ? 's' : ''} !`);
  } else {
    return false;
  }
  new Audio('medias/buy.wav').play().catch(() => {});
  updateGemUI();
  updateMultiplierBanner();
  updateLuckPotionLabel();
  renderBoutique();
  await persistUser();
  return true;
}

gemPackGrid.addEventListener('click', (e) => {
  if (!e.target.closest('.gem-pack')) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  gemJokeModal.classList.remove('hidden');
  gemJokeModal.getBoundingClientRect();
  gemJokeModal.classList.add('open');
});

async function closeGemJokeModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  gemJokeModal.classList.remove('open');
  await wait(300);
  gemJokeModal.classList.add('hidden');
}
closeGemJokeModalBtn.addEventListener('click', closeGemJokeModal);
gemJokeDismissBtn.addEventListener('click', closeGemJokeModal);
gemJokeModal.addEventListener('click', (e) => { if (e.target === gemJokeModal) closeGemJokeModal(); });

shopItemList.addEventListener('click', (e) => {
  const tile = e.target.closest('.shop-tile');
  if (!tile || !state) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  openShopItemModal(tile.dataset.item);
});

shopItemModalBuy.addEventListener('click', async () => {
  if (!state || !shopModalItemId || shopItemModalBuy.disabled) return;
  const ok = await buyShopItem(shopModalItemId);
  if (ok) closeShopItemModal();
  else renderShopItemModal(shopModalItemId);
});

closeShopItemModalBtn.addEventListener('click', closeShopItemModal);
shopItemModal.addEventListener('click', (e) => { if (e.target === shopItemModal) closeShopItemModal(); });

addGemsBtn.addEventListener('click', async () => {
  if (!state) return;
  state.gems += 5;
  updateGemUI();
  renderBoutique();
  await persistUser();
  showToast('+5 gemmes (dev)');
  flyGemToBalance(addGemsBtn, 5);
});

resetGemsBtn.addEventListener('click', async () => {
  if (!state) return;
  state.gems = 0;
  updateGemUI();
  renderBoutique();
  await persistUser();
  showToast('Gemmes remises à 0 (dev)');
});

addPascadesBtn.addEventListener('click', async () => {
  if (!state) return;
  state.pascades = (state.pascades || 0) + 5;
  updatePascadesUI();
  await persistUser();
  showToast('+5 pascades (dev)');
  flyPascadeToBalance(addPascadesBtn, 5);
});

// Reset des pascades pour TOUS les joueurs (via publicProfiles).
resetPascadesBtn.addEventListener('click', async () => {
  if (!state) return;
  if (!confirm('Remettre à 0 les pascades de TOUS les joueurs ?')) return;
  try {
    const snap = await db.ref('publicProfiles').once('value');
    const updates = {};
    snap.forEach((child) => { updates[`${child.key}/pascades`] = 0; });
    if (Object.keys(updates).length) await db.ref('publicProfiles').update(updates);
    state.pascades = 0;
    updatePascadesUI();
    await persistUser();
    renderPlayerList();
    showToast('Pascades de tous les joueurs remises à 0 (dev)');
  } catch (e) {
    console.error('Reset global des pascades refusé :', e);
    showToast('Reset global refusé (règles Firebase).');
  }
});

// ============================================================
//  BOOSTERS
// ============================================================
function weightedRandomRarity(allowedRarities) {
  const total = allowedRarities.reduce((sum, r) => sum + RARITY_WEIGHTS[r], 0);
  let r = Math.random() * total;
  for (const rarity of allowedRarities) {
    if (r < RARITY_WEIGHTS[rarity]) return rarity;
    r -= RARITY_WEIGHTS[rarity];
  }
  return allowedRarities[allowedRarities.length - 1];
}

function weightedPickCard(pool, boostLocation, boostNew) {
  if (!pool.length) return null;
  const weights = pool.map((c) => {
    let w = 1;
    if (boostLocation && c.type === 'character' && CHARACTER_LOCATIONS[c.character] === boostLocation) w += LOCATION_BONUS;
    if (boostNew && !state.cards[c.id]) w += NEW_CARD_BONUS;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    if (r < weights[i]) return pool[i];
    r -= weights[i];
  }
  return pool[pool.length - 1];
}

function drawCard(allowedRarities, excludeIds, boostLocation, boostNew, extId) {
  const extCards = ALL_CARD_DEFS.filter((c) => c.extension === extId);
  const rarity = weightedRandomRarity(allowedRarities);
  // Fallbacks pour les petites extensions : rareté exacte non-tirée → rareté exacte
  // → n'importe quelle carte non-tirée → tout l'extension.
  const pools = [
    extCards.filter((c) => c.rarity === rarity && !excludeIds.has(c.id)),
    extCards.filter((c) => c.rarity === rarity),
    extCards.filter((c) => !excludeIds.has(c.id)),
    extCards,
  ];
  const pool = pools.find((p) => p.length) || [];
  return weightedPickCard(pool, boostLocation, boostNew);
}

function getEquippedLieu() {
  if (!state || !state.equippedLieuId) return null;
  return LOCATION_CARD_DEFS.find((c) => c.id === state.equippedLieuId) || null;
}

function getEquippedLocation() {
  const lieu = getEquippedLieu();
  return lieu ? lieu.location : null;
}

// ============================================================
//  RÉCOMPENSES DE BOOSTER (cartes lieu Aveyron / Caverne d'Alibaba)
// ============================================================
// Table de tirage de la Caverne d'Alibaba (doublons = poids plus élevé).
const ALIBABA_REWARD_POOL = [
  { kind: 'credits', amount: 1 },
  { kind: 'credits', amount: 1 },
  { kind: 'credits', amount: 3 },
  { kind: 'credits', amount: 5 },
  { kind: 'gems', amount: 1 },
  { kind: 'gems', amount: 1 },
  { kind: 'gems', amount: 3 },
  { kind: 'pascades', amount: 1 },
  { kind: 'pascades', amount: 1 },
  { kind: 'pascades', amount: 3 },
  { kind: 'pascades', amount: 5 },
  { kind: 'pascades', amount: 10 },
  { kind: 'luckPotion', amount: 1 },
  { kind: 'wheelReset', amount: 1 },
];
const LIEU_REWARD_ICONS = {
  credits: 'Credit.png',
  gems: 'Gemme.png',
  pascades: 'Pascade.png',
  luckPotion: 'Multiplicateur.png',
  wheelReset: 'TourneVis.png',
};
function lieuRewardLabel(kind, amount) {
  if (kind === 'luckPotion') return 'Potion de Chance';
  if (kind === 'wheelReset') return 'Tourne-vis';
  const noun = kind === 'credits' ? 'Crédit' : kind === 'gems' ? 'Gemme' : 'Pascade';
  return `+${amount} ${noun}${amount > 1 ? 's' : ''}`;
}

function applyLieuReward(kind, amount) {
  if (kind === 'credits') state.credits += amount;
  else if (kind === 'gems') state.gems += amount;
  else if (kind === 'pascades') state.pascades = (state.pascades || 0) + amount;
  else if (kind === 'luckPotion') state.luckyBoosterPending = true;
  else if (kind === 'wheelReset') state.lastWheelSpinDate = null;
}

// Si le lieu équipé a un effet déclenché à l'ouverture d'un booster (Aveyron,
// Caverne d'Alibaba), applique la récompense à l'état et renvoie une "carte"
// à afficher après le paquet dans la révélation (jamais ajoutée à state.cards).
function computeBoosterBonusReward(equippedLieu) {
  if (!equippedLieu || !state) return null;
  let kind;
  let amount;
  if (equippedLieu.effect === 'boosterPascades') {
    kind = 'pascades';
    amount = equippedLieu.effectAmount || 0;
  } else if (equippedLieu.effect === 'boosterRandomReward') {
    const pick = ALIBABA_REWARD_POOL[Math.floor(Math.random() * ALIBABA_REWARD_POOL.length)];
    kind = pick.kind;
    amount = pick.amount;
  } else {
    return null;
  }
  applyLieuReward(kind, amount);
  return {
    id: `lieu-reward-${kind}`,
    name: lieuRewardLabel(kind, amount),
    type: 'reward',
    rarity: 'epic',
    rewardIconFile: LIEU_REWARD_ICONS[kind],
  };
}

function drawBoosterCards(extId) {
  const excludeIds = new Set();
  const equippedLieu = getEquippedLieu();
  const boostLocation = equippedLieu ? equippedLieu.location : null;
  const boostNew = !!equippedLieu && equippedLieu.effect === 'newCard';
  const cards = BOOSTER_SLOTS.map((allowedRarities) => {
    const card = drawCard(allowedRarities, excludeIds, boostLocation, boostNew, extId);
    if (card) excludeIds.add(card.id);
    return card;
  }).filter(Boolean);

  // Potion de Chance : garantit une Légendaire si le tirage n'en a pas produit.
  if (state.luckyBoosterPending && !cards.some((c) => c.rarity === 'legendary')) {
    const idx = cards.length - 1; // le dernier slot autorise déjà "legendary"
    const others = new Set(cards.filter((_, i) => i !== idx).map((c) => c.id));
    const legendaries = ALL_CARD_DEFS.filter((c) => c.extension === extId && c.rarity === 'legendary');
    let pool = legendaries.filter((c) => !others.has(c.id));
    if (pool.length === 0) pool = legendaries;
    if (pool.length) cards[idx] = weightedPickCard(pool, boostLocation, boostNew);
  }

  return cards;
}

// ---- Sélection de l'extension sur l'accueil (carrousel 3D) ----
function extensionAvailable(ext) {
  return !ext.comingSoon && ALL_CARD_DEFS.some((c) => c.extension === ext.id);
}

// Grise / désactive « Ouvrir un booster » si l'extension n'est pas encore dispo
// ou si le joueur n'a pas assez de crédits.
const OPEN_BOOSTER_LABEL = `<span class="ob-label">Ouvrir un booster</span><span class="ob-price"><span id="boosterCost">${BOOSTER_COST}</span><img class="coin-icon" src="medias/Credit.png" alt="crédits" /></span>`;

function refreshOpenBoosterBtnState() {
  if (!openBoosterBtn) return;
  const ext = EXTENSIONS[currentExtIndex];
  const unavailable = !extensionAvailable(ext);
  const poor = !state || state.credits < BOOSTER_COST;
  // Extension indisponible : reste cliquable pour afficher la notif « Booster indisponible ».
  // Crédits insuffisants : bouton désactivé + libellé « Crédits manquants ».
  openBoosterBtn.disabled = poor && !unavailable;
  openBoosterBtn.classList.toggle('booster-btn-disabled', unavailable || poor);
  const label = (poor && !unavailable)
    ? '<span class="ob-label">Crédits manquants</span>'
    : OPEN_BOOSTER_LABEL;
  if (openBoosterBtn.innerHTML !== label) openBoosterBtn.innerHTML = label;
}

function buildBoosterCarousel() {
  if (!boosterCarousel) return;
  boosterCarousel.innerHTML = EXTENSIONS
    .map((ext, i) => `
      <div class="booster-slide" data-idx="${i}">
        <img class="booster-art" src="medias/${ext.front}" alt="${escapeHtml(ext.name)}" />
      </div>`)
    .join('');
}

function positionBoosterSlides() {
  if (!boosterCarousel) return;
  boosterCarousel.querySelectorAll('.booster-slide').forEach((slide) => {
    const off = Number(slide.dataset.idx) - currentExtIndex;
    const a = Math.abs(off);
    slide.classList.toggle('is-center', off === 0);
    if (off === 0) {
      slide.style.transform = 'translate3d(0,0,0) rotateY(0deg) scale(1)';
      slide.style.opacity = '1';
      slide.style.zIndex = '20';
    } else {
      const dir = off > 0 ? 1 : -1;
      const x = dir * (58 + (a - 1) * 72);
      const z = -140 - (a - 1) * 45;
      const ry = dir * -24;
      const scale = Math.max(0.5, 0.68 - (a - 1) * 0.13);
      slide.style.transform = `translate3d(${x}px, 6px, ${z}px) rotateY(${ry}deg) scale(${scale})`;
      slide.style.opacity = a >= 3 ? '0' : String(Math.max(0, 0.6 - (a - 1) * 0.22));
      slide.style.zIndex = String(20 - a);
    }
  });
}

boosterCarousel?.addEventListener('click', (e) => {
  const slide = e.target.closest('.booster-slide[data-idx]');
  if (!slide) return;
  const idx = Number(slide.dataset.idx);
  if (idx !== currentExtIndex) goToExtension(idx, idx > currentExtIndex ? 1 : -1);
});

function updateBoosterExtension() {
  const ext = EXTENSIONS[currentExtIndex];
  if (boosterCarousel && !boosterCarousel.children.length) buildBoosterCarousel();
  positionBoosterSlides();
  if (boosterExtName) {
    boosterExtName.textContent = ext.name;
    boosterExtName.classList.toggle('is-soon', !!ext.comingSoon);
  }
  if (boosterExtCount) {
    const n = ALL_CARD_DEFS.filter((c) => c.extension === ext.id).length;
    boosterExtCount.textContent = `${n} carte${n > 1 ? 's' : ''}`;
  }
  if (boosterExtDots) {
    // Construit les points une seule fois, puis ne fait que basculer .active
    // pour que le changement de taille se fasse en transition.
    if (boosterExtDots.children.length !== EXTENSIONS.length) {
      boosterExtDots.innerHTML = EXTENSIONS
        .map((_, i) => `<span class="booster-dot" data-ext="${i}"></span>`)
        .join('');
    }
    boosterExtDots.querySelectorAll('.booster-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentExtIndex);
    });
  }
  if (openBoosterBtn) refreshOpenBoosterBtnState();
  if (boosterPrevBtn) boosterPrevBtn.classList.toggle('hidden', EXTENSIONS.length < 2);
  if (boosterNextBtn) boosterNextBtn.classList.toggle('hidden', EXTENSIONS.length < 2);
  boosterExtDots.classList.toggle('hidden', EXTENSIONS.length < 2);
}

function goToExtension(index, dir = 0) {
  const n = EXTENSIONS.length;
  index = ((index % n) + n) % n;
  if (index === currentExtIndex) return;
  currentExtIndex = index;
  try {
    localStorage.setItem(EXT_INDEX_STORAGE_KEY, String(index));
  } catch {
    /* stockage indisponible */
  }
  updateBoosterExtension();
  new Audio('medias/WooshSwitch.wav').play().catch(() => {});
}

boosterPrevBtn.addEventListener('click', () => goToExtension(currentExtIndex - 1, -1));
boosterNextBtn.addEventListener('click', () => goToExtension(currentExtIndex + 1, 1));
boosterExtDots.addEventListener('click', (e) => {
  const dot = e.target.closest('.booster-dot[data-ext]');
  if (dot) goToExtension(Number(dot.dataset.ext), Number(dot.dataset.ext) > currentExtIndex ? 1 : -1);
});

// Swipe tactile sur le booster
(() => {
  const stage = boosterPack.parentElement;
  let startX = null;
  let startY = null;
  stage.addEventListener('touchstart', (e) => {
    if (boosterPack.classList.contains('opening')) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });
  stage.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = startY = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      goToExtension(currentExtIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
    }
  }, { passive: true });
})();

openBoosterBtn.addEventListener('click', async () => {
  if (!state) return;
  const ext = EXTENSIONS[currentExtIndex];
  if (!extensionAvailable(ext)) {
    showToast('Booster indisponible');
    return;
  }
  if (state.credits < BOOSTER_COST) {
    showToast('Pas assez de crédits !');
    return;
  }
  new Audio('medias/buy.wav').play().catch(() => {});
  openBoosterBtn.disabled = true;
  boosterPack.classList.add('opening');

  state.credits -= BOOSTER_COST;
  const drawn = drawBoosterCards(ext.id);
  const usedLuckPotion = state.luckyBoosterPending;
  state.luckyBoosterPending = false; // consommée par cette ouverture
  updateLuckPotionLabel();
  const newCardIds = new Set();
  drawn.forEach((card) => {
    if (!state.cards[card.id]) newCardIds.add(card.id);
    state.cards[card.id] = (state.cards[card.id] || 0) + 1;
  });

  // Lieu équipé à effet déclenché à l'ouverture (Aveyron / Caverne d'Alibaba) :
  // ajoute une "carte" bonus après le paquet, sans la collectionner.
  const bonusReward = computeBoosterBonusReward(getEquippedLieu());
  const revealCardsList = bonusReward ? [...drawn, bonusReward] : drawn;

  markDailyQuest('openBooster');
  updateCreditUI();
  updateHomeStats();
  updateGemUI();
  updatePascadesUI();
  updateWheelUI();
  if (usedLuckPotion || bonusReward) renderBoutique();
  await persistUser();

  showBoosterReveal(revealCardsList, newCardIds, ext);
  boosterPack.classList.remove('opening');
  refreshOpenBoosterBtnState();
});

// ============================================================
//  DON À JOHNNY (récompense unique)
// ============================================================
function updateJohnnyPanel() {
  if (!state) return;
  const hide = state.johnnyDonated || isNewAccountThisSession;
  johnnyDivider.classList.toggle('hidden', hide);
  johnnyPanel.classList.toggle('hidden', hide);
}

donateJohnnyBtn.addEventListener('click', async () => {
  if (!state || state.johnnyDonated) return;
  if (state.credits < JOHNNY_DONATION_COST) {
    showToast('Pas assez de crédits !');
    return;
  }
  state.credits -= JOHNNY_DONATION_COST;
  state.johnnyDonated = true;
  const johnnyId = SPECIAL_CARD_DEFS.find((c) => c.character === 'Johnny').id;
  state.cards[johnnyId] = (state.cards[johnnyId] || 0) + 1;

  updateCreditUI();
  updateHomeStats();
  updateJohnnyPanel();
  renderCollection();
  await persistUser();

  showToast('Johnny vous offre sa carte légendaire !');
  openCardDetail(johnnyId);
});

// ============================================================
//  ROUE QUOTIDIENNE
// ============================================================
function buildWheelDial() {
  const seg = 360 / WHEEL_SLOTS.length;
  const gradient = WHEEL_SLOTS
    .map((slot, i) => `${WHEEL_COLORS[slot.amount]} ${i * seg}deg ${(i + 1) * seg}deg`)
    .join(', ');
  wheelDial.style.background = `conic-gradient(from 0deg, ${gradient})`;

  wheelLabels.innerHTML = WHEEL_SLOTS
    .map((slot, i) => {
      const angle = i * seg + seg / 2;
      return `<span class="wheel-label" style="transform: translate(-50%,-50%) rotate(${angle}deg) translateY(-95px)">+${slot.amount}</span>`;
    })
    .join('');
}
buildWheelDial();

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// ============================================================
//  QUÊTES QUOTIDIENNES
// ============================================================
function ensureDailyQuests() {
  if (!state) return;
  const today = todayKey();
  if (state.dailyQuestDate !== today) {
    state.dailyQuestDate = today;
    state.dailyQuestRecycleRarity = DAILY_QUEST_RECYCLE_RARITIES[Math.floor(Math.random() * DAILY_QUEST_RECYCLE_RARITIES.length)];
    state.dailyQuestProgress = { openBooster: false, recycleCard: false, giftCard: false };
    state.dailyQuestClaimed = false;
  }
}

function markDailyQuest(questId, rarity) {
  if (!state) return;
  ensureDailyQuests();
  if (state.dailyQuestProgress[questId]) return;
  if (questId === 'recycleCard' && rarity !== state.dailyQuestRecycleRarity) return;
  state.dailyQuestProgress[questId] = true;
  updateDailyQuestsUI();
}

function allDailyQuestsDone() {
  if (!state) return false;
  return DAILY_QUEST_LIST.every((q) => state.dailyQuestProgress[q.id]);
}

function updateDailyQuestsUI() {
  if (!state) return;
  ensureDailyQuests();
  dailyQuestList.innerHTML = DAILY_QUEST_LIST.map((q) => {
    const done = !!state.dailyQuestProgress[q.id];
    const label = q.id === 'recycleCard'
      ? `Recycler une carte ${RARITY_LABELS[state.dailyQuestRecycleRarity]}`
      : q.label;
    return `
      <li class="daily-quest-item ${done ? 'done' : ''}">
        <span class="daily-quest-check">${done ? '✓' : ''}</span>
        <span>${escapeHtml(label)}</span>
      </li>`;
  }).join('');
  const allDone = allDailyQuestsDone();
  claimDailyQuestBtn.disabled = !allDone || state.dailyQuestClaimed;
  claimDailyQuestBtn.innerHTML = state.dailyQuestClaimed
    ? 'Récompense récupérée'
    : `Récupérer ${DAILY_QUEST_GEM_REWARD} <img class="coin-icon" src="medias/Gemme.png" alt="gemmes" />`;
}

claimDailyQuestBtn.addEventListener('click', async () => {
  if (!state) return;
  ensureDailyQuests();
  if (!allDailyQuestsDone() || state.dailyQuestClaimed) return;
  state.dailyQuestClaimed = true;
  state.gems += DAILY_QUEST_GEM_REWARD;
  updateHomeStats();
  updateGemUI();
  updateDailyQuestsUI();
  await persistUser();
  showToast(`+${DAILY_QUEST_GEM_REWARD} gemmes !`);
  flyGemToBalance(claimDailyQuestBtn, DAILY_QUEST_GEM_REWARD);
});

function isWheelAvailable() {
  return !state.lastWheelSpinDate || state.lastWheelSpinDate !== todayKey();
}

let wheelSpinning = false;
let wheelRotation = 0;

function updateWheelUI() {
  if (!state) return;
  const available = isWheelAvailable();
  spinWheelBtn.disabled = !available || wheelSpinning;
  wheelHint.textContent = available ? 'Tente ta chance une fois par jour !' : 'Reviens demain pour un nouveau tour !';
  if (wheelLaunchBadge) wheelLaunchBadge.classList.toggle('hidden', !available || wheelSpinning);
}

function openWheelModal() {
  if (!state) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  updateWheelUI();
  wheelModal.classList.remove('hidden');
  wheelModal.getBoundingClientRect();
  wheelModal.classList.add('open');
}
async function closeWheelModal() {
  if (wheelSpinning) return; // ne pas fermer pendant que la roue tourne
  new Audio('medias/Clic2.wav').play().catch(() => {});
  wheelModal.classList.remove('open');
  await wait(300);
  wheelModal.classList.add('hidden');
}
wheelLaunchBtn.addEventListener('click', openWheelModal);
closeWheelModalBtn.addEventListener('click', closeWheelModal);
wheelModal.addEventListener('click', (e) => { if (e.target === wheelModal) closeWheelModal(); });

spinWheelBtn.addEventListener('click', async () => {
  if (!state || wheelSpinning || !isWheelAvailable()) return;
  new Audio('medias/wheel.wav').play().catch(() => {});
  wheelSpinning = true;
  spinWheelBtn.disabled = true;
  wheelHint.textContent = '';

  const seg = 360 / WHEEL_SLOTS.length;
  const index = Math.floor(Math.random() * WHEEL_SLOTS.length);
  const slot = WHEEL_SLOTS[index];
  const segCenter = index * seg + seg / 2;
  const jitter = (Math.random() - 0.5) * (seg * 0.7);
  const targetAngle = segCenter + jitter;
  const currentMod = ((wheelRotation % 360) + 360) % 360;
  let delta = (360 - targetAngle - currentMod) % 360;
  if (delta < 0) delta += 360;
  wheelRotation += delta + 360 * 6;
  wheelDial.style.transform = `rotate(${wheelRotation}deg)`;

  await wait(4600); // matches the wheel-dial CSS transition duration
  wheelSpinning = false;

  state.lastWheelSpinDate = todayKey();
  const gained = grantCredits(slot.amount);
  updateCreditUI();
  updateHomeStats();
  wheelHint.textContent = `Gagné : +${gained} crédit${gained > 1 ? 's' : ''} !`;
  showToast(`Roue : +${gained} crédit${gained > 1 ? 's' : ''} !`);
  await persistUser();
  spinWheelBtn.disabled = true;
  updateWheelUI();
});

// ============================================================
//  LIEUX (équipement depuis l'accueil)
// ============================================================
function getOwnedLieuCards() {
  if (!state) return [];
  return LOCATION_CARD_DEFS.filter((c) => (state.cards[c.id] || 0) > 0);
}

function updateLieuSlotUI() {
  if (!state) return;
  const equipped = state.equippedLieuId ? LOCATION_CARD_DEFS.find((c) => c.id === state.equippedLieuId) : null;
  lieuSlotBtn.classList.remove('equipped', 'lieu-cuisine', 'lieu-salle', 'lieu-reception', 'lieu-jacuzzi');
  if (equipped) {
    lieuSlotArt.innerHTML = cardArtHtml(equipped, escapeHtml(equipped.name));
    lieuSlotPassifLabel.classList.remove('hidden');
    lieuSlotCaption.textContent = equipped.name;
    lieuSlotBtn.classList.add('equipped', `lieu-${equipped.location || 'jacuzzi'}`);
    lieuSlotEffect.textContent = equipped.description;
    lieuSlotEffect.classList.remove('hidden');
  } else {
    lieuSlotArt.innerHTML = '<span class="lieu-slot-empty-icon">➕</span>';
    lieuSlotPassifLabel.classList.add('hidden');
    lieuSlotCaption.textContent = 'Ajouter un lieu';
    lieuSlotEffect.classList.add('hidden');
  }

  const bgFile = equipped
    ? (equipped.bg || (equipped.location ? LOCATION_BG_FILES[equipped.location] : JACUZZI_BG_FILE))
    : 'main-bg.png';
  homeLieuBg.style.backgroundImage = bgFile ? `url("medias/${encodeURIComponent(bgFile)}")` : '';
}

async function revealHomeLieuBg() {
  homeLieuBg.classList.add('no-transition');
  homeLieuBg.classList.remove('visible');
  homeLieuBg.getBoundingClientRect(); // force reflow so opacity:0 applies instantly, without transition
  homeLieuBg.classList.remove('no-transition');
  await wait(500);
  homeLieuBg.classList.add('visible');
}

function lieuTileHtml(card) {
  const owned = (state.cards[card.id] || 0) > 0;
  const equipped = state.equippedLieuId === card.id;
  const art = owned ? cardArtHtml(card, escapeHtml(card.name)) : `<img src="medias/dos-cartes.png" alt="carte non obtenue" />`;
  return `
    <div class="card-tile-wrap ${owned ? '' : 'locked'} ${equipped ? 'lieu-tile-equipped' : ''}" ${owned ? `data-lieu-id="${card.id}"` : ''}>
      <div class="card-tile rarity-${card.rarity}">
        ${art}
        ${owned ? '' : `<span class="lock-icon">${LOCK_ICON_SVG}</span>`}
      </div>
      <div class="card-caption">
        <span class="card-caption-name">${owned ? escapeHtml(card.name) : '???'}</span>
        <span class="card-caption-rarity rarity-${card.rarity}">${RARITY_LABELS[card.rarity]}</span>
      </div>
    </div>`;
}

function renderLieuList() {
  lieuList.innerHTML = LOCATION_CARD_DEFS.map(lieuTileHtml).join('');
  lieuHint.textContent = getOwnedLieuCards().length
    ? ''
    : "Vous ne possédez aucune carte lieu pour l'instant. Ouvrez des boosters pour en trouver !";
  unequipLieuBtn.classList.toggle('hidden', !state.equippedLieuId);
}

lieuSlotBtn.addEventListener('click', () => {
  if (!state) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  renderLieuList();
  lieuModal.classList.remove('hidden');
  lieuModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  lieuModal.classList.add('open');
});

async function closeLieuModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  lieuModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  lieuModal.classList.add('hidden');
}
closeLieuModalBtn.addEventListener('click', closeLieuModal);
lieuModal.addEventListener('click', (e) => { if (e.target === lieuModal) closeLieuModal(); });

lieuList.addEventListener('click', async (e) => {
  const tile = e.target.closest('.card-tile-wrap[data-lieu-id]');
  if (!tile || !state) return;
  state.equippedLieuId = tile.dataset.lieuId;
  updateLieuSlotUI();
  renderLieuList();
  await persistUser();
  showToast('Lieu équipé !');
  closeLieuModal();
});

unequipLieuBtn.addEventListener('click', async () => {
  if (!state) return;
  state.equippedLieuId = null;
  updateLieuSlotUI();
  renderLieuList();
  await persistUser();
  showToast('Lieu retiré.');
});

addCreditsBtn.addEventListener('click', async () => {
  if (!state) return;
  state.credits += 10;
  updateCreditUI();
  updateHomeStats();
  await persistUser();
  showToast('+10 crédits (dev)');
  flyCoinToCredits(addCreditsBtn, 10);
});

resetCreditsBtn.addEventListener('click', async () => {
  if (!state) return;
  state.credits = 0;
  updateCreditUI();
  updateHomeStats();
  await persistUser();
  showToast('Crédits remis à 0 (dev)');
});

resetWheelBtn.addEventListener('click', async () => {
  if (!state) return;
  state.lastWheelSpinDate = null;
  updateWheelUI();
  await persistUser();
  showToast('Roue réinitialisée (dev)');
});

// Remet à zéro les quêtes de collection déjà récupérées.
resetQuestsBtn.addEventListener('click', async () => {
  if (!state) return;
  state.claimedAchievements = {};
  updateHomeStats();
  updateQuestsBadge();
  renderQuests();
  await persistUser();
  showToast('Quêtes récupérées réinitialisées (dev)');
});

// Débloque pour soi-même les 2 nouvelles cartes lieu d'Across the verse (dev).
addExt2LieuxBtn?.addEventListener('click', async () => {
  if (!state) return;
  ['lieu-aveyron', 'lieu-alibaba'].forEach((id) => {
    state.cards[id] = (state.cards[id] || 0) + 1;
  });
  updateHomeStats();
  updateQuestsBadge();
  if (!lieuModal.classList.contains('hidden')) renderLieuList();
  renderCollection(true);
  await persistUser();
  showToast('Cartes lieux Aveyron + Caverne d\'Alibaba ajoutées (dev)');
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let revealQueue = [];
let revealIndex = 0;
let revealNewCardIds = new Set();

function updateRevealProgress() {
  revealProgress.innerHTML = revealQueue
    .map((_, i) => {
      const cls = i < revealIndex ? 'done' : i === revealIndex ? 'active' : '';
      return `<span class="progress-dot ${cls}"></span>`;
    })
    .join('');
}

async function showRevealCard() {
  const card = revealQueue[revealIndex];
  const revealSound = card.rarity === 'legendary'
    ? 'card-reveal-legendary.wav'
    : card.rarity === 'epic'
      ? 'card-reveal-epic.wav'
      : 'card-reveal.wav';
  new Audio(`medias/${revealSound}`).play().catch(() => {});
  updateRevealProgress();
  revealRarityLabel.className = 'reveal-rarity-label';
  revealRarityLabel.textContent = '';
  revealNewBadge.className = 'reveal-new-badge';
  revealNewBadge.textContent = '';
  revealRays.className = 'reveal-rays';

  revealCards.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = `reveal-card rarity-${card.rarity}`;
  wrap.innerHTML = `
    <div class="reveal-card-inner">
      <div class="reveal-card-face reveal-card-back">
        <img src="medias/dos-cartes.png" alt="dos de carte" />
      </div>
      <div class="reveal-card-face reveal-card-front">
        ${cardArtHtml(card, escapeHtml(card.name))}
      </div>
    </div>`;
  revealCards.appendChild(wrap);

  // force layout so the pop-in transition actually plays
  wrap.getBoundingClientRect();
  wrap.classList.add('shown');
  await wait(250);
  wrap.classList.add('flipped'); // triggers the cardFlip keyframes (1.3s, anticipation + overshoot)
  await wait(600); // card front becomes visible partway through the flip, no need to wait for full settle
  // Une carte "récompense" (lieu Aveyron / Caverne d'Alibaba) affiche son
  // libellé (ex. « +3 Pascades ») à la place du nom de rareté.
  revealRarityLabel.textContent = card.type === 'reward' ? card.name : RARITY_LABELS[card.rarity];
  revealRarityLabel.classList.add(`rarity-${card.rarity}`, 'shown');
  revealRays.classList.add(`rarity-${card.rarity}`, 'shown');
  if (revealNewCardIds.has(card.id)) {
    revealNewBadge.textContent = 'Nouvelle carte !';
    revealNewBadge.classList.add('shown');
  }
}

async function showBoosterReveal(cards, newCardIds = new Set(), ext = EXTENSIONS[0]) {
  if (revealBoosterFront) revealBoosterFront.src = `medias/${ext.front}`;
  if (revealBoosterBack) revealBoosterBack.src = `medias/${ext.back}`;
  revealQueue = cards;
  revealIndex = 0;
  revealNewCardIds = newCardIds;
  revealCards.innerHTML = '';
  revealProgress.innerHTML = '';
  revealRarityLabel.className = 'reveal-rarity-label';
  revealRarityLabel.textContent = '';
  revealNewBadge.className = 'reveal-new-badge';
  revealNewBadge.textContent = '';
  revealRays.className = 'reveal-rays';
  revealHint.textContent = "Touche le booster pour l'ouvrir";
  revealHint.classList.remove('hidden');
  revealBoosterArt.classList.remove('hidden', 'spinning');
  boosterModal.classList.remove('hidden');
  boosterModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  boosterModal.classList.add('open');
}

revealBoosterArt.addEventListener('click', async () => {
  if (revealBoosterArt.classList.contains('spinning')) return;
  new Audio('medias/booster-openning.wav').play().catch(() => {});
  revealBoosterArt.classList.add('spinning');
  revealHint.classList.add('hidden');
  await wait(1600); // matches the boosterOpenSpin CSS animation duration
  revealBoosterArt.classList.add('hidden');
  revealBoosterArt.classList.remove('spinning');
  revealHint.textContent = 'Touche la carte pour continuer';
  showRevealCard();
});

revealCards.addEventListener('click', (e) => {
  const cardEl = e.target.closest('.reveal-card.flipped');
  if (!cardEl) return; // ignore taps before the card has finished flipping

  revealIndex += 1;
  if (revealIndex >= revealQueue.length) {
    new Audio('medias/woosh.wav').play().catch(() => {});
    finishBoosterReveal();
    return;
  }
  showRevealCard();
});

async function finishBoosterReveal() {
  revealHint.classList.add('hidden');
  revealRarityLabel.classList.remove('shown');
  revealRays.classList.remove('shown');
  updateRevealProgress();
  boosterModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  boosterModal.classList.add('hidden');
  renderCollection();
}

// ============================================================
//  ACTUALITÉS (modale)
// ============================================================
function formatNewsDate(iso) {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function newsRewardHtml(item) {
  if (!item.reward) return '';
  const claimed = !!(state && state.claimedNewsRewards && state.claimedNewsRewards[item.reward.key]);
  return `<button type="button" class="btn-claim news-reward-btn" data-reward-key="${item.reward.key}" data-reward-amount="${item.reward.amount}" ${claimed ? 'disabled' : ''}>
      ${claimed ? 'Cadeau déjà récupéré' : `Récupérer ${item.reward.amount} crédits`}
    </button>`;
}

function renderNews() {
  newsList.innerHTML = NEWS_ITEMS.map((item) => `
    <article class="news-item">
      <span class="news-item-date">${escapeHtml(formatNewsDate(item.date))}</span>
      <h4 class="news-item-title">${escapeHtml(item.title)}</h4>
      ${(item.body || []).map((p) => `<p class="news-item-body">${escapeHtml(p)}</p>`).join('')}
      ${newsRewardHtml(item)}
    </article>`).join('');
}

newsList.addEventListener('click', async (e) => {
  const btn = e.target.closest('.news-reward-btn[data-reward-key]');
  if (!btn || btn.disabled || !state) return;
  const key = btn.dataset.rewardKey;
  const amount = parseInt(btn.dataset.rewardAmount, 10) || 0;
  if (!state.claimedNewsRewards) state.claimedNewsRewards = {};
  if (state.claimedNewsRewards[key] || amount <= 0) return;

  state.claimedNewsRewards[key] = true;
  btn.disabled = true;
  const gained = grantCredits(amount);
  updateCreditUI();
  updateHomeStats();
  showToast(`+${gained} crédits !`);
  flyCoinToCredits(btn, gained);
  await persistUser();
  renderNews();
});

function updateNewsBadge() {
  const unseen = !!state && (state.lastSeenNewsDate || '') < LATEST_NEWS_DATE;
  newsBadge.classList.toggle('hidden', !unseen);
}

newsBtn.addEventListener('click', () => {
  renderNews();
  newsModal.classList.remove('hidden');
  newsModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  newsModal.classList.add('open');
  if (state && (state.lastSeenNewsDate || '') < LATEST_NEWS_DATE) {
    state.lastSeenNewsDate = LATEST_NEWS_DATE;
    updateNewsBadge();
    persistUser();
  }
});

async function closeNewsModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  newsModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  newsModal.classList.add('hidden');
}
closeNewsModalBtn.addEventListener('click', closeNewsModal);
newsModal.addEventListener('click', (e) => { if (e.target === newsModal) closeNewsModal(); });

// ============================================================
//  QUÊTES / SUCCÈS DE COLLECTION (modale)
// ============================================================
// Deux formes de quête : un ensemble de cartes à posséder (a.cardIds), ou un
// compteur numérique cumulé à atteindre (a.counterKey / a.threshold).
function achievementTotal(a) {
  return a.cardIds ? a.cardIds.length : a.threshold;
}
function achievementOwnedCount(a) {
  if (a.cardIds) return a.cardIds.reduce((n, id) => n + ((state.cards[id] || 0) > 0 ? 1 : 0), 0);
  return Math.min(state[a.counterKey] || 0, a.threshold);
}
function achievementComplete(a) {
  const total = achievementTotal(a);
  return total > 0 && achievementOwnedCount(a) === total;
}
function achievementClaimable(a) {
  return achievementComplete(a) && !state.claimedAchievements[a.id];
}
function anyAchievementClaimable() {
  return !!state && ACHIEVEMENTS.some(achievementClaimable);
}

function updateQuestsBadge() {
  if (!questsBadge) return;
  questsBadge.classList.toggle('hidden', !anyAchievementClaimable());
  if (questsModal && !questsModal.classList.contains('hidden')) renderQuests();
}


function questItemHtml(a) {
  const owned = achievementOwnedCount(a);
  const total = achievementTotal(a);
  const done = owned === total;
  const claimed = !!state.claimedAchievements[a.id];
  const claimable = done && !claimed;
  const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
  const typeClass = a.reward.type === 'gems' ? 'quest-gems' : 'quest-credits';
  const rewardIcon = a.reward.type === 'gems'
    ? '<img class="gem-icon-img" src="medias/Gemme.png" alt="" />'
    : '<img class="coin-icon" src="medias/Credit.png" alt="" />';

  let foot;
  if (claimed) {
    foot = '<span class="quest-claimed">✓ Validée</span>';
  } else if (claimable) {
    foot = `<button type="button" class="btn-primary quest-claim-btn" data-quest="${a.id}">Récupérer la récompense</button>`;
  } else {
    foot = `
      <div class="quest-bar"><div class="quest-bar-fill" style="width:${pct}%"></div></div>
      <span class="quest-bar-count">${owned}/${total}</span>`;
  }

  return `
    <div class="quest-item ${typeClass} ${done ? 'done' : ''} ${claimed ? 'claimed' : ''}">
      <div class="quest-item-titlewrap">
        <span class="quest-caption">Objectif</span>
        <span class="quest-item-label">${escapeHtml(a.label)}</span>
        ${a.sublabel ? `<span class="quest-item-sub">${escapeHtml(a.sublabel)}</span>` : ''}
      </div>
      <div class="quest-reward-cell">
        <span class="quest-caption">Récompense</span>
        <span class="quest-reward-badge">${rewardIcon}${a.reward.amount}</span>
      </div>
      <div class="quest-item-foot">${foot}</div>
    </div>`;
}

function renderQuests() {
  if (!state) return;
  const ongoing = ACHIEVEMENTS.filter((a) => !state.claimedAchievements[a.id]);
  const validated = ACHIEVEMENTS.filter((a) => !!state.claimedAchievements[a.id]);
  let html = ongoing.map(questItemHtml).join('');
  if (validated.length) {
    html += `<div class="quests-section-title">Quêtes validées</div>${validated.map(questItemHtml).join('')}`;
  }
  questsList.innerHTML = html;
}

questsList.addEventListener('click', async (e) => {
  const btn = e.target.closest('.quest-claim-btn[data-quest]');
  if (!btn || !state) return;
  const a = ACHIEVEMENTS.find((x) => x.id === btn.dataset.quest);
  if (!a || !achievementClaimable(a)) return;

  btn.disabled = true;
  state.claimedAchievements[a.id] = true;
  let msg;
  if (a.reward.type === 'gems') {
    state.gems += a.reward.amount;
    updateGemUI();
    msg = `+${a.reward.amount} gemmes !`;
    flyGemToBalance(btn, a.reward.amount);
  } else {
    const gained = grantCredits(a.reward.amount);
    updateCreditUI();
    msg = `+${gained} crédit${gained > 1 ? 's' : ''} !`;
    flyCoinToCredits(btn, gained);
  }
  new Audio('medias/Coin.wav').play().catch(() => {});
  updateHomeStats();
  updateQuestsBadge();
  renderQuests();
  await persistUser();
  showToast(msg);
});

function openQuestsModal() {
  if (!state) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  renderQuests();
  questsModal.classList.remove('hidden');
  questsModal.getBoundingClientRect();
  questsModal.classList.add('open');
}
async function closeQuestsModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  questsModal.classList.remove('open');
  await wait(300);
  questsModal.classList.add('hidden');
}
questsBtn.addEventListener('click', openQuestsModal);
closeQuestsModalBtn.addEventListener('click', closeQuestsModal);
questsModal.addEventListener('click', (e) => { if (e.target === questsModal) closeQuestsModal(); });

// ============================================================
//  NAVIGATION
// ============================================================
const devTools = el('devTools');
const DEV_TOOLS_UNLOCK_TAPS = 10;
const DEV_TOOLS_TAP_TIMEOUT_MS = 2000;

document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const sound = new Audio('medias/clic.wav');
    sound.volume = 0.3;
    sound.play().catch(() => {});
    switchView(btn.dataset.view);
  });
});

// Déblocage des outils dev : 10 clics sur la 3e photo de profil (modale "Mon profil").
let devTapCount = 0;
let devTapTimeout = null;
function registerDevUnlockTap() {
  if (!devTools.classList.contains('hidden')) return;
  devTapCount += 1;
  clearTimeout(devTapTimeout);
  devTapTimeout = setTimeout(() => { devTapCount = 0; }, DEV_TOOLS_TAP_TIMEOUT_MS);
  if (devTapCount >= DEV_TOOLS_UNLOCK_TAPS) {
    devTapCount = 0;
    devTools.classList.remove('hidden');
    showToast('Outils dev activés');
  }
}

function switchView(view, { instant } = {}) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  el(`view-${view}`).classList.add('active');
  const scroller = document.querySelector('.views');
  if (scroller) scroller.scrollTop = 0;
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  appShell.classList.toggle('home-view', view === 'home');
  if (view === 'collection') {
    renderCollection(true);
    renderExtFilters(true);
    animateRarityFilterChips();
  }
  if (view === 'community') {
    renderPlayerList();
    animateCommunityStaticElements();
  }
  if (view === 'boutique') renderBoutique();
  quickRecycleBtn.classList.toggle('hidden', view !== 'collection');
  if (view !== 'collection' && !quickRecycleModal.classList.contains('hidden')) closeQuickRecycleModal();
  revealQuestsLaunchRow(view === 'home');
}

// Les boutons Quêtes / Roue / Actualité apparaissent peu après l'affichage de l'accueil.
let questsRowRevealTimer = null;
function revealQuestsLaunchRow(onHome) {
  const row = document.querySelector('.quests-launch-row');
  if (!row) return;
  clearTimeout(questsRowRevealTimer);
  row.classList.remove('revealed');
  if (onHome) {
    questsRowRevealTimer = setTimeout(() => row.classList.add('revealed'), 300);
  }
}

// ============================================================
//  COLLECTION
// ============================================================
// Rejoue une petite animation de rebond au clic (boutons de filtre).
function bouncePress(elm) {
  elm.classList.remove('chip-bounce');
  void elm.offsetWidth; // force reflow pour pouvoir rejouer l'animation
  elm.classList.add('chip-bounce');
}

document.querySelectorAll('.filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    bouncePress(chip);
    new Audio('medias/Clic2.wav').play().catch(() => {});
    document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.rarity === 'default' ? null : chip.dataset.rarity;
    renderCollection(true);
  });
});

// Filtre par extension (généré depuis EXTENSIONS pour rester synchro avec les noms)
const extFilters = el('extFilters');
function renderExtFilters(animate = false) {
  if (!extFilters) return;
  // On masque les extensions « à venir » (aucune carte) de la liste des filtres.
  const opts = [{ id: 'all', name: 'Toutes' }, ...EXTENSIONS.filter((e) => extensionAvailable(e))];
  extFilters.innerHTML = opts
    .map((o, i) => `<button type="button" class="ext-filter-chip${o.id === currentExtFilter ? ' active' : ''}${animate ? ' filter-chip-pop' : ''}" data-ext="${o.id}"${animate ? ` style="animation-delay:${i * 60}ms"` : ''}>${escapeHtml(o.name)}</button>`)
    .join('');
}

// Rejoue l'animation d'entrée un-à-un des chips de filtre de rareté (statiques
// dans le HTML) chaque fois que l'onglet Collection est affiché.
function animateRarityFilterChips() {
  const chips = document.querySelectorAll('#view-collection .rarity-filters:not(.ext-filters) .filter-chip');
  chips.forEach((chip) => chip.classList.remove('filter-chip-pop'));
  void el('view-collection')?.offsetWidth; // force reflow avant de rejouer l'animation
  chips.forEach((chip, i) => {
    chip.style.animationDelay = `${i * 60}ms`;
    chip.classList.add('filter-chip-pop');
  });
}

// Rejoue l'animation d'entrée des éléments statiques de l'onglet Communauté
// (séparateur, recherche, tri) chaque fois que l'onglet est affiché. La liste
// des joueurs (#playerList / #myPlayerRow) s'anime elle-même via renderPlayerRows.
function animateCommunityStaticElements() {
  const slideItems = [
    document.querySelector('#view-community .ornate-divider'),
    el('playerSearch'),
  ].filter(Boolean);
  const popItems = [
    document.querySelector('.player-sort-label'),
    ...document.querySelectorAll('.player-sort-chip'),
  ].filter(Boolean);
  slideItems.forEach((elm) => elm.classList.remove('row-slide-in'));
  popItems.forEach((elm) => elm.classList.remove('filter-chip-pop'));
  void el('view-community')?.offsetWidth; // force reflow avant de rejouer l'animation
  slideItems.forEach((elm, i) => {
    elm.style.animationDelay = `${i * 60}ms`;
    elm.classList.add('row-slide-in');
  });
  popItems.forEach((elm, i) => {
    elm.style.animationDelay = `${(slideItems.length + i) * 60}ms`;
    elm.classList.add('filter-chip-pop');
  });
}
extFilters?.addEventListener('click', (e) => {
  const chip = e.target.closest('.ext-filter-chip[data-ext]');
  if (!chip) return;
  bouncePress(chip);
  new Audio('medias/Clic2.wav').play().catch(() => {});
  currentExtFilter = chip.dataset.ext;
  extFilters.querySelectorAll('.ext-filter-chip').forEach((c) => c.classList.toggle('active', c === chip));
  renderCollection(true);
});
renderExtFilters();

function cardArtHtml(card, alt) {
  if (card.type === 'reward') {
    return `<div class="lieu-art lieu-jacuzzi reward-art"><img class="reward-art-icon" src="medias/${card.rewardIconFile}" alt="" /></div>`;
  }
  if (card.type === 'lieu' && !card.file) {
    return `<div class="lieu-art lieu-${card.location || 'jacuzzi'}"><span class="lieu-art-icon">${card.icon}</span></div>`;
  }
  return `<img src="medias/${encodeURIComponent(card.file)}" alt="${alt}" />`;
}

function cardTileHtml(card, delayIndex) {
  const count = state.cards[card.id] || 0;
  const owned = count > 0;
  const recyclable = owned && count >= RECYCLE_RULES[card.rarity].minOwned;
  const art = owned ? cardArtHtml(card, escapeHtml(card.name)) : `<img src="medias/dos-cartes.png" alt="carte non obtenue" />`;
  const animClass = delayIndex != null ? ' card-pop-in' : '';
  const animStyle = delayIndex != null ? ` style="animation-delay:${Math.min(delayIndex * 20, 500)}ms"` : '';
  return `
    <div class="card-tile-wrap ${owned ? '' : 'locked'}${animClass}" ${owned ? `data-card-id="${card.id}"` : ''}${animStyle}>
      <div class="card-tile rarity-${card.rarity}">
        ${art}
        ${recyclable ? `<span class="recycle-badge" title="Recyclage disponible">${RECYCLE_ICON_SVG}</span>` : ''}
        ${owned ? `<span class="card-count">x${count}</span>` : ''}
      </div>
      <div class="card-caption">
        <span class="card-caption-name">${owned ? escapeHtml(card.name) : '???'}</span>
        <span class="card-caption-rarity rarity-${card.rarity}">${RARITY_LABELS[card.rarity]}</span>
      </div>
    </div>`;
}

function renderCollection(animate = false) {
  if (!state) return;
  const byExt = currentExtFilter === 'all' ? ALL_CARD_DEFS : ALL_CARD_DEFS.filter((c) => c.extension === currentExtFilter);
  const filtered = (currentFilter === null || currentFilter === 'all') ? byExt : byExt.filter((c) => c.rarity === currentFilter);
  cardGrid.classList.toggle('hide-captions', currentFilter !== null);

  let cardIndex = 0;
  const tileHtml = (card) => cardTileHtml(card, animate ? cardIndex++ : null);

  if (currentFilter === null) {
    const groupLabel = (c) => c.type === 'special' ? 'Cartes Spécial' : c.character;
    const groups = [...new Set(filtered.map(groupLabel))];
    cardGrid.innerHTML = groups
      .map((group) => {
        const tiles = filtered.filter((c) => groupLabel(c) === group).map(tileHtml).join('');
        return `<div class="card-group-title">${escapeHtml(group)}</div>${tiles}`;
      })
      .join('');
  } else {
    cardGrid.innerHTML = filtered.map(tileHtml).join('');
  }
}

// ============================================================
//  CARD DETAIL / RECYCLAGE
// ============================================================
let detailCardId = null;

cardGrid.addEventListener('click', (e) => {
  const wrap = e.target.closest('.card-tile-wrap[data-card-id]');
  if (!wrap) return;
  openCardDetail(wrap.dataset.cardId);
});

function openCardDetail(cardId) {
  detailCardId = cardId;
  renderCardDetail();
  cardDetailModal.classList.remove('hidden');
  cardDetailModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  cardDetailModal.classList.add('open');
}

async function closeCardDetailModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  cardDetailModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  cardDetailModal.classList.add('hidden');
  detailCardId = null;
}

function renderCardDetail() {
  if (!state || !detailCardId) return;
  const card = ALL_CARD_DEFS.find((c) => c.id === detailCardId);
  const count = state.cards[detailCardId] || 0;
  if (!card || count <= 0) {
    cardDetailModal.classList.add('hidden');
    return;
  }

  if (card.type === 'lieu' && !card.file) {
    cardDetailImg.classList.add('hidden');
    cardDetailLieuArt.className = `lieu-art lieu-${card.location || 'jacuzzi'}`;
    cardDetailLieuArt.classList.remove('hidden');
    cardDetailLieuIcon.textContent = card.icon;
  } else {
    cardDetailLieuArt.classList.add('hidden');
    cardDetailImg.classList.remove('hidden');
    cardDetailImg.src = `medias/${encodeURIComponent(card.file)}`;
    cardDetailImg.alt = card.name;
  }
  if (card.type === 'lieu') {
    cardDetailEffect.textContent = card.description;
    cardDetailEffect.classList.remove('hidden');
  } else {
    cardDetailEffect.classList.add('hidden');
  }
  cardDetailName.textContent = card.name;
  cardDetailRarity.textContent = RARITY_LABELS[card.rarity];
  cardDetailRarity.className = `card-detail-rarity rarity-${card.rarity}`;
  cardDetailCount.textContent = `Possédée ${count} fois`;

  const rule = RECYCLE_RULES[card.rarity];
  if (count > 1) {
    recycleBtn.classList.remove('hidden');
    recycleBtn.textContent = `Recycler ${rule.cost} → +${rule.reward} crédit${rule.reward > 1 ? 's' : ''}`;
    const eligible = count >= rule.minOwned;
    recycleBtn.disabled = !eligible;
    recycleHint.classList.remove('hidden');
    recycleHint.textContent = eligible
      ? `Il t'en restera ${count - rule.cost} après recyclage.`
      : `Il faut au moins ${rule.minOwned} exemplaires pour recycler cette rareté.`;
  } else {
    recycleBtn.classList.add('hidden');
    recycleHint.classList.add('hidden');
  }
}

recycleBtn.addEventListener('click', async () => {
  if (!state || !detailCardId) return;
  const card = ALL_CARD_DEFS.find((c) => c.id === detailCardId);
  const count = state.cards[detailCardId] || 0;
  const rule = RECYCLE_RULES[card.rarity];
  if (count < rule.minOwned) return;

  new Audio('medias/recycling.wav').play().catch(() => {});
  state.cards[detailCardId] = count - rule.cost;
  state.credits += rule.reward;
  flyCoinToCredits(recycleBtn, rule.reward);
  markDailyQuest('recycleCard', card.rarity);

  updateCreditUI();
  updateHomeStats();
  renderCollection();
  renderCardDetail();
  await persistUser();
  showToast(`+${rule.reward} crédit${rule.reward > 1 ? 's' : ''} !`);
});

closeCardDetail.addEventListener('click', closeCardDetailModal);
cardDetailModal.addEventListener('click', (e) => { if (e.target === cardDetailModal) closeCardDetailModal(); });

// ============================================================
//  RECYCLAGE RAPIDE (bouton fixe de la collection)
// ============================================================
const QUICK_RECYCLE_RARITIES = ['common', 'rare', 'epic', 'legendary'];

// Combien de doublons d'une rareté peuvent être recyclés (chaque carte gardée en 1 ex.).
function quickRecycleSummary(rarity) {
  const rule = RECYCLE_RULES[rarity];
  let ops = 0;
  let uniqueCards = 0;
  ALL_CARD_DEFS.filter((c) => c.rarity === rarity).forEach((c) => {
    const count = state.cards[c.id] || 0;
    if (count < rule.minOwned) return;
    const n = Math.floor((count - 1) / rule.cost);
    if (n > 0) { ops += n; uniqueCards += 1; }
  });
  return { ops, uniqueCards, cardsConsumed: ops * rule.cost, credits: ops * rule.reward };
}

function renderQuickRecycleChoices() {
  const rows = QUICK_RECYCLE_RARITIES.map((rarity) => {
    const s = quickRecycleSummary(rarity);
    const empty = s.ops === 0;
    return `
      <button type="button" class="qr-choice rarity-${rarity} ${empty ? 'qr-choice-empty' : ''}" data-rarity="${rarity}" ${empty ? 'disabled' : ''}>
        <span class="qr-choice-info">
          <span class="qr-choice-name">Cartes ${RARITY_LABELS[rarity].toLowerCase()}s</span>
          <span class="qr-choice-count">${empty ? 'Aucun doublon à recycler' : `${s.cardsConsumed} carte${s.cardsConsumed > 1 ? 's' : ''} en double`}</span>
        </span>
        <span class="qr-choice-reward"><img class="coin-icon" src="medias/Credit.png" alt="" /> +${s.credits}</span>
      </button>`;
  }).join('');
  quickRecycleBody.innerHTML = `
    <h3 class="qr-title">Recyclage rapide</h3>
    <p class="qr-sub">Recycle d'un coup tous les doublons d'une rareté. Chaque carte concernée reste dans ta collection en 1 exemplaire.</p>
    <div class="qr-choices">${rows}</div>`;
}

function renderQuickRecycleConfirm(rarity) {
  const s = quickRecycleSummary(rarity);
  const label = RARITY_LABELS[rarity].toLowerCase();
  const cPlural = s.cardsConsumed > 1 ? 's' : '';
  const uPlural = s.uniqueCards > 1 ? 's' : '';
  quickRecycleBody.innerHTML = `
    <h3 class="qr-title">Confirmer le recyclage</h3>
    <div class="qr-confirm-box rarity-${rarity}">
      <p><strong>${s.cardsConsumed} carte${cPlural} ${label}${cPlural}</strong> en double seront recyclées, réparties sur <strong>${s.uniqueCards} carte${uPlural}</strong> différente${uPlural}.</p>
      <p>Chaque carte concernée sera conservée en <strong>1 exemplaire</strong>. Cette action est irréversible.</p>
      <p class="qr-confirm-gain">Tu recevras <img class="coin-icon" src="medias/Credit.png" alt="" /> <strong>+${s.credits} crédits</strong>.</p>
    </div>
    <div class="qr-confirm-actions">
      <button type="button" class="btn-dev qr-back-btn">Retour</button>
      <button type="button" class="btn-primary qr-confirm-btn" data-rarity="${rarity}">Recycler</button>
    </div>`;
}

async function performQuickRecycle(rarity) {
  if (!state) return;
  const rule = RECYCLE_RULES[rarity];
  let ops = 0;
  ALL_CARD_DEFS.filter((c) => c.rarity === rarity).forEach((c) => {
    const count = state.cards[c.id] || 0;
    if (count < rule.minOwned) return;
    const n = Math.floor((count - 1) / rule.cost);
    if (n > 0) {
      state.cards[c.id] = count - n * rule.cost;
      ops += n;
    }
  });
  if (ops === 0) { closeQuickRecycleModal(); return; }

  const consumed = ops * rule.cost;
  const credits = ops * rule.reward;
  state.credits += credits;
  markDailyQuest('recycleCard', rarity);
  new Audio('medias/recycling.wav').play().catch(() => {});
  flyCoinToCredits(quickRecycleBtn, credits);
  updateCreditUI();
  updateHomeStats();
  renderCollection(true);
  await persistUser();
  showToast(`${consumed} carte${consumed > 1 ? 's' : ''} recyclée${consumed > 1 ? 's' : ''} · +${credits} crédit${credits > 1 ? 's' : ''}`);
  closeQuickRecycleModal();
}

function openQuickRecycleModal() {
  if (!state) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  renderQuickRecycleChoices();
  quickRecycleModal.classList.remove('hidden');
  quickRecycleModal.getBoundingClientRect();
  quickRecycleModal.classList.add('open');
}
async function closeQuickRecycleModal() {
  quickRecycleModal.classList.remove('open');
  await wait(300);
  quickRecycleModal.classList.add('hidden');
}

quickRecycleBtn.addEventListener('click', openQuickRecycleModal);
closeQuickRecycleModalBtn.addEventListener('click', closeQuickRecycleModal);
quickRecycleModal.addEventListener('click', (e) => { if (e.target === quickRecycleModal) closeQuickRecycleModal(); });

quickRecycleBody.addEventListener('click', async (e) => {
  const choice = e.target.closest('.qr-choice[data-rarity]');
  if (choice && !choice.disabled) {
    new Audio('medias/Clic2.wav').play().catch(() => {});
    renderQuickRecycleConfirm(choice.dataset.rarity);
    return;
  }
  if (e.target.closest('.qr-back-btn')) {
    renderQuickRecycleChoices();
    return;
  }
  const confirmBtn = e.target.closest('.qr-confirm-btn[data-rarity]');
  if (confirmBtn) {
    confirmBtn.disabled = true;
    await performQuickRecycle(confirmBtn.dataset.rarity);
  }
});

// ============================================================
//  COMMUNITY / PLAYER LIST
// ============================================================
const GOLD_FRAME_KEYWORDS = ['elo', 'val', 'bichu', 'chef', 'matthias', 'rault', 'anaïs', 'denis', 'louis', 'emily', 'maho', 'gabin', 'louann', 'tété'];

const COMMUNITY_SORT_KEY = 'communitySort';
const COMMUNITY_FAV_KEY = 'communityFavorites';

function loadCommunitySort() {
  try {
    const s = localStorage.getItem(COMMUNITY_SORT_KEY);
    return ['unique', 'pascades', 'favorites'].includes(s) ? s : 'unique';
  } catch {
    return 'unique';
  }
}
function loadFavoritePlayers() {
  try {
    const a = JSON.parse(localStorage.getItem(COMMUNITY_FAV_KEY) || '[]');
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function saveFavoritePlayers() {
  try {
    localStorage.setItem(COMMUNITY_FAV_KEY, JSON.stringify(favoritePlayers));
  } catch {
    /* stockage indisponible */
  }
}
function isFavoritePlayer(uid) {
  return favoritePlayers.includes(uid);
}
function toggleFavoritePlayer(uid) {
  const i = favoritePlayers.indexOf(uid);
  if (i === -1) favoritePlayers.push(uid);
  else favoritePlayers.splice(i, 1);
  saveFavoritePlayers();
}

let playerSort = loadCommunitySort(); // 'pascades' | 'unique' | 'favorites'
let favoritePlayers = loadFavoritePlayers();
let playerSearchQuery = '';

function normalizeStr(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function sortPlayerRows(rows) {
  const byName = (a, b) => (a.displayName || '').localeCompare(b.displayName || '');
  return rows.slice().sort((a, b) => {
    const pasc = (b.pascades || 0) - (a.pascades || 0);
    const uniq = (b.uniqueCount || 0) - (a.uniqueCount || 0);
    if (playerSort === 'favorites') {
      const fav = (isFavoritePlayer(b.uid) ? 1 : 0) - (isFavoritePlayer(a.uid) ? 1 : 0);
      return fav || uniq || pasc || byName(a, b);
    }
    return playerSort === 'unique' ? (uniq || pasc || byName(a, b)) : (pasc || uniq || byName(a, b));
  });
}

function buildPlayerRow(r, delay, maxPascades) {
  const avatar = AVATAR_OPTIONS.includes(r.avatar) ? r.avatar : AVATAR_OPTIONS[0];
  const isMe = state && r.uid === state.uid;
  const nameLower = (r.displayName || '').toLowerCase();
  const isGold = GOLD_FRAME_KEYWORDS.some((k) => nameLower.includes(k));
  const title = titleName(r.equippedTitle);
  const isPascadePro = maxPascades > 0 && (r.pascades || 0) === maxPascades;
  const bubble = (r.bubbleText || '').trim();
  const avatarTint = hexToRgba(getAvatarColor(avatar), 0.4);
  return `
    <div class="player-row row-slide-in" style="animation-delay:${delay}ms" data-uid="${r.uid}">
      ${bubble ? `<div class="player-bubble bubble-pop-in" style="--bubble-tint: ${avatarTint}; animation-delay:${delay}ms;">${escapeHtml(bubble)}</div>` : ''}
      <div class="player-card${isMe ? ' player-row-me' : ''}${isGold ? ' player-row-gold' : ''}${isPascadePro ? ' player-card-pascade-pro' : ''}">
      <div class="player-header" style="background: linear-gradient(135deg, ${avatarTint} 0%, var(--bg-app) 100%);">
        <img class="player-avatar" src="medias/${avatar}" alt="" />
        <div class="player-name-block">
          <span class="player-name">${escapeHtml(r.displayName || 'Joueur')}${isMe ? ' (toi)' : ''}</span>
          ${title ? `<span class="player-title">${escapeHtml(title)}</span>` : ''}
          ${isPascadePro ? '<span class="player-badge-pro"><img src="medias/Pascade.png" alt="" />Pascade Pro</span>' : ''}
        </div>
        ${isMe ? `<button type="button" class="player-bubble-edit" data-act="bubble" aria-label="Éditer ma bulle de dialogue">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T845-624L318-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
        </button>` : `<button type="button" class="player-fav-btn${isFavoritePlayer(r.uid) ? ' is-fav' : ''}" data-uid="${r.uid}" aria-label="Ajouter aux favoris" aria-pressed="${isFavoritePlayer(r.uid) ? 'true' : 'false'}">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960"><path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/></svg>
        </button>`}
      </div>
      <div class="player-stats-row">
        <div class="player-stats-box">
          <div class="player-stat">
            <span class="player-stat-value">${r.pascades || 0} <img class="pascade-icon" src="medias/Pascade.png" alt="" /></span>
            <span class="player-stat-label">Pascade</span>
          </div>
          <div class="player-stat">
            <span class="player-stat-value">${r.uniqueCount || 0}/${ALL_CARD_DEFS.length}</span>
            <span class="player-stat-label">Cartes uniques</span>
          </div>
          <div class="player-stat">
            <span class="player-stat-value">${r.totalCount || 0}</span>
            <span class="player-stat-label">Cartes totales</span>
          </div>
        </div>
        ${isMe ? '' : `<button type="button" class="player-gift-btn" data-uid="${r.uid}" aria-label="Offrir un cadeau">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M160-160v-360q-33 0-56.5-23.5T80-600v-80q0-33 23.5-56.5T160-760h128q-5-9-6.5-19t-1.5-21q0-50 35-85t85-35q23 0 43 8.5t37 23.5q17-16 37-24t43-8q50 0 85 35t35 85q0 11-2 20.5t-6 19.5h128q33 0 56.5 23.5T880-680v80q0 33-23.5 56.5T800-520v360q0 33-23.5 56.5T720-80H240q-33 0-56.5-23.5T160-160Zm371.5-668.5Q520-817 520-800t11.5 28.5Q543-760 560-760t28.5-11.5Q600-783 600-800t-11.5-28.5Q577-840 560-840t-28.5 11.5ZM360-800q0 17 11.5 28.5T400-760q17 0 28.5-11.5T440-800q0-17-11.5-28.5T400-840q-17 0-28.5 11.5T360-800ZM160-680v80h280v-80H160Zm280 520v-360H240v360h200Zm80 0h200v-360H520v360Zm280-440v-80H520v80h280Z"/></svg>
          <span class="player-gift-btn-label">Cadeau</span>
        </button>`}
      </div>
      </div>
    </div>`;
}

function renderPlayerRows() {
  const all = latestPublicProfiles || [];
  // "Pascade Pro" = joueur(s) avec le plus de pascades (calculé sur la liste complète).
  const maxPascades = all.reduce((m, r) => Math.max(m, r.pascades || 0), 0);

  // Ma card est aussi affichée à part, juste sous le titre (en plus de la liste).
  const me = state ? all.find((r) => r.uid === state.uid) : null;
  if (myPlayerRow) myPlayerRow.innerHTML = me ? buildPlayerRow(me, 0, maxPascades) : '';

  const q = normalizeStr(playerSearchQuery.trim());
  const filtered = q ? all.filter((r) => normalizeStr(r.displayName).includes(q)) : all;
  const rows = sortPlayerRows(filtered);

  if (!all.length) {
    playerList.innerHTML = '<p class="player-list-empty">Aucun joueur pour le moment.</p>';
    return;
  }
  if (!rows.length) {
    playerList.innerHTML = '<p class="player-list-empty">Aucun joueur ne correspond à cette recherche.</p>';
    return;
  }
  playerList.innerHTML = rows
    .map((r, i) => buildPlayerRow(r, q ? 0 : Math.min(i * 50, 800), maxPascades))
    .join('');
}

async function renderPlayerList() {
  playerList.innerHTML = '<p class="player-list-empty">Chargement...</p>';
  try {
    const snap = await db.ref('publicProfiles').once('value');
    const rows = [];
    snap.forEach((child) => { rows.push({ uid: child.key, ...child.val() }); });
    latestPublicProfiles = rows;
    renderPlayerRows();
  } catch (e) {
    console.error('Chargement des joueurs refusé :', e);
    playerList.innerHTML = '<p class="player-list-empty">Impossible de charger la liste des joueurs.</p>';
  }
}

function syncPlayerSortChips() {
  document.querySelectorAll('.player-sort-chip').forEach((c) => {
    c.classList.toggle('active', c.dataset.sort === playerSort);
  });
}
document.querySelectorAll('.player-sort-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    if (chip.classList.contains('active')) return;
    bouncePress(chip);
    new Audio('medias/Clic2.wav').play().catch(() => {});
    playerSort = chip.dataset.sort;
    try {
      localStorage.setItem(COMMUNITY_SORT_KEY, playerSort);
    } catch {
      /* stockage indisponible */
    }
    syncPlayerSortChips();
    renderPlayerRows();
  });
});
syncPlayerSortChips();

const playerSearch = el('playerSearch');
playerSearch.addEventListener('input', () => {
  playerSearchQuery = playerSearch.value;
  renderPlayerRows();
});

if (myPlayerRow) {
  myPlayerRow.addEventListener('click', (e) => {
    if (!state) return;
    if (e.target.closest('.player-bubble-edit')) {
      new Audio('medias/Clic2.wav').play().catch(() => {});
      openBubbleEditModal();
    }
  });
}

playerList.addEventListener('click', (e) => {
  if (!state) return;
  const favBtn = e.target.closest('.player-fav-btn[data-uid]');
  if (favBtn) {
    new Audio('medias/Clic2.wav').play().catch(() => {});
    toggleFavoritePlayer(favBtn.dataset.uid);
    renderPlayerRows();
    return;
  }
  if (e.target.closest('.player-bubble-edit')) {
    new Audio('medias/Clic2.wav').play().catch(() => {});
    openBubbleEditModal();
    return;
  }
  const btn = e.target.closest('.player-gift-btn[data-uid]');
  if (!btn) return;
  const uid = btn.dataset.uid;
  if (uid === state.uid) return;
  const profile = latestPublicProfiles.find((p) => p.uid === uid);
  if (!profile) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  openGiftChoiceModal(profile);
});

// ============================================================
//  CADEAUX ENTRE JOUEURS
// ============================================================
function giftPickTileHtml(card, count, selected) {
  return `
    <div class="card-tile-wrap ${selected ? 'selected' : ''}" data-pick-id="${card.id}">
      <div class="card-tile rarity-${card.rarity}">
        ${cardArtHtml(card, escapeHtml(card.name))}
        <span class="card-count">x${count}</span>
      </div>
      <div class="card-caption">
        <span class="card-caption-name">${escapeHtml(card.name)}</span>
      </div>
    </div>`;
}

function renderGiftPicker() {
  const myOwned = ALL_CARD_DEFS.filter((c) => (state.cards[c.id] || 0) > 0);
  if (!myOwned.length) {
    giftMyCards.innerHTML = '<p class="gift-pick-empty">Tu ne possèdes aucune carte à offrir.</p>';
  } else {
    const order = ['common', 'rare', 'epic', 'legendary'];
    giftMyCards.innerHTML = order.map((rarity) => {
      const cards = myOwned.filter((c) => c.rarity === rarity);
      if (!cards.length) return '';
      const tiles = cards.map((c) => giftPickTileHtml(c, state.cards[c.id], c.id === giftCardId)).join('');
      return `<div class="card-group-title">${RARITY_LABELS[rarity]}s</div>${tiles}`;
    }).join('');
  }
  submitGiftBtn.disabled = !giftCardId;
}

giftMyCards.addEventListener('click', (e) => {
  const tile = e.target.closest('.card-tile-wrap[data-pick-id]');
  if (!tile) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  giftCardId = tile.dataset.pickId === giftCardId ? null : tile.dataset.pickId;
  renderGiftPicker();
});

function openSendGiftModal(profile) {
  if (!state) return;
  giftTarget = profile;
  giftCardId = null;
  giftPartnerName.textContent = profile.displayName || 'Joueur';
  renderGiftPicker();
  sendGiftModal.classList.remove('hidden');
  sendGiftModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  sendGiftModal.classList.add('open');
}

// ---- Choix du type de cadeau (carte ou pascades) ----
let giftChoiceTarget = null;

function openGiftChoiceModal(profile) {
  if (!state) return;
  giftChoiceTarget = profile;
  giftChoicePartnerName.textContent = profile.displayName || 'Joueur';
  giftChoiceModal.classList.remove('hidden');
  giftChoiceModal.getBoundingClientRect();
  giftChoiceModal.classList.add('open');
}

async function closeGiftChoiceModal() {
  giftChoiceModal.classList.remove('open');
  await wait(300);
  giftChoiceModal.classList.add('hidden');
}

closeGiftChoiceModalBtn.addEventListener('click', closeGiftChoiceModal);
giftChoiceModal.addEventListener('click', (e) => { if (e.target === giftChoiceModal) closeGiftChoiceModal(); });
giftChoicePascadeBtn.addEventListener('click', async () => {
  const p = giftChoiceTarget;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  await closeGiftChoiceModal();
  if (p) openSendPascadeModal(p);
});
giftChoiceCardBtn.addEventListener('click', async () => {
  const p = giftChoiceTarget;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  await closeGiftChoiceModal();
  if (p) openSendGiftModal(p);
});

// ---- Bulle de dialogue (perso du joueur, visible par tous) ----
const BUBBLE_MAX = 180;

function updateBubbleCount() {
  bubbleEditCount.textContent = `${bubbleEditInput.value.length} / ${BUBBLE_MAX}`;
}

function openBubbleEditModal() {
  if (!state) return;
  bubbleEditInput.value = state.bubbleText || '';
  updateBubbleCount();
  bubbleEditModal.classList.remove('hidden');
  bubbleEditModal.getBoundingClientRect();
  bubbleEditModal.classList.add('open');
  setTimeout(() => bubbleEditInput.focus(), 50);
}
async function closeBubbleEditModal() {
  bubbleEditModal.classList.remove('open');
  await wait(300);
  bubbleEditModal.classList.add('hidden');
}

bubbleEditInput.addEventListener('input', updateBubbleCount);
closeBubbleEditModalBtn.addEventListener('click', closeBubbleEditModal);
bubbleEditModal.addEventListener('click', (e) => { if (e.target === bubbleEditModal) closeBubbleEditModal(); });

bubbleEditClearBtn.addEventListener('click', () => {
  bubbleEditInput.value = '';
  updateBubbleCount();
  bubbleEditInput.focus();
});

bubbleEditSaveBtn.addEventListener('click', async () => {
  if (!state) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  state.bubbleText = bubbleEditInput.value.trim().slice(0, BUBBLE_MAX);
  bubbleEditSaveBtn.disabled = true;
  await persistUser();
  bubbleEditSaveBtn.disabled = false;
  const me = (latestPublicProfiles || []).find((p) => p.uid === state.uid);
  if (me) me.bubbleText = state.bubbleText;
  showToast('Bulle de dialogue enregistrée !');
  await closeBubbleEditModal();
  renderPlayerRows();
});

async function closeSendGiftModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  sendGiftModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  sendGiftModal.classList.add('hidden');
}
closeSendGiftModalBtn.addEventListener('click', closeSendGiftModal);
sendGiftModal.addEventListener('click', (e) => { if (e.target === sendGiftModal) closeSendGiftModal(); });

submitGiftBtn.addEventListener('click', async () => {
  if (!state || !giftTarget || !giftCardId) return;
  if ((state.cards[giftCardId] || 0) < 1) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  submitGiftBtn.disabled = true;

  const newRef = db.ref('gifts').push();
  try {
    await newRef.set({
      fromUid: state.uid,
      fromName: state.displayName,
      fromAvatar: state.avatar,
      toUid: giftTarget.uid,
      toName: giftTarget.displayName || 'Joueur',
      toAvatar: giftTarget.avatar || AVATAR_OPTIONS[0],
      cardId: giftCardId,
      claimed: false,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error('Envoi du cadeau refusé :', err);
    showToast('Erreur — impossible d\'envoyer ce cadeau.');
    submitGiftBtn.disabled = false;
    return;
  }

  state.cards[giftCardId] -= 1;
  if (state.cards[giftCardId] <= 0) delete state.cards[giftCardId];
  markDailyQuest('giftCard');
  await persistUser();
  updateHomeStats();
  renderCollection();
  showToast('Cadeau envoyé !');
  closeSendGiftModal();
});

// ---- Cadeau de pascades ----
let pascadeGiftTarget = null;
let pascadeGiftValue = 1;

function renderPascadeGift() {
  const max = state ? (state.pascades || 0) : 0;
  pascadeGiftValue = Math.max(0, Math.min(pascadeGiftValue, max));
  pascadeGiftAmountEl.textContent = pascadeGiftValue;
  pascadeGiftBalanceEl.textContent = max;
  pascadeGiftMinusBtn.disabled = pascadeGiftValue <= 1;
  pascadeGiftPlusBtn.disabled = pascadeGiftValue >= max;
  submitPascadeGiftBtn.disabled = pascadeGiftValue < 1;
}

function openSendPascadeModal(profile) {
  if (!state) return;
  pascadeGiftTarget = profile;
  pascadeGiftValue = (state.pascades || 0) > 0 ? 1 : 0;
  pascadeGiftPartnerName.textContent = profile.displayName || 'Joueur';
  renderPascadeGift();
  sendPascadeModal.classList.remove('hidden');
  sendPascadeModal.getBoundingClientRect();
  sendPascadeModal.classList.add('open');
}

async function closeSendPascadeModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  sendPascadeModal.classList.remove('open');
  await wait(300);
  sendPascadeModal.classList.add('hidden');
}
closeSendPascadeModalBtn.addEventListener('click', closeSendPascadeModal);
sendPascadeModal.addEventListener('click', (e) => { if (e.target === sendPascadeModal) closeSendPascadeModal(); });
pascadeGiftMinusBtn.addEventListener('click', () => { pascadeGiftValue -= 1; renderPascadeGift(); });
pascadeGiftPlusBtn.addEventListener('click', () => { pascadeGiftValue += 1; renderPascadeGift(); });

submitPascadeGiftBtn.addEventListener('click', async () => {
  if (!state || !pascadeGiftTarget) return;
  const amount = Math.min(pascadeGiftValue, state.pascades || 0);
  if (amount < 1) return;
  new Audio('medias/Clic2.wav').play().catch(() => {});
  submitPascadeGiftBtn.disabled = true;

  const newRef = db.ref('gifts').push();
  try {
    await newRef.set({
      fromUid: state.uid,
      fromName: state.displayName,
      fromAvatar: state.avatar,
      toUid: pascadeGiftTarget.uid,
      toName: pascadeGiftTarget.displayName || 'Joueur',
      toAvatar: pascadeGiftTarget.avatar || AVATAR_OPTIONS[0],
      pascades: amount,
      claimed: false,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.error('Envoi des pascades refusé :', err);
    showToast("Erreur — impossible d'envoyer ces pascades.");
    submitPascadeGiftBtn.disabled = false;
    return;
  }

  state.pascades -= amount;
  state.totalPascadesGifted = (state.totalPascadesGifted || 0) + amount;
  await persistUser();
  updatePascadesUI();
  updateQuestsBadge();
  showToast(`${amount} pascade${amount > 1 ? 's' : ''} envoyée${amount > 1 ? 's' : ''} !`);
  closeSendPascadeModal();
});

// Cadeaux entrants pour ce joueur : listener scopé sur toUid (pas besoin de lire
// tout l'arbre "gifts" comme le faisait l'ancien système d'échange). child_added
// se déclenche pour chaque cadeau déjà présent à la connexion (rattrapage hors-ligne)
// puis pour chaque nouveau cadeau en direct si le joueur est déjà connecté.
function startGiftsListener() {
  stopGiftsListener();
  if (!state) return;
  giftsRef = db.ref('gifts').orderByChild('toUid').equalTo(state.uid);
  giftsRef.on('child_added', (snap) => {
    const gift = snap.val();
    const id = snap.key;
    if (!gift || gift.claimed || claimingGiftIds.has(id)) return;
    claimGift(id, gift);
  }, (err) => {
    console.error('Lecture des cadeaux refusée :', err);
  });
}

function stopGiftsListener() {
  if (giftsRef) {
    giftsRef.off();
    giftsRef = null;
  }
}

async function claimGift(id, gift) {
  if (!state || gift.toUid !== state.uid || gift.claimed) return;
  claimingGiftIds.add(id);
  if (gift.pascades) {
    state.pascades = (state.pascades || 0) + gift.pascades;
  } else {
    state.cards[gift.cardId] = (state.cards[gift.cardId] || 0) + 1;
  }
  await persistUser();
  await db.ref(`gifts/${id}`).update({ claimed: true, claimedAt: Date.now() }).catch((err) => {
    console.error('Confirmation du cadeau refusée :', err);
  });
  updateHomeStats();
  updatePascadesUI();
  renderCollection();
  pendingGiftQueue.push(gift);
  showNextGiftModal();
  claimingGiftIds.delete(id);
}

function showNextGiftModal() {
  if (giftModalShowing) return;
  const gift = pendingGiftQueue.shift();
  if (!gift) return;
  giftModalShowing = true;
  if (gift.pascades) {
    giftReceivedArt.innerHTML = '<img src="medias/Pascade.png" alt="" class="gift-received-pascade" />';
    giftReceivedName.textContent = `+${gift.pascades} pascade${gift.pascades > 1 ? 's' : ''}`;
    giftReceivedRarity.textContent = '';
    giftReceivedRarity.className = 'card-detail-rarity';
  } else {
    const card = ALL_CARD_DEFS.find((c) => c.id === gift.cardId);
    if (card) {
      giftReceivedArt.innerHTML = cardArtHtml(card, escapeHtml(card.name));
      giftReceivedName.textContent = card.name;
      giftReceivedRarity.textContent = RARITY_LABELS[card.rarity];
      giftReceivedRarity.className = `card-detail-rarity rarity-${card.rarity}`;
    }
  }
  giftReceivedFrom.textContent = `Offert par ${gift.fromName || 'un joueur'}`;
  giftReceivedModal.classList.remove('hidden');
  giftReceivedModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  giftReceivedModal.classList.add('open');
}

async function closeGiftReceivedModal() {
  new Audio('medias/Clic2.wav').play().catch(() => {});
  giftReceivedModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  giftReceivedModal.classList.add('hidden');
  giftModalShowing = false;
  showNextGiftModal();
}
closeGiftReceivedModalBtn.addEventListener('click', closeGiftReceivedModal);

function giftHistoryRowHtml(gift) {
  const sent = gift.fromUid === state.uid;
  const otherName = sent ? gift.toName : gift.fromName;
  const card = ALL_CARD_DEFS.find((c) => c.id === gift.cardId);
  const thumb = gift.pascades
    ? '<img src="medias/Pascade.png" alt="" />'
    : (card ? cardArtHtml(card, escapeHtml(card.name)) : '<span>?</span>');
  const date = gift.createdAt ? new Date(gift.createdAt).toLocaleDateString() : '';
  return `
    <div class="gift-row">
      <div class="gift-row-thumb">${thumb}</div>
      <div class="gift-row-info">
        <span class="gift-row-text">${sent ? 'Envoyé à' : 'Reçu de'} ${escapeHtml(otherName || 'Joueur')}</span>
        <span class="gift-row-date">${date}</span>
      </div>
    </div>`;
}

async function renderGiftsHistory() {
  if (!state) return;
  giftsSection.innerHTML = '<p class="player-list-empty">Chargement...</p>';
  try {
    const [sentSnap, receivedSnap] = await Promise.all([
      db.ref('gifts').orderByChild('fromUid').equalTo(state.uid).once('value'),
      db.ref('gifts').orderByChild('toUid').equalTo(state.uid).once('value'),
    ]);
    const entries = [];
    sentSnap.forEach((child) => { entries.push({ id: child.key, ...child.val() }); });
    receivedSnap.forEach((child) => {
      if (!entries.some((e) => e.id === child.key)) entries.push({ id: child.key, ...child.val() });
    });
    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    giftsSection.innerHTML = entries.length
      ? entries.slice(0, 20).map(giftHistoryRowHtml).join('')
      : '';
  } catch (e) {
    console.error('Chargement des cadeaux refusé :', e);
    giftsSection.innerHTML = '<p class="player-list-empty">Impossible de charger l\'historique des cadeaux.</p>';
  }
}

// ============================================================
//  RENDER ALL (au login)
// ============================================================
function updateHomeStats() {
  if (!state) return;
  const uniqueOwned = Object.keys(state.cards).length;
  const totalOwned = Object.values(state.cards).reduce((a, b) => a + b, 0);
  statOwned.textContent = totalOwned;
  statUnique.textContent = `${uniqueOwned}/${ALL_CARD_DEFS.length}`;
  creditsValue.textContent = state.credits;
  updateQuestsBadge();
}

function renderAll() {
  playerName.textContent = state.displayName;
  avatarImg.src = `medias/${state.avatar}`;
  updatePlayerTitle();
  updateBoosterExtension();
  updateHomeStats();
  updateCreditUI();
  updateWheelUI();
  updateLieuSlotUI();
  updateJohnnyPanel();
  updateDailyQuestsUI();
  updateNewsBadge();
  updateGemUI();
  updatePascadesUI();
  updateMultiplierBanner();
  updateLuckPotionLabel();
  renderBoutique();
  renderCollection();
  switchView('home', { instant: true });
}
