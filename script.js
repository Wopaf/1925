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
  ['Matthias-Chef', 'Chef Matthias Chef', 'common'],
  ['Matthias-Pizza', 'Matthias Pizzaziolo', 'rare'],
  ['Matthias-3Cannes', 'Matthias 3 Cannes', 'epic'],
  ['Matthias-Puant', 'Matthias Puant', 'legendary'],

  ['Valentin-Cuisinier', 'Valentin Cuisinier', 'common'],
  ['Valentin-Crepier', 'Valentin Crêpier', 'rare'],
  ['Valentin-Informatiicien', 'Valentin Informaticien', 'epic'],
  ['Valentin-Laitier', 'Valentin Laitier', 'legendary'],

  ['Denis-Cuisinier', 'Denis Cuisinier', 'common'],
  ['Denis-Sparring', 'Denis Sparring', 'rare'],
  ['Denis-Commando', 'Denis Commando', 'epic'],
  ['Denis-Attrapeur', 'Denis Attrapeur', 'legendary'],

  ['Elodie-Cuisiniere', 'Elodie Cuisinière', 'common'],
  ['Elodie-Fantome', 'Elodie Fantôme de diane', 'legendary'],
];

const CARD_DEFS = RAW_CARDS.map(([file, name, rarity]) => ({
  id: slugify(file),
  name,
  file: `${file}.png`,
  rarity,
  character: file.split('-')[0],
}));

const RARITY_WEIGHTS = { common: 40, rare: 30, epic: 20, legendary: 10 };
const RARITY_LABELS = { common: 'Commune', rare: 'Rare', epic: 'Épique', legendary: 'Légendaire' };
const CREDIT_INTERVAL_MS = 10 * 60 * 1000; // 1 crédit toutes les 10 minutes
const BOOSTER_COST = 30;
const STARTING_CREDITS = 30;

// Raretés autorisées pour chacune des 5 cartes d'un booster (dans l'ordre du tirage)
const BOOSTER_SLOTS = [
  ['common', 'rare'],
  ['common', 'rare'],
  ['common', 'rare','epic'],
  ['common', 'rare', 'epic', 'legendary'],
  ['epic', 'legendary'],
];
const CARDS_PER_BOOSTER = BOOSTER_SLOTS.length;

// Recyclage des doublons : minOwned = nb d'exemplaires requis pour débloquer le recyclage,
// cost = nb d'exemplaires consommés, reward = crédits obtenus (garde toujours >= 1 exemplaire)
const RECYCLE_RULES = {
  common: { minOwned: 2, cost: 1, reward: 1 },
  rare: { minOwned: 2, cost: 1, reward: 3 },
  epic: { minOwned: 2, cost: 1, reward: 10 },
  legendary: { minOwned: 2, cost: 1, reward: 30 },
};

const RECYCLE_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M160-479q0 85 42.5 158T318-204q14 9 19.5 24.5T335-150q-8 15-24.5 19.5T279-134q-93-54-146-146T80-479q0-26 3.5-51t9.5-50l-13 8q-14 9-30 4.5T26-586q-8-14-3.5-30.5T41-641l121-70q14-8 30.5-3.5T217-696l70 120q8 14 3.5 30.5T272-521q-14 8-30.5 3.5T217-536l-34-59q-11 28-17 57t-6 59Zm320-321q-41 0-81 10.5T323-759q-15 8-31.5 5.5T267-770q-9-16-4-32.5t21-25.5q45-26 94.5-39T480-880q79 0 151.5 29.5T761-765v-15q0-17 11.5-28.5T801-820q17 0 28.5 11.5T841-780v140q0 17-11.5 28.5T801-600H661q-17 0-28.5-11.5T621-640q0-17 11.5-28.5T661-680h69q-46-57-111-88.5T480-800Zm242 531q38-44 58-97t20-111q0-17 11.5-30t28.5-13q17 0 28.5 13t11.5 30q0 65-20.5 125.5T800-239q-39 52-92.5 89T591-95l10 6q14 8 18 24.5T615-34q-8 14-24 18t-30-4L439-90q-14-8-18.5-24.5T424-145l70-121q8-14 24-18t30 4q14 8 18.5 24.5T563-225l-37 63q57-8 107.5-35.5T722-269Z"/></svg>';

