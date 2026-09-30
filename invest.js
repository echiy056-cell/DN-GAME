// ============================================
//   INVEST TYCOON — TUNISIA 🇹🇳
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_PLAY  = 0x5865F2;
const COLOR_WIN   = 0x57F287;
const COLOR_LOSE  = 0xED4245;
const COLOR_MONEY = 0xF1C40F;
const COLOR_GOLD  = 0xFFD700;

const STARTING_COINS = 1000;
const DAILY_REWARD = 100;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const TRAVEL_COST = 10;

// ============================================
//   CATEGORIES
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
  motel:      { emoji: "🏠", name: "Motel",              price: 100,     income: 5,     category: "hospitality" },
  hostel:     { emoji: "🏨", name: "Hostel",             price: 500,     income: 25,    category: "hospitality" },
  hotel:      { emoji: "🏨", name: "Hotel",              price: 1000,    income: 50,    category: "hospitality" },
  resort:     { emoji: "🏩", name: "Resort",             price: 5000,    income: 250,   category: "hospitality" },
  luxury:     { emoji: "🏰", name: "Luxury Hotel",       price: 25000,   income: 1500,  category: "hospitality" },
  fivestar:   { emoji: "🏝️", name: "5-Star Resort",      price: 100000,  income: 10000, category: "hospitality" },
  studio:     { emoji: "🏠", name: "Studio",             price: 200,     income: 10,    category: "residential" },
  apartment:  { emoji: "🏢", name: "Apartment",          price: 1500,    income: 75,    category: "residential" },
  penthouse:  { emoji: "🏙️", name: "Penthouse",          price: 10000,   income: 500,   category: "residential" },
  kiosk:      { emoji: "🏪", name: "Kiosk",              price: 150,     income: 8,     category: "commercial" },
  shop:       { emoji: "🏬", name: "Shop",               price: 2000,    income: 100,   category: "commercial" },
  mall:       { emoji: "🛒", name: "Mall",               price: 20000,   income: 1200,  category: "commercial" },
  workshop:   { emoji: "🔧", name: "Workshop",           price: 500,     income: 30,    category: "industrial" },
  factory:    { emoji: "🏭", name: "Factory",            price: 5000,    income: 300,   category: "industrial" },
  complex:    { emoji: "🏗️", name: "Industrial Complex", price: 50000,   income: 3500,  category: "industrial" },
  smallfarm:  { emoji: "🌱", name: "Small Farm",         price: 300,     income: 15,    category: "agriculture" },
  farm:       { emoji: "🌾", name: "Farm",               price: 3000,    income: 150,   category: "agriculture" },
  plantation: { emoji: "🚜", name: "Plantation",         price: 30000,   income: 2000,  category: "agriculture" },
  pharmacy:   { emoji: "💊", name: "Pharmacy",           price: 800,     income: 40,    category: "services" },
  hospital:   { emoji: "🏥", name: "Hospital",           price: 15000,   income: 800,   category: "services" },
  bank:       { emoji: "🏦", name: "Bank",               price: 50000,   income: 3000,  category: "services" },
};

