// ============================================
//   INVEST TYCOON — TUNISIA 🇹🇳 (FULL + START)
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
//   🎬 START PANEL
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
        .setStyle(ButtonStyle.Primary)
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
//   🏠 MAIN PANEL
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
      `📈 Income/hr: **+${formatNumber(getTotalIncome(user))}**`
    )
    .setFooter({ text: SIGNATURE });

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_buy_${user.userId}`).setLabel("🛒 BUY").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`invest_collect_${user.userId}`).setLabel("💰 COLLECT").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`invest_top`).setLabel("🏆 TOP").setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_list_${user.userId}`).setLabel("📋 LIST").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`invest_upgrade_${user.userId}`).setLabel("⬆️ UPGRADE").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`invest_map_${user.userId}`).setLabel("🗺️ MAP").setStyle(ButtonStyle.Secondary)
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_profile_${user.userId}`).setLabel("👤 PROFILE").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`invest_travel_${user.userId}`).setLabel("🚗 TRAVEL").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`invest_help_${user.userId}`).setLabel("❓ HELP").setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2, row3] };
}

// ============================================
//   📍 ZONE PANEL
// ============================================
function buildZonePanel(user) {
  const cityData = CITIES[user.city];

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`🛒 Buy Property — ${cityData.emoji} ${cityData.name}`)
    .setDescription(`💰 **Your coins:** ${formatNumber(user.coins)}\n\nChoose a zone:`)
    .setFooter({ text: SIGNATURE });

  const rows = [];
  let currentRow = new ActionRowBuilder();

  for (let i = 0; i < cityData.zones.length; i++) {
    const zone = cityData.zones[i];
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_zone_${zone.id}_${user.userId}`)
        .setLabel(`${zone.emoji} ${zone.name} (+${zone.bonus}%)`)
        .setStyle(ButtonStyle.Secondary)
    );
    if ((i + 1) % 3 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }
  if (currentRow.components.length > 0) rows.push(currentRow);

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  ));

  return { embeds: [embed], components: rows };
}

