// ============================================
//   INVEST TYCOON — TUNISIA 🇹🇳 (FULL)
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_PLAY   = 0x5865F2;
const COLOR_WIN    = 0x57F287;
const COLOR_LOSE   = 0xED4245;
const COLOR_MONEY  = 0xF1C40F;
const COLOR_GOLD   = 0xFFD700;

const STARTING_COINS = 1000;
const DAILY_REWARD = 100;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const TRAVEL_COST = 10; // %

// ============================================
//   PROPERTY CATEGORIES
// ============================================
const CATEGORIES = {
  hospitality: { emoji: "🏨", name: "Hospitality" },
  residential: { emoji: "🏢", name: "Residential" },
  commercial:  { emoji: "🏬", name: "Commercial" },
  industrial:  { emoji: "🏭", name: "Industrial" },
  agriculture: { emoji: "🌾", name: "Agriculture" },
  services:    { emoji: "🏥", name: "Services" },
};

// ============================================
//   PROPERTY TYPES (21)
// ============================================
const PROPERTY_TYPES = {
  // 🏨 HOSPITALITY (6)
  motel:      { emoji: "🏠", name: "Motel",              price: 100,     income: 5,     category: "hospitality" },
  hostel:     { emoji: "🏨", name: "Hostel",             price: 500,     income: 25,    category: "hospitality" },
  hotel:      { emoji: "🏨", name: "Hotel",              price: 1000,    income: 50,    category: "hospitality" },
  resort:     { emoji: "🏩", name: "Resort",             price: 5000,    income: 250,   category: "hospitality" },
  luxury:     { emoji: "🏰", name: "Luxury Hotel",       price: 25000,   income: 1500,  category: "hospitality" },
  fivestar:   { emoji: "🏝️", name: "5-Star Resort",      price: 100000,  income: 10000, category: "hospitality" },

  // 🏢 RESIDENTIAL (3)
  studio:     { emoji: "🏠", name: "Studio",             price: 200,     income: 10,    category: "residential" },
  apartment:  { emoji: "🏢", name: "Apartment",          price: 1500,    income: 75,    category: "residential" },
  penthouse:  { emoji: "🏙️", name: "Penthouse",          price: 10000,   income: 500,   category: "residential" },

  // 🏬 COMMERCIAL (3)
  kiosk:      { emoji: "🏪", name: "Kiosk",              price: 150,     income: 8,     category: "commercial" },
  shop:       { emoji: "🏬", name: "Shop",               price: 2000,    income: 100,   category: "commercial" },
  mall:       { emoji: "🛒", name: "Mall",               price: 20000,   income: 1200,  category: "commercial" },

  // 🏭 INDUSTRIAL (3)
  workshop:   { emoji: "🔧", name: "Workshop",           price: 500,     income: 30,    category: "industrial" },
  factory:    { emoji: "🏭", name: "Factory",            price: 5000,    income: 300,   category: "industrial" },
  complex:    { emoji: "🏗️", name: "Industrial Complex", price: 50000,   income: 3500,  category: "industrial" },

  // 🌾 AGRICULTURE (3)
  smallfarm:  { emoji: "🌱", name: "Small Farm",         price: 300,     income: 15,    category: "agriculture" },
  farm:       { emoji: "🌾", name: "Farm",               price: 3000,    income: 150,   category: "agriculture" },
  plantation: { emoji: "🚜", name: "Plantation",         price: 30000,   income: 2000,  category: "agriculture" },

  // 🏥 SERVICES (3)
  pharmacy:   { emoji: "💊", name: "Pharmacy",           price: 800,     income: 40,    category: "services" },
  hospital:   { emoji: "🏥", name: "Hospital",           price: 15000,   income: 800,   category: "services" },
  bank:       { emoji: "🏦", name: "Bank",               price: 50000,   income: 3000,  category: "services" },
};

