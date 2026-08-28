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
}));

// ============================================================
//  PERSONNAGES SPÉCIAUX (catégorie à part, ne suit pas le cycle
//  common/rare/epic/legendary d'un personnage classique)
// ============================================================
const RAW_SPECIAL_CARDS = [
  ['Gabin-maitre', 'Gabin Maître des horloges', 'legendary'],
  ['Johnny', 'Johnny 50 Euros', 'legendary'],
  ['Elodie-Fantome', 'Elodie Fantôme de Diane', 'legendary'],
];

const SPECIAL_CARD_DEFS = RAW_SPECIAL_CARDS.map(([file, name, rarity]) => ({
  id: slugify(file),
  name,
  file: `${file}.png`,
  rarity,
  character: file.split('-')[0],
  type: 'special',
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
  location: null,
  effect: 'newCard',
  icon: '🛁',
  file: null,
  description: "Offre un bonus de +10% de chance d'obtenir de nouvelles cartes dans vos prochains boosters.",
});

const ALL_CARD_DEFS = [...CARD_DEFS, ...SPECIAL_CARD_DEFS, ...LOCATION_CARD_DEFS];

const RARITY_WEIGHTS = { common: 50, rare: 30, epic: 15, legendary: 5 };
const RARITY_LABELS = { common: 'Commune', rare: 'Rare', epic: 'Épique', legendary: 'Légendaire' };
const CREDIT_INTERVAL_MS = 10 * 60 * 1000; // 1 crédit de réserve toutes les 10 minutes
const RESERVE_MAX = 60; // capacité maximale de la réserve de crédits
const LOADING_SCREEN_MIN_MS = 1000; // durée d'affichage supplémentaire de l'écran de chargement
const BOOSTER_COST = 30;
const STARTING_CREDITS = 100;
const JOHNNY_DONATION_COST = 50;
const DAILY_QUEST_REWARD = 20;
const DAILY_QUEST_RECYCLE_RARITIES = ['common', 'rare', 'epic'];
const DAILY_QUEST_LIST = [
  { id: 'openBooster', label: 'Ouvrir un booster' },
  { id: 'recycleCard', label: 'Recycler une carte' },
  { id: 'giftCard', label: 'Offrir une carte à un autre joueur' },
];

// Raretés autorisées pour chacune des 5 cartes d'un booster (dans l'ordre du tirage)
const BOOSTER_SLOTS = [
  ['common', 'rare'],
  ['common'],
  ['common', 'rare'],
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

const AVATAR_OPTIONS = ['PP/Defaut.png', 'PP/Matthias.PNG', 'PP/Valentin.PNG', 'PP/Denis.PNG', 'PP/Elodie.png', 'PP/Anais.PNG', 'PP/Louis.PNG', 'PP/Louann.PNG', 'PP/Val.PNG', 'PP/Bichu.PNG', 'PP/Emilie.PNG'];

// Roue quotidienne : 11 cases (1 perdu, 3x1, 3x3, 3x10, 1x30 crédits), tirage équiprobable
const WHEEL_SLOTS = [
  { type: 'credits', amount: 1 },
  { type: 'credits', amount: 3 },
  { type: 'credits', amount: 10 },
  { type: 'credits', amount: 1 },
  { type: 'credits', amount: 30 },
  { type: 'credits', amount: 3 },
  { type: 'credits', amount: 10 },
  { type: 'credits', amount: 1 },
  { type: 'lose' },
  { type: 'credits', amount: 3 },
  { type: 'credits', amount: 10 },
];
const WHEEL_COLORS = { lose: '#454a54', 1: '#8a94a3', 3: '#0ac8b9', 10: '#a855f7', 30: '#e8b923' };

// ============================================================
//  ACTUALITÉS
// ============================================================
// Ajoute les nouvelles entrées en tête de liste (la plus récente en premier).
// date : 'AAAA-MM-JJ' — body : un paragraphe par chaîne du tableau.
const NEWS_ITEMS = [
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

const authForm = el('authForm');
const authEmail = el('authEmail');
const authPassword = el('authPassword');
const authName = el('authName');
const registerNameField = el('registerNameField');
const authError = el('authError');
const authSubmit = el('authSubmit');

const playerName = el('playerName');
const avatarImg = el('avatarImg');
const creditsValue = el('creditsValue');
const logoutBtn = el('logoutBtn');

const profileModal = el('profileModal');
const closeProfileModalBtn = el('closeProfileModal');
const profileNameInput = el('profileNameInput');
const avatarGrid = el('avatarGrid');
const saveProfileBtn = el('saveProfileBtn');

const nextCreditTimer = el('nextCreditTimer');
const creditProgressBar = el('creditProgressBar');
const creditProgressFill = el('creditProgressFill');
const reserveValue = el('reserveValue');
const claimReserveBtn = el('claimReserveBtn');
const openBoosterBtn = el('openBoosterBtn');
const boosterPack = el('boosterPack');
const addCreditsBtn = el('addCreditsBtn');
const resetCardsBtn = el('resetCardsBtn');
const resetWheelBtn = el('resetWheelBtn');
const unlockAllCardsBtn = el('unlockAllCardsBtn');
const statOwned = el('statOwned');
const statUnique = el('statUnique');
const johnnyDivider = el('johnnyDivider');
const johnnyPanel = el('johnnyPanel');
const donateJohnnyBtn = el('donateJohnnyBtn');
const dailyQuestList = el('dailyQuestList');
const claimDailyQuestBtn = el('claimDailyQuestBtn');

const collectionProgress = el('collectionProgress');
const cardGrid = el('cardGrid');

const playerList = el('playerList');
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

const boosterModal = el('boosterModal');
const revealCards = el('revealCards');
const revealProgress = el('revealProgress');
const revealHint = el('revealHint');
const revealBoosterArt = el('revealBoosterArt');
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

const newsBtn = el('newsBtn');
const newsBadge = el('newsBadge');
const newsModal = el('newsModal');
const closeNewsModalBtn = el('closeNewsModal');
const newsList = el('newsList');

const toast = el('toast');

// ============================================================
//  APP STATE
// ============================================================
let state = null; // { uid, email, displayName, credits, lastClaim, cards }
let isNewAccountThisSession = false;
let currentFilter = 'all';
let tickInterval = null;
let toastTimeout = null;
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

function pulseCreditsValue() {
  creditsValue.classList.remove('credit-pop');
  void creditsValue.offsetWidth; // force le redémarrage de l'animation CSS
  creditsValue.classList.add('credit-pop');
}

function spawnFlyingCoin(srcRect) {
  const dstRect = creditsValue.getBoundingClientRect();
  const startX = srcRect.left + srcRect.width / 2;
  const startY = srcRect.top + srcRect.height / 2;
  const endX = dstRect.left + dstRect.width / 2;
  const endY = dstRect.top + dstRect.height / 2;
  const peakX = (startX + endX) / 2 + (Math.random() * 40 - 20);
  const peakY = Math.min(startY, endY) - 50;

  const coin = document.createElement('img');
  coin.src = 'medias/Credit.png';
  coin.className = 'flying-coin';
  coin.style.left = `${startX}px`;
  coin.style.top = `${startY}px`;
  document.body.appendChild(coin);

  const anim = coin.animate([
    { transform: 'translate(-50%, -50%) scale(1) rotate(0deg)', offset: 0, opacity: 1 },
    { transform: `translate(calc(-50% + ${peakX - startX}px), calc(-50% + ${peakY - startY}px)) scale(1.15) rotate(220deg)`, offset: 0.45, opacity: 1 },
    { transform: `translate(calc(-50% + ${endX - startX}px), calc(-50% + ${endY - startY}px)) scale(.25) rotate(400deg)`, offset: 1, opacity: 0.15 },
  ], { duration: 1400, easing: 'cubic-bezier(.3,.55,.35,1)' });

  anim.onfinish = () => {
    coin.remove();
    pulseCreditsValue();
  };
}

function flyCoinToCredits(sourceEl, count = 1) {
  if (!isElementVisible(sourceEl) || !isElementVisible(creditsValue)) {
    pulseCreditsValue();
    return;
  }
  // Capturé maintenant, avant qu'un re-render (ex: renderCardDetail après recyclage)
  // ne masque ou ne déplace sourceEl — sinon le setTimeout lirait une position obsolète.
  const srcRect = sourceEl.getBoundingClientRect();
  const n = Math.min(count, 3);
  for (let i = 0; i < n; i++) {
    setTimeout(() => spawnFlyingCoin(srcRect), i * 220);
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.add('hidden'), 2500);
}

function formatDuration(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
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
  profileModal.classList.remove('hidden');
  profileModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  profileModal.classList.add('open');
}

async function closeProfileModal() {
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
  playerName.textContent = state.displayName;
  avatarImg.src = `medias/${state.avatar}`;
  await persistUser();
  showToast('Profil mis à jour !');
  closeProfileModal();
});

closeProfileModalBtn.addEventListener('click', closeProfileModal);
profileModal.addEventListener('click', (e) => { if (e.target === profileModal) closeProfileModal(); });

auth.onAuthStateChanged(async (user) => {
  if (user) {
    showScreen('loadingScreen');
    try {
      await loadUserData(user);
      await persistUser();
    } catch (err) {
      console.error('Lecture des données joueur refusée :', err);
      showScreen('authScreen');
      authError.textContent = 'Impossible de charger vos données (vérifiez les règles Firebase). Réessayez.';
      authError.classList.remove('hidden');
      auth.signOut();
      return;
    }
    renderAll();
    await wait(LOADING_SCREEN_MIN_MS);
    showScreen('appShell');
    revealHomeLieuBg();
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
    };
  } else {
    isNewAccountThisSession = true;
    state = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      credits: STARTING_CREDITS,
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
    cards: state.cards,
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
  const added = Math.min(ticks, RESERVE_MAX - state.reserve);
  state.reserve += added;
  state.lastClaim += ticks * CREDIT_INTERVAL_MS;
  return added;
}

async function claimReserve() {
  if (!state || state.reserve <= 0) return;
  const amount = state.reserve;
  state.credits += amount;
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
  claimReserveBtn.disabled = state.reserve <= 0;
  const elapsed = Date.now() - state.lastClaim;
  const reserveFull = state.reserve >= RESERVE_MAX;
  nextCreditTimer.textContent = reserveFull ? 'Réserve pleine' : formatDuration(CREDIT_INTERVAL_MS - elapsed);
  const fractional = reserveFull ? 0 : elapsed / CREDIT_INTERVAL_MS;
  const pct = Math.min(100, Math.max(0, ((state.reserve + fractional) / RESERVE_MAX) * 100));
  creditProgressFill.style.width = `${pct}%`;
}

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

function drawCard(allowedRarities, excludeIds, boostLocation, boostNew) {
  const rarity = weightedRandomRarity(allowedRarities);
  const pool = ALL_CARD_DEFS.filter((c) => c.rarity === rarity && !excludeIds.has(c.id));
  const finalPool = pool.length > 0 ? pool : ALL_CARD_DEFS.filter((c) => c.rarity === rarity);
  return weightedPickCard(finalPool, boostLocation, boostNew);
}

function getEquippedLieu() {
  if (!state || !state.equippedLieuId) return null;
  return LOCATION_CARD_DEFS.find((c) => c.id === state.equippedLieuId) || null;
}

function getEquippedLocation() {
  const lieu = getEquippedLieu();
  return lieu ? lieu.location : null;
}

function drawBoosterCards() {
  const excludeIds = new Set();
  const equippedLieu = getEquippedLieu();
  const boostLocation = equippedLieu ? equippedLieu.location : null;
  const boostNew = !!equippedLieu && equippedLieu.effect === 'newCard';
  return BOOSTER_SLOTS.map((allowedRarities) => {
    const card = drawCard(allowedRarities, excludeIds, boostLocation, boostNew);
    excludeIds.add(card.id);
    return card;
  });
}

openBoosterBtn.addEventListener('click', async () => {
  if (!state) return;
  if (state.credits < BOOSTER_COST) {
    showToast('Pas assez de crédits !');
    return;
  }
  new Audio('medias/buy.wav').play().catch(() => {});
  openBoosterBtn.disabled = true;
  boosterPack.classList.add('opening');

  state.credits -= BOOSTER_COST;
  const drawn = drawBoosterCards();
  const newCardIds = new Set();
  drawn.forEach((card) => {
    if (!state.cards[card.id]) newCardIds.add(card.id);
    state.cards[card.id] = (state.cards[card.id] || 0) + 1;
  });

  markDailyQuest('openBooster');
  updateCreditUI();
  updateHomeStats();
  await persistUser();

  showBoosterReveal(drawn, newCardIds);
  boosterPack.classList.remove('opening');
  openBoosterBtn.disabled = false;
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
    .map((slot, i) => `${WHEEL_COLORS[slot.type === 'lose' ? 'lose' : slot.amount]} ${i * seg}deg ${(i + 1) * seg}deg`)
    .join(', ');
  wheelDial.style.background = `conic-gradient(from 0deg, ${gradient})`;

  wheelLabels.innerHTML = WHEEL_SLOTS
    .map((slot, i) => {
      const angle = i * seg + seg / 2;
      const label = slot.type === 'lose' ? '✕' : `+${slot.amount}`;
      return `<span class="wheel-label" style="transform: translate(-50%,-50%) rotate(${angle}deg) translateY(-95px)">${label}</span>`;
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
  claimDailyQuestBtn.textContent = state.dailyQuestClaimed
    ? 'Récompense récupérée'
    : `Récupérer ${DAILY_QUEST_REWARD} Crédits`;
}

claimDailyQuestBtn.addEventListener('click', async () => {
  if (!state) return;
  ensureDailyQuests();
  if (!allDailyQuestsDone() || state.dailyQuestClaimed) return;
  state.dailyQuestClaimed = true;
  state.credits += DAILY_QUEST_REWARD;
  updateCreditUI();
  updateHomeStats();
  updateDailyQuestsUI();
  await persistUser();
  showToast(`+${DAILY_QUEST_REWARD} crédits !`);
  flyCoinToCredits(claimDailyQuestBtn, DAILY_QUEST_REWARD);
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
}

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
  if (slot.type === 'lose') {
    wheelHint.textContent = 'Perdu ! Retente ta chance demain.';
    showToast('Roue : perdu cette fois-ci !');
  } else {
    state.credits += slot.amount;
    updateCreditUI();
    updateHomeStats();
    wheelHint.textContent = `Gagné : +${slot.amount} crédit${slot.amount > 1 ? 's' : ''} !`;
    showToast(`Roue : +${slot.amount} crédit${slot.amount > 1 ? 's' : ''} !`);
  }
  await persistUser();
  spinWheelBtn.disabled = true;
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

  const bgFile = equipped ? LOCATION_BG_FILES[equipped.location] : 'main-bg.png';
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
  renderLieuList();
  lieuModal.classList.remove('hidden');
  lieuModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  lieuModal.classList.add('open');
});

async function closeLieuModal() {
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
});

resetCardsBtn.addEventListener('click', async () => {
  if (!state) return;
  if (!confirm('Réinitialiser toutes les cartes possédées ? Cette action est irréversible.')) return;
  state.cards = {};
  state.johnnyDonated = false;
  state.equippedLieuId = null;
  state.credits = STARTING_CREDITS;
  updateHomeStats();
  updateJohnnyPanel();
  updateLieuSlotUI();
  updateCreditUI();
  renderCollection();
  await persistUser();
  showToast('Collection réinitialisée (dev)');
});

resetWheelBtn.addEventListener('click', async () => {
  if (!state) return;
  state.lastWheelSpinDate = null;
  updateWheelUI();
  await persistUser();
  showToast('Roue réinitialisée (dev)');
});

unlockAllCardsBtn.addEventListener('click', async () => {
  if (!state) return;
  ALL_CARD_DEFS.forEach((card) => {
    state.cards[card.id] = state.cards[card.id] || 1;
  });
  updateHomeStats();
  renderCollection();
  await persistUser();
  showToast('Toutes les cartes débloquées (dev)');
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
  revealRarityLabel.textContent = RARITY_LABELS[card.rarity];
  revealRarityLabel.classList.add(`rarity-${card.rarity}`, 'shown');
  revealRays.classList.add(`rarity-${card.rarity}`, 'shown');
  if (revealNewCardIds.has(card.id)) {
    revealNewBadge.textContent = 'Nouvelle carte !';
    revealNewBadge.classList.add('shown');
  }
}

async function showBoosterReveal(cards, newCardIds = new Set()) {
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
  state.credits += amount;
  updateCreditUI();
  updateHomeStats();
  showToast(`+${amount} crédits !`);
  flyCoinToCredits(btn, amount);
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
  newsModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  newsModal.classList.add('hidden');
}
closeNewsModalBtn.addEventListener('click', closeNewsModal);
newsModal.addEventListener('click', (e) => { if (e.target === newsModal) closeNewsModal(); });

// ============================================================
//  NAVIGATION
// ============================================================
const devTools = el('devTools');
const DEV_TOOLS_UNLOCK_TAPS = 10;
const DEV_TOOLS_TAP_TIMEOUT_MS = 2000;
let homeTapCount = 0;
let homeTapTimeout = null;

document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const sound = new Audio('medias/clic.wav');
    sound.volume = 0.3;
    sound.play().catch(() => {});
    switchView(btn.dataset.view);

    if (btn.dataset.view === 'home' && devTools.classList.contains('hidden')) {
      homeTapCount += 1;
      clearTimeout(homeTapTimeout);
      homeTapTimeout = setTimeout(() => { homeTapCount = 0; }, DEV_TOOLS_TAP_TIMEOUT_MS);
      if (homeTapCount >= DEV_TOOLS_UNLOCK_TAPS) {
        homeTapCount = 0;
        devTools.classList.remove('hidden');
        showToast('Outils dev activés');
      }
    }
  });
});

function switchView(view, { instant } = {}) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  el(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  if (view === 'collection') renderCollection();
  if (view === 'community') { renderPlayerList(); }
  if (view === 'home' && !instant) revealHomeLieuBg();
}

// ============================================================
//  COLLECTION
// ============================================================
document.querySelectorAll('.filter-chip').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.filter-chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    currentFilter = chip.dataset.rarity === 'default' ? null : chip.dataset.rarity;
    renderCollection();
  });
});