// ============================================
//   🏨 CATEGORY PANEL
// ============================================
function buildCategoryPanel(user, zoneId) {
  const cityData = CITIES[user.city];
  const zoneData = cityData.zones.find(z => z.id === zoneId);

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`🏨 Buy Property — ${zoneData.emoji} ${zoneData.name}`)
    .setDescription(
      `📍 **City:** ${cityData.emoji} ${cityData.name}\n` +
      `🏙️ **Zone:** ${zoneData.name} (+${zoneData.bonus}%)\n` +
      `💰 **Your coins:** ${formatNumber(user.coins)}\n\n` +
      `Choose a category:`
    )
    .setFooter({ text: SIGNATURE });

  const rows = [];
  const catKeys = Object.keys(CATEGORIES);
  let currentRow = new ActionRowBuilder();

  for (let i = 0; i < catKeys.length; i++) {
    const catId = catKeys[i];
    const catData = CATEGORIES[catId];
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_cat_${catId}_${zoneId}_${user.userId}`)
        .setLabel(`${catData.emoji} ${catData.name}`)
        .setStyle(ButtonStyle.Secondary)
    );
    if ((i + 1) % 3 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }
  if (currentRow.components.length > 0) rows.push(currentRow);

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_buy_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  ));

  return { embeds: [embed], components: rows };
}

// ============================================
//   🏢 PROPERTY PANEL
// ============================================
function buildPropertyPanel(user, zoneId, categoryId) {
  const cityData = CITIES[user.city];
  const zoneData = cityData.zones.find(z => z.id === zoneId);
  const catData = CATEGORIES[categoryId];

  const properties = Object.entries(PROPERTY_TYPES).filter(([id, data]) => data.category === categoryId);

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`${catData.emoji} ${catData.name} — ${zoneData.emoji} ${zoneData.name}`)
    .setDescription(
      `📍 **City:** ${cityData.emoji} ${cityData.name}\n` +
      `🏙️ **Zone:** ${zoneData.name} (+${zoneData.bonus}%)\n` +
      `💰 **Your coins:** ${formatNumber(user.coins)}\n\n` +
      `Choose a property:`
    )
    .setFooter({ text: SIGNATURE });

  const rows = [];
  let currentRow = new ActionRowBuilder();

  for (let i = 0; i < properties.length; i++) {
    const [typeId, typeData] = properties[i];
    const price = getPropertyPrice(typeId, user.city, zoneId);

    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_buyprop_${typeId}_${zoneId}_${user.userId}`)
        .setLabel(`${typeData.emoji} ${typeData.name} — ${formatNumber(price)}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(user.coins < price)
    );
    if ((i + 1) % 2 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }
  if (currentRow.components.length > 0) rows.push(currentRow);

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_zone_${zoneId}_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  ));

  return { embeds: [embed], components: rows };
}

// ============================================
//   ✅ CONFIRM PANEL
// ============================================
function buildConfirmPanel(user, typeId, zoneId, price) {
  const cityData = CITIES[user.city];
  const zoneData = cityData.zones.find(z => z.id === zoneId);
  const typeData = PROPERTY_TYPES[typeId];
  const bonus = 1 + (zoneData.bonus / 100);
  const income = Math.floor(typeData.income * bonus);
  const upgradeCost = Math.floor(typeData.price * 0.5 * bonus);

  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle("✅ Purchase Successful!")
    .setDescription(
      `${typeData.emoji} **${typeData.name}** ⭐1\n` +
      `📍 ${cityData.emoji} ${cityData.name} — ${zoneData.emoji} ${zoneData.name}\n\n` +
      `💰 **Price:** ${formatNumber(price)}\n` +
      `📈 **Income:** +${formatNumber(income)}/hr\n` +
      `🎯 **Next upgrade:** ${formatNumber(upgradeCost)}\n\n` +
      `💰 **New balance:** ${formatNumber(user.coins)}`
    )
    .setFooter({ text: SIGNATURE });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_buy_${user.userId}`).setLabel("🛒 BUY MORE").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`invest_collect_${user.userId}`).setLabel("💰 COLLECT").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("🏠 MAIN").setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
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

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_buy_${user.userId}`).setLabel("🛒 BUY MORE").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(`invest_upgrade_${user.userId}`).setLabel("⬆️ UPGRADE").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("🏠 MAIN").setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row] };
}

// ============================================
//   ⬆️ UPGRADE PANEL
// ============================================
function buildUpgradePanel(user) {
  if (user.properties.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLOR_LOSE)
      .setTitle("⬆️ Upgrade Property")
      .setDescription("*No properties to upgrade!*")
      .setFooter({ text: SIGNATURE });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row] };
  }

  let text = "";
  user.properties.slice(0, 10).forEach((prop, i) => {
    const typeData = PROPERTY_TYPES[prop.type];
    const cityData = CITIES[prop.city];
    const zoneData = cityData.zones.find(z => z.id === prop.zone);
    const bonus = 1 + (zoneData.bonus / 100);
    const currentIncome = Math.floor(typeData.income * prop.level * bonus);
    const nextIncome = Math.floor(typeData.income * (prop.level + 1) * bonus);
    const cost = getUpgradeCost(prop);

    text += `**${i + 1}.** ${typeData.emoji} ${typeData.name} ⭐${prop.level}\n`;
    text += `   💰 +${formatNumber(currentIncome)} → +${formatNumber(nextIncome)}/hr\n`;
    text += `   🎯 Cost: ${formatNumber(cost)}\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("⬆️ Upgrade Property")
    .setDescription(`💰 **Your coins:** ${formatNumber(user.coins)}\n\n${text}`)
    .setFooter({ text: SIGNATURE });

  const rows = [];
  let currentRow = new ActionRowBuilder();

  user.properties.slice(0, 10).forEach((prop, i) => {
    const cost = getUpgradeCost(prop);
    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_doupgrade_${i}_${user.userId}`)
        .setLabel(`⬆️ #${i + 1}`)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(user.coins < cost)
    );
    if ((i + 1) % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  });
  if (currentRow.components.length > 0) rows.push(currentRow);

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  ));

  return { embeds: [embed], components: rows };
}