// ============================================
//   CITIES (24)
// ============================================
const CITIES = {
  tunis: {
    emoji: "🏛️", name: "Tunis", bonus: 50,
    zones: [
      { id: "centre",    name: "Centre Ville",  emoji: "🏙️", bonus: 50 },
      { id: "marsa",     name: "La Marsa",      emoji: "🏖️", bonus: 60 },
      { id: "lac",       name: "Lac 1 & 2",     emoji: "🏢", bonus: 70 },
      { id: "carthage",  name: "Carthage",      emoji: "🏛️", bonus: 65 },
      { id: "bardo",     name: "Le Bardo",      emoji: "🌳", bonus: 40 },
      { id: "goulette",  name: "La Goulette",   emoji: "⚓", bonus: 45 },
    ]
  },
  ariana: {
    emoji: "🏙️", name: "Ariana", bonus: 40,
    zones: [
      { id: "ville",      name: "Ariana Ville", emoji: "🏙️", bonus: 40 },
      { id: "raoued",     name: "Raoued",       emoji: "🌳", bonus: 35 },
      { id: "sidi_thabet",name: "Sidi Thabet",  emoji: "🏘️", bonus: 30 },
      { id: "ennasr",     name: "Ennasr",       emoji: "🏢", bonus: 45 },
      { id: "borj_toumi", name: "Borj Toumi",   emoji: "🏖️", bonus: 25 },
    ]
  },
  benarous: {
    emoji: "🏘️", name: "Ben Arous", bonus: 35,
    zones: [
      { id: "centre",   name: "Ben Arous Ville", emoji: "🏙️", bonus: 35 },
      { id: "rades",    name: "Radès",           emoji: "⚓", bonus: 40 },
      { id: "hammamlif",name: "Hammam Lif",      emoji: "🏖️", bonus: 45 },
      { id: "ezzahra",  name: "Ezzahra",         emoji: "🌳", bonus: 30 },
      { id: "mghira",   name: "Mghira",          emoji: "🏭", bonus: 25 },
    ]
  },
  manouba: {
    emoji: "🌳", name: "Manouba", bonus: 30,
    zones: [
      { id: "centre",   name: "Manouba Ville", emoji: "🏙️", bonus: 30 },
      { id: "denden",   name: "Denden",        emoji: "🏘️", bonus: 25 },
      { id: "douar",    name: "Douar Hicher",  emoji: "🕌", bonus: 20 },
      { id: "ouedellil",name: "Oued Ellil",    emoji: "🏢", bonus: 35 },
      { id: "borj",     name: "Borj El Amri",  emoji: "🌾", bonus: 15 },
    ]
  },
  nabeul: {
    emoji: "🍊", name: "Nabeul", bonus: 25,
    zones: [
      { id: "centre",   name: "Nabeul Ville", emoji: "🏙️", bonus: 25 },
      { id: "hammamet", name: "Hammamet",     emoji: "🏖️", bonus: 40 },
      { id: "kelibia",  name: "Kelibia",      emoji: "🏝️", bonus: 30 },
      { id: "korba",    name: "Korba",        emoji: "🌴", bonus: 20 },
      { id: "darchaab", name: "Dar Chaabane", emoji: "🏖️", bonus: 25 },
    ]
  },
  zaghouan: {
    emoji: "⛰️", name: "Zaghouan", bonus: 20,
    zones: [
      { id: "centre",   name: "Zaghouan Ville", emoji: "🏙️", bonus: 20 },
      { id: "fahs",     name: "El Fahs",        emoji: "🌿", bonus: 15 },
      { id: "birmcher", name: "Bir Mcherga",    emoji: "🏞️", bonus: 25 },
      { id: "nadhour",  name: "Nadhour",        emoji: "🌳", bonus: 15 },
      { id: "zriba",    name: "Zriba",          emoji: "🏔️", bonus: 20 },
    ]
  },
  bizerte: {
    emoji: "⚓", name: "Bizerte", bonus: 30,
    zones: [
      { id: "centre",   name: "Bizerte Ville",  emoji: "🏙️", bonus: 30 },
      { id: "rasjebel", name: "Ras Jebel",      emoji: "🏖️", bonus: 35 },
      { id: "gharelmel",name: "Ghar El Melh",   emoji: "🏝️", bonus: 40 },
      { id: "menzel",   name: "Menzel Bourguiba",emoji: "🌊", bonus: 25 },
      { id: "mateur",   name: "Mateur",         emoji: "⛵", bonus: 20 },
    ]
  },
  beja: {
    emoji: "🌾", name: "Beja", bonus: 20,
    zones: [
      { id: "centre",   name: "Beja Ville",    emoji: "🏙️", bonus: 20 },
      { id: "testour",  name: "Testour",       emoji: "🏘️", bonus: 15 },
      { id: "nefza",    name: "Nefza",         emoji: "🌳", bonus: 25 },
      { id: "tebour",   name: "Teboursouk",    emoji: "🏔️", bonus: 15 },
      { id: "amdoun",   name: "Amdoun",        emoji: "🌾", bonus: 10 },
    ]
  },
  jendouba: {
    emoji: "🌲", name: "Jendouba", bonus: 15,
    zones: [
      { id: "centre",   name: "Jendouba Ville",emoji: "🏙️", bonus: 15 },
      { id: "tabarka",  name: "Tabarka",       emoji: "🏞️", bonus: 35 },
      { id: "aindraham",name: "Ain Draham",    emoji: "🌳", bonus: 30 },
      { id: "fernana",  name: "Fernana",       emoji: "🏔️", bonus: 10 },
      { id: "ghardim",  name: "Ghardimaou",    emoji: "🌿", bonus: 10 },
    ]
  },
  kef: {
    emoji: "🏔️", name: "Kef", bonus: 15,
    zones: [
      { id: "centre",   name: "Kef Ville",     emoji: "🏙️", bonus: 15 },
      { id: "dahmani",  name: "Dahmani",       emoji: "🏘️", bonus: 10 },
      { id: "sakiet",   name: "Sakiet Sidi Youssef", emoji: "🌾", bonus: 10 },
      { id: "tajer",    name: "Tajerouine",    emoji: "🏔️", bonus: 15 },
      { id: "kalaat",   name: "Kalâat Senan",  emoji: "🌿", bonus: 10 },
    ]
  },
  siliana: {
    emoji: "🌿", name: "Siliana", bonus: 10,
    zones: [
      { id: "centre",   name: "Siliana Ville", emoji: "🏙️", bonus: 10 },
      { id: "makthar",  name: "Makthar",       emoji: "🏘️", bonus: 10 },
      { id: "bourouis", name: "Bourouis",      emoji: "🌾", bonus: 5 },
      { id: "kesra",    name: "Kesra",         emoji: "⛰️", bonus: 10 },
      { id: "bouarada", name: "Bouarada",      emoji: "🌳", bonus: 5 },
    ]
  },
  kairouan: {
    emoji: "🕌", name: "Kairouan", bonus: 25,
    zones: [
      { id: "centre",   name: "Kairouan Ville",emoji: "🏙️", bonus: 25 },
      { id: "medina",   name: "Medina",        emoji: "🏛️", bonus: 35 },
      { id: "sbikha",   name: "Sbikha",        emoji: "🌾", bonus: 15 },
      { id: "hafouz",   name: "Hafouz",        emoji: "🏘️", bonus: 10 },
      { id: "oueslatia",name: "Oueslatia",     emoji: "🕌", bonus: 15 },
    ]
  },
  kasserine: {
    emoji: "⛏️", name: "Kasserine", bonus: 15,
    zones: [
      { id: "centre",   name: "Kasserine Ville",emoji: "🏙️", bonus: 15 },
      { id: "sbeitla",  name: "Sbeitla",       emoji: "🏔️", bonus: 20 },
      { id: "feriana",  name: "Feriana",       emoji: "🏜️", bonus: 10 },
      { id: "thala",    name: "Thala",         emoji: "⛰️", bonus: 15 },
      { id: "sbiba",    name: "Sbiba",         emoji: "🏔️", bonus: 10 },
    ]
  },
  sidibouzid: {
    emoji: "🌻", name: "Sidi Bouzid", bonus: 15,
    zones: [
      { id: "centre",   name: "Sidi Bouzid Ville",emoji: "🏙️", bonus: 15 },
      { id: "regueb",   name: "Regueb",        emoji: "🌾", bonus: 15 },
      { id: "meknassy", name: "Meknassy",      emoji: "🏘️", bonus: 10 },
      { id: "jelma",    name: "Jelma",         emoji: "🏜️", bonus: 10 },
      { id: "menzelb",  name: "Menzel Bouzaiene",emoji: "🌾", bonus: 10 },
    ]
  },
  sousse: {
    emoji: "🏖️", name: "Sousse", bonus: 40,
    zones: [
      { id: "centre",   name: "Sousse Centre", emoji: "🏙️", bonus: 40 },
      { id: "kantaoui", name: "Port El Kantaoui", emoji: "🏖️", bonus: 55 },
      { id: "corniche", name: "Corniche",      emoji: "🌊", bonus: 50 },
      { id: "sahloul",  name: "Sahloul",       emoji: "🏢", bonus: 35 },
      { id: "msaken",   name: "Msaken",        emoji: "🏘️", bonus: 30 },
    ]
  },
  monastir: {
    emoji: "🏰", name: "Monastir", bonus: 35,
    zones: [
      { id: "centre",   name: "Monastir Ville",emoji: "🏙️", bonus: 35 },
      { id: "skanes",   name: "Skanes",        emoji: "🏖️", bonus: 45 },
      { id: "ksar",     name: "Ksar Hellal",   emoji: "🏘️", bonus: 25 },
      { id: "sahline",  name: "Sahline",       emoji: "🌊", bonus: 25 },
      { id: "djemmal",  name: "Djemmal",       emoji: "🏝️", bonus: 20 },
    ]
  },
  mahdia: {
    emoji: "🐟", name: "Mahdia", bonus: 25,
    zones: [
      { id: "centre",   name: "Mahdia Ville",  emoji: "🏙️", bonus: 25 },
      { id: "rejiche",  name: "Rejiche",       emoji: "🏖️", bonus: 35 },
      { id: "chebba",   name: "Chebba",        emoji: "🏝️", bonus: 30 },
      { id: "ksour",    name: "Ksour Essef",   emoji: "🌊", bonus: 20 },
      { id: "eljem",    name: "El Jem",        emoji: "🏛️", bonus: 25 },
    ]
  },
  sfax: {
    emoji: "🏭", name: "Sfax", bonus: 45,
    zones: [
      { id: "centre",   name: "Sfax Centre",   emoji: "🏙️", bonus: 45 },
      { id: "port",     name: "Sfax Port",     emoji: "⚓", bonus: 55 },
      { id: "sakietz",  name: "Sakiet Ezzit",  emoji: "🏭", bonus: 50 },
      { id: "sakietd",  name: "Sakiet Eddaier",emoji: "🏘️", bonus: 40 },
      { id: "chihia",   name: "Chihia",        emoji: "🏢", bonus: 35 },
    ]
  },
  gabes: {
    emoji: "🌴", name: "Gabes", bonus: 20,
    zones: [
      { id: "centre",   name: "Gabes Ville",   emoji: "🏙️", bonus: 20 },
      { id: "chenini",  name: "Chenini",       emoji: "🏖️", bonus: 30 },
      { id: "mareth",   name: "Mareth",        emoji: "🏝️", bonus: 25 },
      { id: "ghannouch",name: "Ghannouch",     emoji: "🌊", bonus: 20 },
      { id: "matmata",  name: "Matmata",       emoji: "🏜️", bonus: 15 },
    ]
  },
  medenine: {
    emoji: "🏜️", name: "Medenine", bonus: 15,
    zones: [
      { id: "centre",   name: "Medenine Ville",emoji: "🏙️", bonus: 15 },
      { id: "djerba",   name: "Djerba",        emoji: "🏝️", bonus: 45 },
      { id: "zarzis",   name: "Zarzis",        emoji: "🏖️", bonus: 30 },
      { id: "benguer",  name: "Ben Guerdane",  emoji: "🏜️", bonus: 15 },
      { id: "houmt",    name: "Houmt Souk",    emoji: "🌴", bonus: 35 },
    ]
  },
  tataouine: {
    emoji: "🏜️", name: "Tataouine", bonus: 10,
    zones: [
      { id: "centre",   name: "Tataouine Ville",emoji: "🏙️", bonus: 10 },
      { id: "ghomras",  name: "Ghomrassen",    emoji: "🏜️", bonus: 10 },
      { id: "remada",   name: "Remada",        emoji: "🌵", bonus: 5 },
      { id: "birlahmar",name: "Bir Lahmar",    emoji: "🏜️", bonus: 5 },
      { id: "smar",     name: "Smâr",          emoji: "🌵", bonus: 5 },
    ]
  },
  gafsa: {
    emoji: "⛏️", name: "Gafsa", bonus: 25,
    zones: [
      { id: "centre",   name: "Gafsa Ville",   emoji: "🏙️", bonus: 25 },
      { id: "metlaoui", name: "Metlaoui",      emoji: "🏭", bonus: 30 },
      { id: "redeyef",  name: "Redeyef",       emoji: "🌵", bonus: 20 },
      { id: "moularès", name: "Moularès",      emoji: "🏜️", bonus: 15 },
      { id: "mdhilla",  name: "Mdhilla",       emoji: "⛏️", bonus: 20 },
    ]
  },
  tozeur: {
    emoji: "🌵", name: "Tozeur", bonus: 20,
    zones: [
      { id: "centre",   name: "Tozeur Ville",  emoji: "🏙️", bonus: 20 },
      { id: "nefta",    name: "Nefta",         emoji: "🏜️", bonus: 25 },
      { id: "degache",  name: "Degache",       emoji: "🌴", bonus: 15 },
      { id: "hezoua",   name: "Hezoua",        emoji: "🏜️", bonus: 10 },
      { id: "tamerza",  name: "Tamerza",       emoji: "🌵", bonus: 15 },
    ]
  },
  kebili: {
    emoji: "🌴", name: "Kebili", bonus: 15,
    zones: [
      { id: "centre",   name: "Kebili Ville",  emoji: "🏙️", bonus: 15 },
      { id: "douz",     name: "Douz",          emoji: "🏜️", bonus: 25 },
      { id: "souklahad",name: "Souk Lahad",    emoji: "🌵", bonus: 10 },
      { id: "faouar",   name: "Faouar",        emoji: "🏜️", bonus: 10 },
      { id: "golaa",    name: "El Golâa",      emoji: "🌴", bonus: 10 },
    ]
  },
};