function cardArtHtml(card, alt) {
  if (card.type === 'lieu' && !card.file) {
    return `<div class="lieu-art lieu-${card.location || 'jacuzzi'}"><span class="lieu-art-icon">${card.icon}</span></div>`;
  }
  return `<img src="medias/${encodeURIComponent(card.file)}" alt="${alt}" />`;
}

function cardTileHtml(card) {
  const count = state.cards[card.id] || 0;
  const owned = count > 0;
  const recyclable = owned && count >= RECYCLE_RULES[card.rarity].minOwned;
  const art = owned ? cardArtHtml(card, escapeHtml(card.name)) : `<img src="medias/dos-cartes.png" alt="carte non obtenue" />`;
  return `
    <div class="card-tile-wrap ${owned ? '' : 'locked'}" ${owned ? `data-card-id="${card.id}"` : ''}>
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

function renderCollection() {
  if (!state) return;
  const filtered = (currentFilter === null || currentFilter === 'all') ? ALL_CARD_DEFS : ALL_CARD_DEFS.filter((c) => c.rarity === currentFilter);
  cardGrid.classList.toggle('hide-captions', currentFilter !== null);

  if (currentFilter === null) {
    const groupLabel = (c) => c.type === 'special' ? 'Cartes Spécial' : c.character;
    const groups = [...new Set(filtered.map(groupLabel))];
    cardGrid.innerHTML = groups
      .map((group) => {
        const tiles = filtered.filter((c) => groupLabel(c) === group).map(cardTileHtml).join('');
        return `<div class="card-group-title">${escapeHtml(group)}</div>${tiles}`;
      })
      .join('');
  } else {
    cardGrid.innerHTML = filtered.map(cardTileHtml).join('');
  }

  const uniqueOwned = Object.keys(state.cards).length;
  collectionProgress.textContent = `${uniqueOwned}/${ALL_CARD_DEFS.length}`;
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
//  COMMUNITY / PLAYER LIST
// ============================================================
async function renderPlayerList() {
  playerList.innerHTML = '<p class="player-list-empty">Chargement...</p>';
  try {
    const snap = await db.ref('publicProfiles').once('value');
    const rows = [];
    snap.forEach((child) => { rows.push({ uid: child.key, ...child.val() }); });
    rows.sort((a, b) =>
      (b.uniqueCount || 0) - (a.uniqueCount || 0) ||
      (a.displayName || '').localeCompare(b.displayName || ''));
    latestPublicProfiles = rows;

    if (!rows.length) {
      playerList.innerHTML = '<p class="player-list-empty">Aucun joueur pour le moment.</p>';
      return;
    }

    playerList.innerHTML = rows
      .map((r) => {
        const avatar = AVATAR_OPTIONS.includes(r.avatar) ? r.avatar : AVATAR_OPTIONS[0];
        const isMe = state && r.uid === state.uid;
        return `
          <div class="player-row" data-uid="${r.uid}" ${isMe ? '' : 'role="button"'}>
            <img class="player-avatar" src="medias/${avatar}" alt="" />
            <span class="player-name">${escapeHtml(r.displayName || 'Joueur')}${isMe ? ' (toi)' : ''}</span>
            <span class="player-count">${r.uniqueCount || 0}/${ALL_CARD_DEFS.length}</span>
          </div>`;
      })
      .join('');
  } catch (e) {
    console.error('Chargement des joueurs refusé :', e);
    playerList.innerHTML = '<p class="player-list-empty">Impossible de charger la liste des joueurs.</p>';
  }
}

playerList.addEventListener('click', (e) => {
  const row = e.target.closest('.player-row[data-uid]');
  if (!row || !state) return;
  const uid = row.dataset.uid;
  if (uid === state.uid) return;
  const profile = latestPublicProfiles.find((p) => p.uid === uid);
  if (profile) openSendGiftModal(profile);
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
  giftMyCards.innerHTML = myOwned.length
    ? myOwned.map((c) => giftPickTileHtml(c, state.cards[c.id], c.id === giftCardId)).join('')
    : '<p class="gift-pick-empty">Tu ne possèdes aucune carte à offrir.</p>';
  submitGiftBtn.disabled = !giftCardId;
}

giftMyCards.addEventListener('click', (e) => {
  const tile = e.target.closest('.card-tile-wrap[data-pick-id]');
  if (!tile) return;
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

async function closeSendGiftModal() {
  sendGiftModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  sendGiftModal.classList.add('hidden');
}
closeSendGiftModalBtn.addEventListener('click', closeSendGiftModal);
sendGiftModal.addEventListener('click', (e) => { if (e.target === sendGiftModal) closeSendGiftModal(); });

submitGiftBtn.addEventListener('click', async () => {
  if (!state || !giftTarget || !giftCardId) return;
  if ((state.cards[giftCardId] || 0) < 1) return;
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
  state.cards[gift.cardId] = (state.cards[gift.cardId] || 0) + 1;
  await persistUser();
  await db.ref(`gifts/${id}`).update({ claimed: true, claimedAt: Date.now() }).catch((err) => {
    console.error('Confirmation du cadeau refusée :', err);
  });
  updateHomeStats();
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
  const card = ALL_CARD_DEFS.find((c) => c.id === gift.cardId);
  if (card) {
    giftReceivedArt.innerHTML = cardArtHtml(card, escapeHtml(card.name));
    giftReceivedName.textContent = card.name;
    giftReceivedRarity.textContent = RARITY_LABELS[card.rarity];
    giftReceivedRarity.className = `card-detail-rarity rarity-${card.rarity}`;
  }
  giftReceivedFrom.textContent = `Offert par ${gift.fromName || 'un joueur'}`;
  giftReceivedModal.classList.remove('hidden');
  giftReceivedModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  giftReceivedModal.classList.add('open');
}

async function closeGiftReceivedModal() {
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
  const thumb = card ? cardArtHtml(card, escapeHtml(card.name)) : '<span>?</span>';
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
}

function renderAll() {
  playerName.textContent = state.displayName;
  avatarImg.src = `medias/${state.avatar}`;
  el('boosterCost').textContent = BOOSTER_COST;
  updateHomeStats();
  updateCreditUI();
  updateWheelUI();
  updateLieuSlotUI();
  updateJohnnyPanel();
  updateDailyQuestsUI();
  updateNewsBadge();
  renderCollection();
  switchView('home', { instant: true });
}