// ============================================
//   📋 LIST PANEL
// ============================================
function buildListPanel(user) {
  if (user.properties.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLOR_LOSE)
      .setTitle("📋 Your Properties")
      .setDescription("*You don't have any properties yet!*")
      .setFooter({ text: SIGNATURE });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row] };
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
    text += `   💰 +${formatNumber(income)}/hr\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle(`📋 Your Properties (${user.properties.length})`)
    .setDescription(text)
    .setFooter({ text: `Total: +${formatNumber(getTotalIncome(user))}/hr • ${SIGNATURE}` });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
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
    text += `   💰 ${formatNumber(u.coins)} coins\n`;
    text += `   🏢 ${u.properties.length} properties\n`;
    text += `   📈 +${formatNumber(getTotalIncome(u))}/hr\n\n`;
  });

  if (text === "") text = "*No players yet!*";

  const embed = new EmbedBuilder()
    .setColor(COLOR_MONEY)
    .setTitle("🏆 INVEST TYCOON — TOP 10")
    .setDescription(text)
    .setFooter({ text: SIGNATURE });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("invest_close").setLabel("✖️ CLOSE").setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
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

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
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

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

// ============================================
//   🚗 TRAVEL PANEL
// ============================================
function buildTravelPanel(user) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("🚗 Travel to Another City")
    .setDescription(
      `📍 **Current:** ${CITIES[user.city].emoji} ${CITIES[user.city].name}\n` +
      `💰 **Cost:** ${TRAVEL_COST}% of coins (${formatNumber(Math.floor(user.coins * TRAVEL_COST / 100))})\n\n` +
      `Choose a city:`
    )
    .setFooter({ text: SIGNATURE });

  const rows = [];
  const cityKeys = Object.keys(CITIES);
  let currentRow = new ActionRowBuilder();
  let count = 0;

  for (const cityId of cityKeys) {
    const cityData = CITIES[cityId];
    const isCurrent = cityId === user.city;

    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_travelto_${cityId}_${user.userId}`)
        .setLabel(`${cityData.emoji} ${cityData.name}`)
        .setStyle(isCurrent ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(isCurrent)
    );
    count++;
    if (count % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }
  if (currentRow.components.length > 0) rows.push(currentRow);

  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  ));

  return { embeds: [embed], components: rows };
}