// ============================================
//   STORAGE
// ============================================
const users = new Map();

// ============================================
//   HELPERS
// ============================================
function getUser(userId, username = null) {
  if (!users.has(userId)) {
    users.set(userId, {
      userId,
      username: username || "Unknown",
      coins: STARTING_COINS,
      city: "tunis",
      properties: [],
      totalEarned: 0,
      totalSpent: 0,
      lastDaily: 0,
      lastCollect: Date.now(),
    });
  } else if (username) {
    users.get(userId).username = username;
  }
  return users.get(userId);
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function getTotalIncome(user) {
  let total = 0;
  for (const prop of user.properties) {
    const typeData = PROPERTY_TYPES[prop.type];
    const cityData = CITIES[prop.city];
    const zoneData = cityData.zones.find(z => z.id === prop.zone);
    const bonus = 1 + (zoneData.bonus / 100);
    total += typeData.income * prop.level * bonus;
  }
  return Math.floor(total);
}

function getPropertyPrice(typeId, cityId, zoneId) {
  const typeData = PROPERTY_TYPES[typeId];
  const cityData = CITIES[cityId];
  const zoneData = cityData.zones.find(z => z.id === zoneId);
  const bonus = 1 + (zoneData.bonus / 100);
  return Math.floor(typeData.price * bonus);
}

function getUpgradeCost(prop) {
  const typeData = PROPERTY_TYPES[prop.type];
  const cityData = CITIES[prop.city];
  const zoneData = cityData.zones.find(z => z.id === prop.zone);
  const bonus = 1 + (zoneData.bonus / 100);
  return Math.floor(typeData.price * prop.level * 0.5 * bonus);
}

// ============================================
//   EXPORT (for panels file)
// ============================================
module.exports = {
  PREFIX,
  SIGNATURE,
  COLOR_PLAY,
  COLOR_WIN,
  COLOR_LOSE,
  COLOR_MONEY,
  COLOR_GOLD,
  STARTING_COINS,
  DAILY_REWARD,
  DAILY_COOLDOWN,
  TRAVEL_COST,
  CATEGORIES,
  PROPERTY_TYPES,
  CITIES,
  users,
  getUser,
  formatNumber,
  getTotalIncome,
  getPropertyPrice,
  getUpgradeCost,
};