const LOCK_ICON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm296.5-143.5Q560-327 560-360t-23.5-56.5Q513-440 480-440t-56.5 23.5Q400-393 400-360t23.5 56.5Q447-280 480-280t56.5-23.5ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>';

const AVATAR_OPTIONS = ['pplouis.png', 'ppmat.png', 'ppvalentin.png', 'ppdenis.png', 'ppelo.png', 'ppval.png'];

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
const creditProgressFill = el('creditProgressFill');
const openBoosterBtn = el('openBoosterBtn');
const boosterPack = el('boosterPack');
const addCreditsBtn = el('addCreditsBtn');
const resetCardsBtn = el('resetCardsBtn');
const resetWheelBtn = el('resetWheelBtn');
const statOwned = el('statOwned');
const statUnique = el('statUnique');

const collectionProgress = el('collectionProgress');
const cardGrid = el('cardGrid');

const leaderboard = el('leaderboard');

const boosterModal = el('boosterModal');
const revealCards = el('revealCards');
const revealProgress = el('revealProgress');
const revealHint = el('revealHint');
const revealBoosterArt = el('revealBoosterArt');
const revealRarityLabel = el('revealRarityLabel');
const revealRays = el('revealRays');

const cardDetailModal = el('cardDetailModal');
const closeCardDetail = el('closeCardDetail');
const cardDetailImg = el('cardDetailImg');
const cardDetailName = el('cardDetailName');
const cardDetailRarity = el('cardDetailRarity');
const cardDetailCount = el('cardDetailCount');
const recycleBtn = el('recycleBtn');
const recycleHint = el('recycleHint');

const openWheelBtn = el('openWheelBtn');
const wheelModal = el('wheelModal');
const closeWheelModalBtn = el('closeWheelModal');
const wheelDial = el('wheelDial');
const wheelLabels = el('wheelLabels');
const spinWheelBtn = el('spinWheelBtn');
const wheelHint = el('wheelHint');

const welcomeBackModal = el('welcomeBackModal');
const welcomeBackText = el('welcomeBackText');
const closeWelcomeBack = el('closeWelcomeBack');

const toast = el('toast');

// ============================================================
//  APP STATE
// ============================================================
let state = null; // { uid, email, displayName, credits, lastClaim, cards }
let currentFilter = null;
let tickInterval = null;
let toastTimeout = null;

// ============================================================
//  UTILITIES
// ============================================================
function showScreen(id) {
  ['loadingScreen', 'authScreen', 'appShell'].forEach((s) => {
    el(s).classList.toggle('hidden', s !== id);
  });
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
    showScreen('appShell');
    startCreditTimer();
    await processOfflineCredits(true);
  } else {
    stopCreditTimer();
    state = null;
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
      cards: data.cards || {},
      avatar: AVATAR_OPTIONS.includes(data.avatar) ? data.avatar : AVATAR_OPTIONS[0],
      lastWheelSpinDate: data.lastWheelSpinDate || null,
    };
  } else {
    state = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      credits: STARTING_CREDITS,
      lastClaim: Date.now(),
      cards: {},
      avatar: AVATAR_OPTIONS[0],
      lastWheelSpinDate: null,
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
    cards: state.cards,
    avatar: state.avatar,
    lastWheelSpinDate: state.lastWheelSpinDate,
  }).catch((err) => {
    console.error('Sauvegarde des données joueur refusée :', err);
    showToast('Erreur de sauvegarde — vérifiez les règles Firebase.');
  });

  const publicSave = db.ref(`publicProfiles/${state.uid}`).set({
    displayName: state.displayName,
    uniqueCount,
    totalCount,
    credits: state.credits,
    updatedAt: Date.now(),
  }).catch((err) => {
    console.error('Mise à jour du classement public refusée :', err);
  });

  return Promise.all([coreSave, publicSave]);
}

// ============================================================
//  CREDITS (gain automatique + rattrapage hors-ligne)
// ============================================================
function elapsedCreditTicks() {
  const elapsed = Date.now() - state.lastClaim;
  return Math.floor(elapsed / CREDIT_INTERVAL_MS);
}