// ============================================
//   ❓ HELP PANEL
// ============================================
function buildHelpPanel(user) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("❓ INVEST TYCOON — Help")
    .setDescription(
      `**🎮 BUTTONS:**\n` +
      `🛒 BUY • 💰 COLLECT • 🏆 TOP\n` +
      `📋 LIST • ⬆️ UPGRADE • 🗺️ MAP\n` +
      `👤 PROFILE • 🚗 TRAVEL • ❓ HELP\n\n` +
      `**💡 TIPS:**\n` +
      `• More ⭐ = more income\n` +
      `• Travel costs ${TRAVEL_COST}% of coins\n` +
      `• Old properties keep earning`
    )
    .setFooter({ text: SIGNATURE });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`invest_back_${user.userId}`).setLabel("⬅️ BACK").setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
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

      if (command !== "invest") return;

      const user = getUser(message.author.id, message.author.username);

      // ✅ أول مرة → Start Panel
      if (!user.started) {
        return message.channel.send(buildStartPanel(user));
      }

      // Sub-commands
      if (args[0] === "top") return message.channel.send(buildTopPanel());

      if (args[0] === "collect") {
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

      if (args[0] === "daily") {
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

      // Main Panel
      return message.channel.send(buildMainPanel(user));

    } catch (err) {
      console.error("❌ Error in invest messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      if (!id.startsWith("invest_")) return;

      const parts = id.split("_");
      const userId = parts[parts.length - 1];

      // ===== START (اختيار الولاية) =====
      if (parts[1] === "start") {
        const cityId = parts[2];
        const user = getUser(userId);

        if (interaction.user.id !== userId) {
          return interaction.reply({ content: "❌ Not your game!", ephemeral: true });
        }

        if (!CITIES[cityId]) {
          return interaction.reply({ content: "❌ City not found!", ephemeral: true });
        }

        if (user.started) {
          return interaction.reply({ content: "❌ You already started!", ephemeral: true });
        }

        user.city = cityId;
        user.started = true;
        user.lastCollect = Date.now();

        return interaction.update(buildMainPanel(user));
      }

      // ===== TOP =====
      if (id === "invest_top") {
        return interaction.reply({ ...buildTopPanel(), ephemeral: true });
      }

      // ===== CLOSE =====
      if (id === "invest_close") {
        return interaction.message.delete().catch(() => {});
      }

      const user = getUser(userId);

      if (interaction.user.id !== userId) {
        return interaction.reply({ content: "❌ Not your game!", ephemeral: true });
      }

      // ===== BACK =====
      if (parts[1] === "back") {
        return interaction.update(buildMainPanel(user));
      }

      // ===== BUY =====
      if (parts[1] === "buy" && parts.length === 3) {
        return interaction.update(buildZonePanel(user));
      }

      // ===== ZONE =====
      if (parts[1] === "zone") {
        const zoneId = parts[2];
        return interaction.update(buildCategoryPanel(user, zoneId));
      }

      // ===== CATEGORY =====
      if (parts[1] === "cat") {
        const catId = parts[2];
        const zoneId = parts[3];
        return interaction.update(buildPropertyPanel(user, zoneId, catId));
      }

      // ===== BUY PROPERTY =====
      if (parts[1] === "buyprop") {
        const typeId = parts[2];
        const zoneId = parts[3];
        const price = getPropertyPrice(typeId, user.city, zoneId);

        if (user.coins < price) {
          return interaction.reply({ content: `❌ Not enough coins! Need **${formatNumber(price)}**`, ephemeral: true });
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

        return interaction.update(buildConfirmPanel(user, typeId, zoneId, price));
      }

      // ===== COLLECT =====
      if (parts[1] === "collect") {
        const now = Date.now();
        const timePassed = now - user.lastCollect;
        const hoursPassed = timePassed / (60 * 60 * 1000);
        const income = getTotalIncome(user);
        const earned = Math.floor(income * hoursPassed);

        if (earned <= 0) return interaction.reply({ content: "⏰ No income yet!", ephemeral: true });

        user.coins += earned;
        user.totalEarned += earned;
        user.lastCollect = now;

        return interaction.update(buildCollectPanel(user, earned, timePassed));
      }

      // ===== LIST =====
      if (parts[1] === "list") {
        return interaction.update(buildListPanel(user));
      }

      // ===== UPGRADE (open) =====
      if (parts[1] === "upgrade" && parts.length === 3) {
        return interaction.update(buildUpgradePanel(user));
      }

      // ===== DO UPGRADE =====
      if (parts[1] === "doupgrade") {
        const idx = parseInt(parts[2], 10);
        const prop = user.properties[idx];
        if (!prop) return interaction.reply({ content: "❌ Not found.", ephemeral: true });

        const cost = getUpgradeCost(prop);
        if (user.coins < cost) return interaction.reply({ content: `❌ Need **${formatNumber(cost)}**`, ephemeral: true });

        user.coins -= cost;
        prop.level += 1;

        return interaction.update(buildUpgradePanel(user));
      }

      // ===== MAP =====
      if (parts[1] === "map") {
        return interaction.update(buildMapPanel(user));
      }

      // ===== PROFILE =====
      if (parts[1] === "profile") {
        return interaction.update(buildProfilePanel(user));
      }

      // ===== TRAVEL (open) =====
      if (parts[1] === "travel" && parts.length === 3) {
        return interaction.update(buildTravelPanel(user));
      }

      // ===== TRAVEL TO =====
      if (parts[1] === "travelto") {
        const cityId = parts[2];
        if (!CITIES[cityId]) return interaction.reply({ content: "❌ City not found.", ephemeral: true });

        const cost = Math.floor(user.coins * TRAVEL_COST / 100);
        if (user.coins < cost) return interaction.reply({ content: "❌ Not enough coins!", ephemeral: true });

        user.coins -= cost;
        user.city = cityId;

        return interaction.update(buildMainPanel(user));
      }

      // ===== HELP =====
      if (parts[1] === "help") {
        return interaction.update(buildHelpPanel(user));
      }

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