// ============================================
//   CITIES (24)
// ============================================
const CITIES = {
  tunis:     { emoji: "🏛️", name: "Tunis",     bonus: 50, zones: [
    { id: "centre",   name: "Centre Ville", emoji: "🏙️", bonus: 50 },
    { id: "marsa",    name: "La Marsa",     emoji: "🏖️", bonus: 60 },
    { id: "lac",      name: "Lac 1 & 2",    emoji: "🏢", bonus: 70 },
    { id: "carthage", name: "Carthage",     emoji: "🏛️", bonus: 65 },
    { id: "bardo",    name: "Le Bardo",     emoji: "🌳", bonus: 40 },
    { id: "goulette", name: "La Goulette",  emoji: "⚓", bonus: 45 },
  ]},
  ariana:    { emoji: "🏙️", name: "Ariana",    bonus: 40, zones: [
    { id: "ville",  name: "Ariana Ville", emoji: "🏙️", bonus: 40 },
    { id: "raoued", name: "Raoued",       emoji: "🌳", bonus: 35 },
    { id: "sidi",   name: "Sidi Thabet",  emoji: "🏘️", bonus: 30 },
    { id: "ennasr", name: "Ennasr",       emoji: "🏢", bonus: 45 },
    { id: "borj",   name: "Borj Toumi",   emoji: "🏖️", bonus: 25 },
  ]},
  benarous:  { emoji: "🏘️", name: "Ben Arous", bonus: 35, zones: [
    { id: "centre",  name: "Ben Arous Ville", emoji: "🏙️", bonus: 35 },
    { id: "rades",   name: "Radès",           emoji: "⚓", bonus: 40 },
    { id: "hammam",  name: "Hammam Lif",      emoji: "🏖️", bonus: 45 },
    { id: "ezzahra", name: "Ezzahra",         emoji: "🌳", bonus: 30 },
    { id: "mghira",  name: "Mghira",          emoji: "🏭", bonus: 25 },
  ]},
  manouba:   { emoji: "🌳", name: "Manouba",   bonus: 30, zones: [
    { id: "centre", name: "Manouba Ville", emoji: "🏙️", bonus: 30 },
    { id: "denden", name: "Denden",        emoji: "🏘️", bonus: 25 },
    { id: "douar",  name: "Douar Hicher",  emoji: "🕌", bonus: 20 },
    { id: "oued",   name: "Oued Ellil",    emoji: "🏢", bonus: 35 },
    { id: "borj",   name: "Borj El Amri",  emoji: "🌾", bonus: 15 },
  ]},
  nabeul:    { emoji: "🍊", name: "Nabeul",    bonus: 25, zones: [
    { id: "centre",   name: "Nabeul Ville", emoji: "🏙️", bonus: 25 },
    { id: "hammamet", name: "Hammamet",     emoji: "🏖️", bonus: 40 },
    { id: "kelibia",  name: "Kelibia",      emoji: "🏝️", bonus: 30 },
    { id: "korba",    name: "Korba",        emoji: "🌴", bonus: 20 },
    { id: "darch",    name: "Dar Chaabane", emoji: "🏖️", bonus: 25 },
  ]},
  zaghouan:  { emoji: "⛰️", name: "Zaghouan",  bonus: 20, zones: [
    { id: "centre",  name: "Zaghouan Ville", emoji: "🏙️", bonus: 20 },
    { id: "fahs",    name: "El Fahs",        emoji: "🌿", bonus: 15 },
    { id: "birmch",  name: "Bir Mcherga",    emoji: "🏞️", bonus: 25 },
    { id: "nadhour", name: "Nadhour",        emoji: "🌳", bonus: 15 },
    { id: "zriba",   name: "Zriba",          emoji: "🏔️", bonus: 20 },
  ]},
  bizerte:   { emoji: "⚓", name: "Bizerte",   bonus: 30, zones: [
    { id: "centre", name: "Bizerte Ville",    emoji: "🏙️", bonus: 30 },
    { id: "ras",    name: "Ras Jebel",        emoji: "🏖️", bonus: 35 },
    { id: "ghar",   name: "Ghar El Melh",     emoji: "🏝️", bonus: 40 },
    { id: "menzel", name: "Menzel Bourguiba", emoji: "🌊", bonus: 25 },
    { id: "mateur", name: "Mateur",           emoji: "⛵", bonus: 20 },
  ]},
  beja:      { emoji: "🌾", name: "Beja",      bonus: 20, zones: [
    { id: "centre",  name: "Beja Ville", emoji: "🏙️", bonus: 20 },
    { id: "testour", name: "Testour",    emoji: "🏘️", bonus: 15 },
    { id: "nefza",   name: "Nefza",      emoji: "🌳", bonus: 25 },
    { id: "tebour",  name: "Teboursouk", emoji: "🏔️", bonus: 15 },
    { id: "amdoun",  name: "Amdoun",     emoji: "🌾", bonus: 10 },
  ]},
  jendouba:  { emoji: "🌲", name: "Jendouba",  bonus: 15, zones: [
    { id: "centre",  name: "Jendouba Ville", emoji: "🏙️", bonus: 15 },
    { id: "tabarka", name: "Tabarka",        emoji: "🏞️", bonus: 35 },
    { id: "aindr",   name: "Ain Draham",     emoji: "🌳", bonus: 30 },
    { id: "fernana", name: "Fernana",        emoji: "🏔️", bonus: 10 },
    { id: "ghard",   name: "Ghardimaou",     emoji: "🌿", bonus: 10 },
  ]},
  kef:       { emoji: "🏔️", name: "Kef",       bonus: 15, zones: [
    { id: "centre",  name: "Kef Ville",   emoji: "🏙️", bonus: 15 },
    { id: "dahmani", name: "Dahmani",     emoji: "🏘️", bonus: 10 },
    { id: "sakiet",  name: "Sakiet Sidi Youssef", emoji: "🌾", bonus: 10 },
    { id: "tajer",   name: "Tajerouine",  emoji: "🏔️", bonus: 15 },
    { id: "kalaat",  name: "Kalâat Senan",emoji: "🌿", bonus: 10 },
  ]},
  siliana:   { emoji: "🌿", name: "Siliana",   bonus: 10, zones: [
    { id: "centre",  name: "Siliana Ville", emoji: "🏙️", bonus: 10 },
    { id: "makthar", name: "Makthar",       emoji: "🏘️", bonus: 10 },
    { id: "bour",    name: "Bourouis",      emoji: "🌾", bonus: 5 },
    { id: "kesra",   name: "Kesra",         emoji: "⛰️", bonus: 10 },
    { id: "bouar",   name: "Bouarada",      emoji: "🌳", bonus: 5 },
  ]},
  kairouan:  { emoji: "🕌", name: "Kairouan",  bonus: 25, zones: [
    { id: "centre",  name: "Kairouan Ville", emoji: "🏙️", bonus: 25 },
    { id: "medina",  name: "Medina",         emoji: "🏛️", bonus: 35 },
    { id: "sbikha",  name: "Sbikha",         emoji: "🌾", bonus: 15 },
    { id: "hafouz",  name: "Hafouz",         emoji: "🏘️", bonus: 10 },
    { id: "oueslat", name: "Oueslatia",      emoji: "🕌", bonus: 15 },
  ]},
  kasserine: { emoji: "⛏️", name: "Kasserine", bonus: 15, zones: [
    { id: "centre",  name: "Kasserine Ville", emoji: "🏙️", bonus: 15 },
    { id: "sbeitla", name: "Sbeitla",         emoji: "🏔️", bonus: 20 },
    { id: "feriana", name: "Feriana",         emoji: "🏜️", bonus: 10 },
    { id: "thala",   name: "Thala",           emoji: "⛰️", bonus: 15 },
    { id: "sbiba",   name: "Sbiba",           emoji: "🏔️", bonus: 10 },
  ]},
  sidibouzid:{ emoji: "🌻", name: "Sidi Bouzid",bonus: 15, zones: [
    { id: "centre",   name: "Sidi Bouzid Ville",emoji: "🏙️", bonus: 15 },
    { id: "regueb",   name: "Regueb",           emoji: "🌾", bonus: 15 },
    { id: "meknassy", name: "Meknassy",         emoji: "🏘️", bonus: 10 },
    { id: "jelma",    name: "Jelma",            emoji: "🏜️", bonus: 10 },
    { id: "menzelb",  name: "Menzel Bouzaiene", emoji: "🌾", bonus: 10 },
  ]},
  sousse:    { emoji: "🏖️", name: "Sousse",    bonus: 40, zones: [
    { id: "centre",   name: "Sousse Centre",    emoji: "🏙️", bonus: 40 },
    { id: "kantaoui", name: "Port El Kantaoui", emoji: "🏖️", bonus: 55 },
    { id: "corniche", name: "Corniche",         emoji: "🌊", bonus: 50 },
    { id: "sahloul",  name: "Sahloul",          emoji: "🏢", bonus: 35 },
    { id: "msaken",   name: "Msaken",           emoji: "🏘️", bonus: 30 },
  ]},
  monastir:  { emoji: "🏰", name: "Monastir",  bonus: 35, zones: [
    { id: "centre",  name: "Monastir Ville", emoji: "🏙️", bonus: 35 },
    { id: "skanes",  name: "Skanes",         emoji: "🏖️", bonus: 45 },
    { id: "ksar",    name: "Ksar Hellal",    emoji: "🏘️", bonus: 25 },
    { id: "sahline", name: "Sahline",        emoji: "🌊", bonus: 25 },
    { id: "djemmal", name: "Djemmal",        emoji: "🏝️", bonus: 20 },
  ]},
  mahdia:    { emoji: "🐟", name: "Mahdia",    bonus: 25, zones: [
    { id: "centre",  name: "Mahdia Ville", emoji: "🏙️", bonus: 25 },
    { id: "rejiche", name: "Rejiche",      emoji: "🏖️", bonus: 35 },
    { id: "chebba",  name: "Chebba",       emoji: "🏝️", bonus: 30 },
    { id: "ksour",   name: "Ksour Essef",  emoji: "🌊", bonus: 20 },
    { id: "eljem",   name: "El Jem",       emoji: "🏛️", bonus: 25 },
  ]},
  sfax:      { emoji: "🏭", name: "Sfax",      bonus: 45, zones: [
    { id: "centre",  name: "Sfax Centre",    emoji: "🏙️", bonus: 45 },
    { id: "port",    name: "Sfax Port",      emoji: "⚓", bonus: 55 },
    { id: "sakietz", name: "Sakiet Ezzit",   emoji: "🏭", bonus: 50 },
    { id: "sakietd", name: "Sakiet Eddaier", emoji: "🏘️", bonus: 40 },
    { id: "chihia",  name: "Chihia",         emoji: "🏢", bonus: 35 },
  ]},
  gabes:     { emoji: "🌴", name: "Gabes",     bonus: 20, zones: [
    { id: "centre",  name: "Gabes Ville", emoji: "🏙️", bonus: 20 },
    { id: "chenini", name: "Chenini",     emoji: "🏖️", bonus: 30 },
    { id: "mareth",  name: "Mareth",      emoji: "🏝️", bonus: 25 },
    { id: "ghann",   name: "Ghannouch",   emoji: "🌊", bonus: 20 },
    { id: "matmata", name: "Matmata",     emoji: "🏜️", bonus: 15 },
  ]},
  medenine:  { emoji: "🏜️", name: "Medenine",  bonus: 15, zones: [
    { id: "centre",  name: "Medenine Ville",emoji: "🏙️", bonus: 15 },
    { id: "djerba",  name: "Djerba",        emoji: "🏝️", bonus: 45 },
    { id: "zarzis",  name: "Zarzis",        emoji: "🏖️", bonus: 30 },
    { id: "benguer", name: "Ben Guerdane",  emoji: "🏜️", bonus: 15 },
    { id: "houmt",   name: "Houmt Souk",    emoji: "🌴", bonus: 35 },
  ]},
  tataouine: { emoji: "🏜️", name: "Tataouine", bonus: 10, zones: [
    { id: "centre",  name: "Tataouine Ville",emoji: "🏙️", bonus: 10 },
    { id: "ghomras", name: "Ghomrassen",     emoji: "🏜️", bonus: 10 },
    { id: "remada",  name: "Remada",         emoji: "🌵", bonus: 5 },
    { id: "birlah",  name: "Bir Lahmar",     emoji: "🏜️", bonus: 5 },
    { id: "smar",    name: "Smâr",           emoji: "🌵", bonus: 5 },
  ]},
  gafsa:     { emoji: "⛏️", name: "Gafsa",     bonus: 25, zones: [
    { id: "centre",   name: "Gafsa Ville", emoji: "🏙️", bonus: 25 },
    { id: "metlaoui", name: "Metlaoui",    emoji: "🏭", bonus: 30 },
    { id: "redeyef",  name: "Redeyef",     emoji: "🌵", bonus: 20 },
    { id: "moulares", name: "Moularès",    emoji: "🏜️", bonus: 15 },
    { id: "mdhilla",  name: "Mdhilla",     emoji: "⛏️", bonus: 20 },
  ]},
  tozeur:    { emoji: "🌵", name: "Tozeur",    bonus: 20, zones: [
    { id: "centre",  name: "Tozeur Ville", emoji: "🏙️", bonus: 20 },
    { id: "nefta",   name: "Nefta",        emoji: "🏜️", bonus: 25 },
    { id: "degache", name: "Degache",      emoji: "🌴", bonus: 15 },
    { id: "hezoua",  name: "Hezoua",       emoji: "🏜️", bonus: 10 },
    { id: "tamerza", name: "Tamerza",      emoji: "🌵", bonus: 15 },
  ]},
  kebili:    { emoji: "🌴", name: "Kebili",    bonus: 15, zones: [
    { id: "centre", name: "Kebili Ville", emoji: "🏙️", bonus: 15 },
    { id: "douz",   name: "Douz",         emoji: "🏜️", bonus: 25 },
    { id: "soukl",  name: "Souk Lahad",   emoji: "🌵", bonus: 10 },
    { id: "faouar", name: "Faouar",       emoji: "🏜️", bonus: 10 },
    { id: "golaa",  name: "El Golâa",     emoji: "🌴", bonus: 10 },
  ]},
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
      started: false,
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
//   🎬 START PANEL (بالـBoutons فقط)
// ============================================
function buildStartPanel(user) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("💼 INVEST TYCOON — TUNISIA 🇹🇳")
    .setDescription(
      `👋 **Welcome ${user.username}!**\n\n` +
      `📋 **How to play:**\n` +
      `• Buy properties in 24 Tunisian cities\n` +
      `• Upgrade to earn more income\n` +
      `• Collect income every hour\n` +
      `• Compete to become the richest!\n\n` +
      `💰 **Starting:** 1,000 coins\n` +
      `📍 **Choose your starting city:**`
    )
    .setFooter({ text: SIGNATURE });

  const rows = [];
  const cityKeys = Object.keys(CITIES);
  let currentRow = new ActionRowBuilder();
  let count = 0;

  for (const cityId of cityKeys) {
    const cityData = CITIES[cityId];
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_start_${cityId}_${user.userId}`)
        .setLabel(`${cityData.emoji} ${cityData.name}`)
        .setStyle(ButtonStyle.Secondary)
    );
    count++;
    if (count % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }
  if (currentRow.components.length > 0) rows.push(currentRow);

  return { embeds: [embed], components: rows };
}

// ============================================
//   🏠 MAIN PANEL (بالأوامر — بلا boutons)
// ============================================
function buildMainPanel(user) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("💼 INVEST TYCOON — TUNISIA 🇹🇳")
    .setDescription(
      `👤 **${user.username}**\n` +
      `📍 City: ${CITIES[user.city].emoji} **${CITIES[user.city].name}**\n` +
      `💰 Coins: **${formatNumber(user.coins)}**\n` +
      `🏢 Properties: **${user.properties.length}**\n` +
      `📈 Income/hr: **+${formatNumber(getTotalIncome(user))}**\n\n` +
      `**📋 Commands:**\n` +
      "`.inv buy <type>` — 🛒 Buy property\n" +
      "`.inv collect` — 💰 Collect income\n" +
      "`.inv list` — 📋 Your properties\n" +
      "`.inv upgrade <id>` — ⬆️ Upgrade\n" +
      "`.inv map` — 🗺️ Map\n" +
      "`.inv profile` — 👤 Profile\n" +
      "`.inv travel <city>` — 🚗 Travel\n" +
      "`.inv zones` — 📍 Zones\n" +
      "`.inv categories` — 🏨 Categories\n" +
      "`.inv top` — 🏆 Leaderboard\n" +
      "`.inv daily` — 🎁 Daily\n" +
      "`.inv help` — ❓ Help"
    )
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   📍 ZONES PANEL
// ============================================
function buildZonesPanel(user) {
  const cityData = CITIES[user.city];

  let text = "";
  for (const zone of cityData.zones) {
    text += `${zone.emoji} **${zone.name}** — \`+${zone.bonus}%\`\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`📍 ${cityData.emoji} ${cityData.name} — Zones`)
    .setDescription(
      `**💰 Your coins:** ${formatNumber(user.coins)}\n\n${text}\n` +
      `_Buy in the first zone: \`.inv buy <type>\`_`
    )
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   🏨 CATEGORIES PANEL
// ============================================
function buildCategoriesPanel(user) {
  let text = "";
  for (const [catId, catData] of Object.entries(CATEGORIES)) {
    const count = Object.values(PROPERTY_TYPES).filter(p => p.category === catId).length;
    text += `${catData.emoji} **${catData.name}** — \`${count} types\`\n`;
    text += `   Use \`.inv types ${catId}\`\n\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("🏨 Categories")
    .setDescription(text)
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   🏢 TYPES PANEL
// ============================================
function buildTypesPanel(user, categoryId) {
  const catData = CATEGORIES[categoryId];
  if (!catData) {
    return { embeds: [new EmbedBuilder().setColor(COLOR_LOSE).setDescription("❌ Category not found!")] };
  }

  const properties = Object.entries(PROPERTY_TYPES).filter(([id, data]) => data.category === categoryId);
  const zoneId = CITIES[user.city].zones[0].id;

  let text = "";
  for (const [typeId, typeData] of properties) {
    const price = getPropertyPrice(typeId, user.city, zoneId);
    text += `${typeData.emoji} **${typeData.name}** — \`${formatNumber(price)}\`\n`;
    text += `   💰 +${formatNumber(typeData.income)}/hr • \`.inv buy ${typeId}\`\n\n`;
  }

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`${catData.emoji} ${catData.name} — Types`)
    .setDescription(`**💰 Your coins:** ${formatNumber(user.coins)}\n\n${text}`)
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   💰 COLLECT PANEL
// ============================================
function buildCollectPanel(user, earned, timePassed) {
  const hours = Math.floor(timePassed / (60 * 60 * 1000));
  const minutes = Math.floor((timePassed % (60 * 60 * 1000)) / (60 * 1000));

  let detailsText = "";
  for (const prop of user.properties.slice(0, 10)) {
    const typeData = PROPERTY_TYPES[prop.type];
    const cityData = CITIES[prop.city];
    const zoneData = cityData.zones.find(z => z.id === prop.zone);
    const bonus = 1 + (zoneData.bonus / 100);
    const propEarned = Math.floor(typeData.income * prop.level * bonus * (timePassed / (60 * 60 * 1000)));
    if (propEarned > 0) {
      detailsText += `${typeData.emoji} ${typeData.name} (${cityData.name}): +${formatNumber(propEarned)}\n`;
    }
  }

  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle("💰 Income Collected!")
    .setDescription(
      `⏱️ **Time:** ${hours}h ${minutes}m\n\n` +
      `${detailsText}` +
      `──────────────────\n` +
      `💰 **Total:** +${formatNumber(earned)} coins\n\n` +
      `💰 **New balance:** ${formatNumber(user.coins)}`
    )
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   📋 LIST PANEL
// ============================================
function buildListPanel(user) {
  if (user.properties.length === 0) {
    return { embeds: [new EmbedBuilder().setColor(COLOR_LOSE).setTitle("📋 Your Properties").setDescription("*You don't have any properties yet!*\nUse `.inv buy <type>` to get started.").setFooter({ text: SIGNATURE })] };
  }

  let text = "";
  user.properties.slice(0, 15).forEach((prop, i) => {
    const typeData = PROPERTY_TYPES[prop.type];
    const cityData = CITIES[prop.city];
    const zoneData = cityData.zones.find(z => z.id === prop.zone);
    const bonus = 1 + (zoneData.bonus / 100);
    const income = Math.floor(typeData.income * prop.level * bonus);

    text += `**${i + 1}.** ${typeData.emoji} ${typeData.name} ⭐${prop.level}\n`;
    text += `   📍 ${cityData.emoji} ${cityData.name} — ${zoneData.emoji} ${zoneData.name}\n`;
    text += `   💰 +${formatNumber(income)}/hr • \`.inv upgrade ${i + 1}\`\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle(`📋 Your Properties (${user.properties.length})`)
    .setDescription(text)
    .setFooter({ text: `Total: +${formatNumber(getTotalIncome(user))}/hr • ${SIGNATURE}` });

  return { embeds: [embed] };
}

// ============================================
//   🏆 TOP PANEL
// ============================================
function buildTopPanel() {
  const sorted = [...users.values()].sort((a, b) => {
    const aTotal = a.coins + getTotalIncome(a) * 100;
    const bTotal = b.coins + getTotalIncome(b) * 100;
    return bTotal - aTotal;
  }).slice(0, 10);

  let text = "";
  sorted.forEach((u, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
    text += `${medal} **${u.username}**\n`;
    text += `   💰 ${formatNumber(u.coins)} • 🏢 ${u.properties.length} • 📈 +${formatNumber(getTotalIncome(u))}/hr\n\n`;
  });

  if (text === "") text = "*No players yet!*";

  const embed = new EmbedBuilder()
    .setColor(COLOR_MONEY)
    .setTitle("🏆 INVEST TYCOON — TOP 10")
    .setDescription(text)
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   👤 PROFILE PANEL
// ============================================
function buildProfilePanel(user) {
  const sorted = [...users.values()].sort((a, b) => {
    const aTotal = a.coins + getTotalIncome(a) * 100;
    const bTotal = b.coins + getTotalIncome(b) * 100;
    return bTotal - aTotal;
  });
  const rank = sorted.findIndex(u => u.userId === user.userId) + 1;

  let totalStars = 0;
  for (const prop of user.properties) totalStars += prop.level;

  const embed = new EmbedBuilder()
    .setColor(COLOR_GOLD)
    .setTitle(`👤 ${user.username} — Profile`)
    .setDescription(
      `💰 **Coins:** ${formatNumber(user.coins)}\n` +
      `📍 **City:** ${CITIES[user.city].emoji} ${CITIES[user.city].name}\n` +
      `🏢 **Properties:** ${user.properties.length}\n` +
      `📈 **Income/hr:** +${formatNumber(getTotalIncome(user))}\n` +
      `⭐ **Total Stars:** ${totalStars}\n` +
      `🏆 **Rank:** #${rank}\n\n` +
      `📊 **Stats:**\n` +
      `• Total collected: ${formatNumber(user.totalEarned)}\n` +
      `• Total spent: ${formatNumber(user.totalSpent)}`
    )
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   🗺️ MAP PANEL
// ============================================
function buildMapPanel(user) {
  const cityProps = {};
  for (const prop of user.properties) {
    if (!cityProps[prop.city]) cityProps[prop.city] = [];
    cityProps[prop.city].push(prop);
  }

  let text = "";
  for (const [cityId, cityData] of Object.entries(CITIES)) {
    const props = cityProps[cityId] || [];
    if (props.length > 0) {
      let cityIncome = 0;
      for (const prop of props) {
        const typeData = PROPERTY_TYPES[prop.type];
        const zoneData = cityData.zones.find(z => z.id === prop.zone);
        const bonus = 1 + (zoneData.bonus / 100);
        cityIncome += typeData.income * prop.level * bonus;
      }
      text += `${cityData.emoji} **${cityData.name}** (+${cityData.bonus}%)\n`;
      text += `   🏢 ${props.length} • 📈 +${formatNumber(Math.floor(cityIncome))}/hr\n\n`;
    }
  }

  if (text === "") text = "*You don't have any properties yet!*";

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("🗺️ Tunisia Map")
    .setDescription(text)
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   ❓ HELP PANEL
// ============================================
function buildHelpPanel(user) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("❓ INVEST TYCOON — Help")
    .setDescription(
      `**📋 COMMANDS:**\n` +
      "`.inv` — 💼 Main panel\n" +
      "`.inv buy <type>` — 🛒 Buy property\n" +
      "`.inv collect` — 💰 Collect income\n" +
      "`.inv list` — 📋 Your properties\n" +
      "`.inv upgrade <id>` — ⬆️ Upgrade\n" +
      "`.inv map` — 🗺️ Map\n" +
      "`.inv profile` — 👤 Profile\n" +
      "`.inv travel <city>` — 🚗 Travel\n" +
      "`.inv zones` — 📍 Zones\n" +
      "`.inv categories` — 🏨 Categories\n" +
      "`.inv types <cat>` — 🏢 Property types\n" +
      "`.inv top` — 🏆 Leaderboard\n" +
      "`.inv daily` — 🎁 Daily reward\n\n" +
      `**💡 TIPS:**\n` +
      `• More ⭐ = more income\n` +
      `• Travel costs ${TRAVEL_COST}% of coins\n` +
      `• Old properties keep earning`
    )
    .setFooter({ text: SIGNATURE });

  return { embeds: [embed] };
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("💼 Initializing Invest Tycoon module...");

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.content.startsWith(PREFIX)) return;

      const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();

      // ===== .invest (Start Panel — أول مرة) =====
      if (command === "invest") {
        const user = getUser(message.author.id, message.author.username);

        // ✅ إلا بدا قبل → Main Panel
        if (user.started) {
          return message.channel.send(buildMainPanel(user));
        }

        // ✅ أول مرة → Start Panel
        return message.channel.send(buildStartPanel(user));
      }

      // ===== .inv (باقي الأوامر) =====
      if (command !== "inv") return;

      const user = getUser(message.author.id, message.author.username);

      // ✅ إلا مازال ما بداش
      if (!user.started) {
        return message.reply("❌ Start first with `.invest`!");
      }

      const sub = args[0]?.toLowerCase();

      // ===== .inv (بلا args) =====
      if (!sub) {
        return message.channel.send(buildMainPanel(user));
      }

      // ===== .inv top =====
      if (sub === "top") {
        return message.channel.send(buildTopPanel());
      }

      // ===== .inv collect =====
      if (sub === "collect") {
        const now = Date.now();
        const timePassed = now - user.lastCollect;
        const hoursPassed = timePassed / (60 * 60 * 1000);
        const income = getTotalIncome(user);
        const earned = Math.floor(income * hoursPassed);

        if (earned <= 0) return message.reply("⏰ No income to collect yet!");

        user.coins += earned;
        user.totalEarned += earned;
        user.lastCollect = now;

        return message.channel.send(buildCollectPanel(user, earned, timePassed));
      }

      // ===== .inv daily =====
      if (sub === "daily") {
        const now = Date.now();
        if (now - user.lastDaily < DAILY_COOLDOWN) {
          const remaining = DAILY_COOLDOWN - (now - user.lastDaily);
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
          return message.reply(`⏰ Already claimed! Next in: **${hours}h ${minutes}m**`);
        }

        user.coins += DAILY_REWARD;
        user.lastDaily = now;

        return message.reply(`🎁 **+${DAILY_REWARD} coins!**\n💰 Balance: **${formatNumber(user.coins)}**`);
      }

      // ===== .inv list =====
      if (sub === "list") {
        return message.channel.send(buildListPanel(user));
      }

      // ===== .inv map =====
      if (sub === "map") {
        return message.channel.send(buildMapPanel(user));
      }

      // ===== .inv profile =====
      if (sub === "profile") {
        return message.channel.send(buildProfilePanel(user));
      }

      // ===== .inv help =====
      if (sub === "help") {
        return message.channel.send(buildHelpPanel(user));
      }

      // ===== .inv zones =====
      if (sub === "zones") {
        return message.channel.send(buildZonesPanel(user));
      }

      // ===== .inv categories =====
      if (sub === "categories") {
        return message.channel.send(buildCategoriesPanel(user));
      }

      // ===== .inv types <cat> =====
      if (sub === "types") {
        const catId = args[1]?.toLowerCase();
        if (!catId || !CATEGORIES[catId]) {
          return message.reply("❌ Usage: `.inv types <category>`\nCategories: `hospitality`, `residential`, `commercial`, `industrial`, `agriculture`, `services`");
        }
        return message.channel.send(buildTypesPanel(user, catId));
      }

      // ===== .inv buy <type> =====
      if (sub === "buy") {
        const typeId = args[1]?.toLowerCase();
        if (!typeId || !PROPERTY_TYPES[typeId]) {
          return message.reply("❌ Usage: `.inv buy <type>`\nSee `.inv categories` for types.");
        }

        const zoneId = CITIES[user.city].zones[0].id;
        const price = getPropertyPrice(typeId, user.city, zoneId);

        if (user.coins < price) {
          return message.reply(`❌ Not enough coins! Need **${formatNumber(price)}**`);
        }

        user.coins -= price;
        user.totalSpent += price;

        user.properties.push({
          id: user.properties.length + 1,
          type: typeId,
          city: user.city,
          zone: zoneId,
          level: 1,
          purchasedAt: Date.now(),
        });

        const typeData = PROPERTY_TYPES[typeId];
        const cityData = CITIES[user.city];
        const zoneData = cityData.zones.find(z => z.id === zoneId);
        const bonus = 1 + (zoneData.bonus / 100);

        const embed = new EmbedBuilder()
          .setColor(COLOR_WIN)
          .setTitle("✅ Purchase Successful!")
          .setDescription(
            `${typeData.emoji} **${typeData.name}** ⭐1\n` +
            `📍 ${cityData.emoji} ${cityData.name} — ${zoneData.emoji} ${zoneData.name}\n\n` +
            `💰 **Price:** ${formatNumber(price)}\n` +
            `📈 **Income:** +${formatNumber(Math.floor(typeData.income * bonus))}/hr\n\n` +
            `💰 **New balance:** ${formatNumber(user.coins)}`
          )
          .setFooter({ text: SIGNATURE });

        return message.channel.send({ embeds: [embed] });
      }

      // ===== .inv upgrade <id> =====
      if (sub === "upgrade") {
        const idx = parseInt(args[1], 10) - 1;
        if (isNaN(idx) || !user.properties[idx]) {
          return message.reply("❌ Usage: `.inv upgrade <id>`\nSee `.inv list` for IDs.");
        }

        const prop = user.properties[idx];
        const cost = getUpgradeCost(prop);

        if (user.coins < cost) {
          return message.reply(`❌ Not enough coins! Need **${formatNumber(cost)}**`);
        }

        user.coins -= cost;
        prop.level += 1;

        const typeData = PROPERTY_TYPES[prop.type];
        return message.reply(`✅ **${typeData.emoji} ${typeData.name}** upgraded to ⭐${prop.level}!\n💰 Cost: ${formatNumber(cost)}`);
      }

      // ===== .inv travel <city> =====
      if (sub === "travel") {
        const cityId = args[1]?.toLowerCase();
        if (!cityId || !CITIES[cityId]) {
          return message.reply("❌ Usage: `.inv travel <city>`\nCities: `tunis`, `sousse`, `sfax`, `nabeul`, `gabes`, `tozeur`, ...");
        }

        if (cityId === user.city) {
          return message.reply("❌ You're already in this city!");
        }

        const cost = Math.floor(user.coins * TRAVEL_COST / 100);
        if (user.coins < cost) {
          return message.reply("❌ Not enough coins!");
        }

        user.coins -= cost;
        user.city = cityId;

        const cityData = CITIES[cityId];
        return message.reply(`🚗 Traveled to ${cityData.emoji} **${cityData.name}**!\n💰 Cost: ${formatNumber(cost)} • Balance: ${formatNumber(user.coins)}`);
      }

      // ===== Unknown sub-command =====
      return message.reply("❌ Unknown command! Use `.inv help`");

    } catch (err) {
      console.error("❌ Error in invest messageCreate:", err);
    }
  });

  // ============ INTERACTIONS (Start Panel فقط) ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      if (!id.startsWith("invest_start_")) return;

      const parts = id.split("_");
      const cityId = parts[2];
      const userId = parts[3];

      if (interaction.user.id !== userId) {
        return interaction.reply({ content: "❌ Not your game!", ephemeral: true });
      }

      if (!CITIES[cityId]) {
        return interaction.reply({ content: "❌ City not found!", ephemeral: true });
      }

      const user = getUser(userId);

      if (user.started) {
        return interaction.reply({ content: "❌ You already started!", ephemeral: true });
      }

      user.city = cityId;
      user.started = true;
      user.lastCollect = Date.now();

      return interaction.update(buildMainPanel(user));

    } catch (err) {
      console.error("❌ Error in invest interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Invest Tycoon module ready!");
}

module.exports = { init };