async function processOfflineCredits(isInitialLoad) {
  const ticks = elapsedCreditTicks();
  if (ticks > 0) {
    state.credits += ticks;
    state.lastClaim += ticks * CREDIT_INTERVAL_MS;
    await persistUser();
    updateHomeStats();
    updateCreditUI();
    if (isInitialLoad) {
      welcomeBackText.textContent = `Pendant votre absence, vous avez gagné ${ticks} crédit${ticks > 1 ? 's' : ''} !`;
      welcomeBackModal.classList.remove('hidden');
    } else {
      showToast(`+${ticks} crédit${ticks > 1 ? 's' : ''} !`);
    }
  }
}

closeWelcomeBack.addEventListener('click', () => welcomeBackModal.classList.add('hidden'));

function startCreditTimer() {
  stopCreditTimer();
  updateCreditUI();
  tickInterval = setInterval(async () => {
    if (!state) return;
    if (elapsedCreditTicks() > 0) {
      await processOfflineCredits(false);
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
  const elapsed = Date.now() - state.lastClaim;
  const remaining = CREDIT_INTERVAL_MS - elapsed;
  nextCreditTimer.textContent = formatDuration(remaining);
  const pct = Math.min(100, Math.max(0, (elapsed / CREDIT_INTERVAL_MS) * 100));
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

function drawCard(allowedRarities, excludeIds) {
  const rarity = weightedRandomRarity(allowedRarities);
  const pool = CARD_DEFS.filter((c) => c.rarity === rarity && !excludeIds.has(c.id));
  const finalPool = pool.length > 0 ? pool : CARD_DEFS.filter((c) => c.rarity === rarity);
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

function drawBoosterCards() {
  const excludeIds = new Set();
  return BOOSTER_SLOTS.map((allowedRarities) => {
    const card = drawCard(allowedRarities, excludeIds);
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
  drawn.forEach((card) => {
    state.cards[card.id] = (state.cards[card.id] || 0) + 1;
  });

  updateCreditUI();
  updateHomeStats();
  await persistUser();

  showBoosterReveal(drawn);
  boosterPack.classList.remove('opening');
  openBoosterBtn.disabled = false;
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

function isWheelAvailable() {
  return !state.lastWheelSpinDate || state.lastWheelSpinDate !== todayKey();
}

function updateWheelHomeUI() {
  if (!state) return;
  openWheelBtn.classList.toggle('claimed', !isWheelAvailable());
}

let wheelSpinning = false;
let wheelRotation = 0;

openWheelBtn.addEventListener('click', () => {
  if (!state) return;
  updateWheelUI();
  wheelModal.classList.remove('hidden');
  wheelModal.getBoundingClientRect(); // force layout so the fade/scale-in transition plays
  wheelModal.classList.add('open');
});

async function closeWheelModal() {
  wheelModal.classList.remove('open');
  await wait(300); // matches the CSS transition duration
  wheelModal.classList.add('hidden');
}
closeWheelModalBtn.addEventListener('click', closeWheelModal);

function updateWheelUI() {
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
  updateWheelHomeUI();
  spinWheelBtn.disabled = true;
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
  updateHomeStats();
  renderCollection();
  await persistUser();
  showToast('Collection réinitialisée (dev)');
});

resetWheelBtn.addEventListener('click', async () => {
  if (!state) return;
  state.lastWheelSpinDate = null;
  updateWheelHomeUI();
  await persistUser();
  showToast('Roue réinitialisée (dev)');
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let revealQueue = [];
let revealIndex = 0;

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
        <img src="medias/${card.file}" alt="${escapeHtml(card.name)}" />
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
}

async function showBoosterReveal(cards) {
  revealQueue = cards;
  revealIndex = 0;
  revealCards.innerHTML = '';
  revealProgress.innerHTML = '';
  revealRarityLabel.className = 'reveal-rarity-label';
  revealRarityLabel.textContent = '';
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
//  NAVIGATION
// ============================================================
document.querySelectorAll('.nav-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const sound = new Audio('medias/clic.wav');
    sound.volume = 0.3;
    sound.play().catch(() => {});
    switchView(btn.dataset.view);
  });
});

function switchView(view) {
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  el(`view-${view}`).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  if (view === 'collection') renderCollection();
  if (view === 'community') renderLeaderboard();
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

function cardTileHtml(card) {
  const count = state.cards[card.id] || 0;
  const owned = count > 0;
  const recyclable = owned && count >= RECYCLE_RULES[card.rarity].minOwned;
  const img = owned ? `medias/${card.file}` : 'medias/dos-cartes.png';
  const alt = owned ? escapeHtml(card.name) : 'carte non obtenue';
  return `
    <div class="card-tile-wrap ${owned ? '' : 'locked'}" ${owned ? `data-card-id="${card.id}"` : ''}>
      <div class="card-tile rarity-${card.rarity}">
        <img src="${img}" alt="${alt}" />
        ${recyclable ? `<span class="recycle-badge" title="Recyclage disponible">${RECYCLE_ICON_SVG}</span>` : ''}
        ${owned ? `<span class="card-count">x${count}</span>` : `<span class="lock-icon">${LOCK_ICON_SVG}</span>`}
      </div>
      <div class="card-caption">
        <span class="card-caption-name">${owned ? escapeHtml(card.name) : '???'}</span>
        <span class="card-caption-rarity rarity-${card.rarity}">${RARITY_LABELS[card.rarity]}</span>
      </div>
    </div>`;
}

function renderCollection() {
  if (!state) return;
  const filtered = (currentFilter === null || currentFilter === 'all') ? CARD_DEFS : CARD_DEFS.filter((c) => c.rarity === currentFilter);

  if (currentFilter === null) {
    const characters = [...new Set(filtered.map((c) => c.character))];
    cardGrid.innerHTML = characters
      .map((character) => {
        const tiles = filtered.filter((c) => c.character === character).map(cardTileHtml).join('');
        return `<div class="card-group-title">${escapeHtml(character)}</div>${tiles}`;
      })
      .join('');
  } else {
    cardGrid.innerHTML = filtered.map(cardTileHtml).join('');
  }

  const uniqueOwned = Object.keys(state.cards).length;
  collectionProgress.textContent = `${uniqueOwned}/${CARD_DEFS.length}`;
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
  const card = CARD_DEFS.find((c) => c.id === detailCardId);
  const count = state.cards[detailCardId] || 0;
  if (!card || count <= 0) {
    cardDetailModal.classList.add('hidden');
    return;
  }

  cardDetailImg.src = `medias/${card.file}`;
  cardDetailImg.alt = card.name;
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
  const card = CARD_DEFS.find((c) => c.id === detailCardId);
  const count = state.cards[detailCardId] || 0;
  const rule = RECYCLE_RULES[card.rarity];
  if (count < rule.minOwned) return;

  new Audio('medias/recycling.wav').play().catch(() => {});
  state.cards[detailCardId] = count - rule.cost;
  state.credits += rule.reward;

  updateCreditUI();
  updateHomeStats();
  renderCollection();
  renderCardDetail();
  await persistUser();
  showToast(`+${rule.reward} crédit${rule.reward > 1 ? 's' : ''} !`);
});

closeCardDetail.addEventListener('click', closeCardDetailModal);

// ============================================================
//  COMMUNITY / LEADERBOARD
// ============================================================
async function renderLeaderboard() {
  leaderboard.innerHTML = '<p class="leaderboard-empty">Chargement...</p>';
  try {
    const snap = await db.ref('publicProfiles').orderByChild('uniqueCount').limitToLast(50).once('value');
    const rows = [];
    snap.forEach((child) => rows.push(child.val()));
    rows.reverse();

    if (!rows.length) {
      leaderboard.innerHTML = '<p class="leaderboard-empty">Aucun joueur pour le moment.</p>';
      return;
    }

    leaderboard.innerHTML = rows
      .map((r, i) => {
        const rankClass = i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : '';
        return `
          <div class="leaderboard-row ${rankClass}">
            <span class="leaderboard-rank">${i + 1}</span>
            <span class="leaderboard-name">${escapeHtml(r.displayName || 'Joueur')}</span>
            <span class="leaderboard-count">${r.uniqueCount || 0}/${CARD_DEFS.length}</span>
          </div>`;
      })
      .join('');
  } catch (e) {
    console.error('Chargement du classement refusé :', e);
    leaderboard.innerHTML = '<p class="leaderboard-empty">Impossible de charger le classement.</p>';
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
  statUnique.textContent = `${uniqueOwned}/${CARD_DEFS.length}`;
  creditsValue.textContent = state.credits;
}

function renderAll() {
  playerName.textContent = state.displayName;
  avatarImg.src = `medias/${state.avatar}`;
  el('boosterCost').textContent = BOOSTER_COST;
  updateHomeStats();
  updateCreditUI();
  updateWheelHomeUI();
  renderCollection();
  switchView('home');
}
