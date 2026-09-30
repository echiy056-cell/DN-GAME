// ============================================
//   INVEST TYCOON — TUNISIA 🇹🇳
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

const STARTING_COINS = 1000;
const DAILY_REWARD = 100;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

// ============================================
//   PROPERTY TYPES (6)
// ============================================
const PROPERTY_TYPES = {
  motel:      { emoji: "🏠", name: "Motel",        price: 100,    income: 5 },
  hostel:     { emoji: "🏨", name: "Hostel",       price: 500,    income: 25 },
  hotel:      { emoji: "🏨", name: "Hotel",        price: 1000,   income: 50 },
  resort:     { emoji: "🏩", name: "Resort",       price: 5000,   income: 250 },
  luxury:     { emoji: "🏰", name: "Luxury Hotel", price: 25000,  income: 1500 },
  fivestar:   { emoji: "🏝️", name: "5-Star Resort",price: 100000, income: 10000 },
};

// ============================================
//   CITIES (6)
// ============================================
const CITIES = {
  tunis:  { emoji: "🏛️", name: "Tunis",  bonus: 50, zones: [
    { id: "centre", name: "Centre Ville", emoji: "🏙️", bonus: 50 },
    { id: "marsa",  name: "La Marsa",     emoji: "🏖️", bonus: 60 },
  ]},
  sousse: { emoji: "🏖️", name: "Sousse", bonus: 40, zones: [
    { id: "centre", name: "Sousse Centre", emoji: "🏙️", bonus: 40 },
    { id: "corniche", name: "Corniche",     emoji: "🌊", bonus: 50 },
  ]},
  sfax:   { emoji: "🏭", name: "Sfax",   bonus: 45, zones: [
    { id: "centre", name: "Sfax Centre", emoji: "🏙️", bonus: 45 },
    { id: "port",   name: "Sfax Port",   emoji: "⚓", bonus: 55 },
  ]},
  nabeul: { emoji: "🍊", name: "Nabeul", bonus: 25, zones: [
    { id: "centre",   name: "Nabeul Ville", emoji: "🏙️", bonus: 25 },
    { id: "hammamet", name: "Hammamet",     emoji: "🏖️", bonus: 35 },
  ]},
  gabes:  { emoji: "🌴", name: "Gabes",  bonus: 20, zones: [
    { id: "centre", name: "Gabes Ville", emoji: "🏙️", bonus: 20 },
    { id: "chenini", name: "Chenini",     emoji: "🏝️", bonus: 30 },
  ]},
  tozeur: { emoji: "🌵", name: "Tozeur", bonus: 20, zones: [
    { id: "centre", name: "Tozeur Ville", emoji: "🏙️", bonus: 20 },
    { id: "nefta",  name: "Nefta",        emoji: "🏜️", bonus: 25 },
  ]},
};

// ============================================
//   STORAGE
// ============================================
const users = new Map();    // userId → userData
const activeGames = new Map(); // userId → gameState

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
      properties: [], // { id, type, city, zone, level, purchasedAt }
      totalEarned: 0,
      totalSpent: 0,
      lastDaily: 0,
      lastCollect: Date.now(),
    });
  } else if (username && users.get(userId).username !== username) {
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

// ============================================
//   BUILD PANELS
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
    new ButtonBuilder()
      .setCustomId(`invest_buy_${user.userId}`)
      .setLabel("🛒 BUY")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`invest_collect_${user.userId}`)
      .setLabel("💰 COLLECT")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`invest_list_${user.userId}`)
      .setLabel("📋 LIST")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`invest_upgrade_${user.userId}`)
      .setLabel("⬆️ UPGRADE")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`invest_travel_${user.userId}`)
      .setLabel("🚗 TRAVEL")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`invest_top`)
      .setLabel("🏆 TOP")
      .setStyle(ButtonStyle.Secondary)
  );

  return { embeds: [embed], components: [row1, row2] };
}

function buildCityPanel(user) {
  const cityData = CITIES[user.city];

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`🛒 Buy Property — ${cityData.emoji} ${cityData.name}`)
    .setDescription(
      `💰 **Your coins:** ${formatNumber(user.coins)}\n\n` +
      `Choose a zone:`
    )
    .setFooter({ text: SIGNATURE });

  const row = new ActionRowBuilder();
  for (const zone of cityData.zones) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_zone_${zone.id}_${user.userId}`)
        .setLabel(`${zone.emoji} ${zone.name} (+${zone.bonus}%)`)
        .setStyle(ButtonStyle.Secondary)
    );
  }
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`invest_back_${user.userId}`)
      .setLabel("⬅️ BACK")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

function buildPropertyPanel(user, zoneId) {
  const cityData = CITIES[user.city];
  const zoneData = cityData.zones.find(z => z.id === zoneId);

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`🏢 Buy Property — ${zoneData.emoji} ${zoneData.name}`)
    .setDescription(
      `📍 **City:** ${cityData.emoji} ${cityData.name}\n` +
      `🏙️ **Zone:** ${zoneData.name} (+${zoneData.bonus}%)\n` +
      `💰 **Your coins:** ${formatNumber(user.coins)}\n\n` +
      `**Available properties:**`
    )
    .setFooter({ text: SIGNATURE });

  const rows = [];
  let currentRow = new ActionRowBuilder();

  const types = Object.entries(PROPERTY_TYPES);
  for (let i = 0; i < types.length; i++) {
    const [typeId, typeData] = types[i];
    const price = getPropertyPrice(typeId, user.city, zoneId);

    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_buy_${typeId}_${zoneId}_${user.userId}`)
        .setLabel(`${typeData.emoji} ${typeData.name} — ${formatNumber(price)}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(user.coins < price)
    );

    if ((i + 1) % 2 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }
  if (currentRow.components.length > 0) rows.push(currentRow);

  const backRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`invest_back_${user.userId}`)
      .setLabel("⬅️ BACK")
      .setStyle(ButtonStyle.Danger)
  );
  rows.push(backRow);

  return { embeds: [embed], components: rows };
}

function buildListPanel(user) {
  if (user.properties.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLOR_LOSE)
      .setTitle("📋 Your Properties")
      .setDescription("*You don't have any properties yet!*\nUse 🛒 BUY to get started.")
      .setFooter({ text: SIGNATURE });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_back_${user.userId}`)
        .setLabel("⬅️ BACK")
        .setStyle(ButtonStyle.Danger)
    );

    return { embeds: [embed], components: [row] };
  }

  let text = "";
  user.properties.slice(0, 10).forEach((prop, i) => {
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
    new ButtonBuilder()
      .setCustomId(`invest_back_${user.userId}`)
      .setLabel("⬅️ BACK")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

function buildTravelPanel(user) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("🚗 Travel to Another City")
    .setDescription(
      `📍 **Current:** ${CITIES[user.city].emoji} ${CITIES[user.city].name}\n` +
      `💰 **Cost:** 10% of coins (${formatNumber(Math.floor(user.coins * 0.1))})\n\n` +
      `Choose a city:`
    )
    .setFooter({ text: SIGNATURE });

  const row = new ActionRowBuilder();
  for (const [cityId, cityData] of Object.entries(CITIES)) {
    if (cityId === user.city) continue;
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_travel_${cityId}_${user.userId}`)
        .setLabel(`${cityData.emoji} ${cityData.name}`)
        .setStyle(ButtonStyle.Secondary)
    );
  }
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`invest_back_${user.userId}`)
      .setLabel("⬅️ BACK")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

function buildUpgradePanel(user) {
  if (user.properties.length === 0) {
    const embed = new EmbedBuilder()
      .setColor(COLOR_LOSE)
      .setTitle("⬆️ Upgrade")
      .setDescription("*No properties to upgrade!*")
      .setFooter({ text: SIGNATURE });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_back_${user.userId}`)
        .setLabel("⬅️ BACK")
        .setStyle(ButtonStyle.Danger)
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
    const upgradeCost = Math.floor(typeData.price * prop.level * 0.5 * bonus);

    text += `**${i + 1}.** ${typeData.emoji} ${typeData.name} ⭐${prop.level}\n`;
    text += `   💰 +${formatNumber(currentIncome)} → +${formatNumber(nextIncome)}/hr\n`;
    text += `   🎯 Cost: ${formatNumber(upgradeCost)}\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle("⬆️ Upgrade Property")
    .setDescription(`💰 **Your coins:** ${formatNumber(user.coins)}\n\n${text}`)
    .setFooter({ text: SIGNATURE });

  const row = new ActionRowBuilder();
  user.properties.slice(0, 5).forEach((prop, i) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`invest_upgrade_${i}_${user.userId}`)
        .setLabel(`⬆️ #${i + 1}`)
        .setStyle(ButtonStyle.Secondary)
    );
  });
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`invest_back_${user.userId}`)
      .setLabel("⬅️ BACK")
      .setStyle(ButtonStyle.Danger)
  );

  return { embeds: [embed], components: [row] };
}

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
    new ButtonBuilder()
      .setCustomId("invest_close")
      .setLabel("✖️ CLOSE")
      .setStyle(ButtonStyle.Danger)
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

      // ===== .invest =====
      if (command === "invest") {
        const user = getUser(message.author.id, message.author.username);

        // Sub-commands
        if (args[0] === "top") {
          return message.channel.send(buildTopPanel());
        }

        if (args[0] === "collect") {
          const now = Date.now();
          const timePassed = now - user.lastCollect;
          const hoursPassed = timePassed / (60 * 60 * 1000);
          const income = getTotalIncome(user);
          const earned = Math.floor(income * hoursPassed);

          if (earned <= 0) {
            return message.reply("⏰ No income to collect yet! Wait a bit.");
          }

          user.coins += earned;
          user.totalEarned += earned;
          user.lastCollect = now;

          const embed = new EmbedBuilder()
            .setColor(COLOR_WIN)
            .setTitle("💰 Income Collected!")
            .setDescription(
              `⏱️ Time: **${Math.floor(hoursPassed)}h ${Math.floor((hoursPassed * 60) % 60)}m**\n\n` +
              `💰 **+${formatNumber(earned)} coins**\n` +
              `💰 **New balance:** ${formatNumber(user.coins)}`
            )
            .setFooter({ text: SIGNATURE });

          return message.channel.send({ embeds: [embed] });
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

          return message.reply(`🎁 **+${DAILY_REWARD} coins!**\n💰 New balance: **${formatNumber(user.coins)}**`);
        }

        // Main Panel
        return message.channel.send(buildMainPanel(user));
      }

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
      const action = parts[1];
      const userId = parts[parts.length - 1];

      // ===== BACK =====
      if (action === "back") {
        const user = getUser(userId);
        return interaction.update(buildMainPanel(user));
      }

      // ===== CLOSE =====
      if (action === "close") {
        return interaction.message.delete().catch(() => {});
      }

      // ===== TOP =====
      if (id === "invest_top") {
        return interaction.reply({ ...buildTopPanel(), ephemeral: true });
      }

      // ===== BUY =====
      if (action === "buy" && parts.length === 3) {
        // invest_buy_USERID
        const user = getUser(userId);
        return interaction.update(buildCityPanel(user));
      }

      // ===== ZONE =====
      if (action === "zone") {
        const zoneId = parts[2];
        const user = getUser(userId);
        return interaction.update(buildPropertyPanel(user, zoneId));
      }

      // ===== BUY PROPERTY =====
      if (action === "buy" && parts.length === 5) {
        // invest_buy_TYPE_ZONE_USERID
        const typeId = parts[2];
        const zoneId = parts[3];
        const user = getUser(userId);

        if (interaction.user.id !== userId) {
          return interaction.reply({ content: "❌ This is not your game!", ephemeral: true });
        }

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

        const typeData = PROPERTY_TYPES[typeId];

        const embed = new EmbedBuilder()
          .setColor(COLOR_WIN)
          .setTitle("✅ Purchase Successful!")
          .setDescription(
            `${typeData.emoji} **${typeData.name}** ⭐1\n` +
            `📍 ${CITIES[user.city].emoji} ${CITIES[user.city].name}\n\n` +
            `💰 **Price:** ${formatNumber(price)}\n` +
            `💰 **New balance:** ${formatNumber(user.coins)}`
          )
          .setFooter({ text: SIGNATURE });

        return interaction.update({ ...buildMainPanel(user), embeds: [embed] });
      }

      // ===== LIST =====
      if (action === "list") {
        const user = getUser(userId);
        return interaction.update(buildListPanel(user));
      }

      // ===== UPGRADE =====
      if (action === "upgrade" && parts.length === 3) {
        const user = getUser(userId);
        return interaction.update(buildUpgradePanel(user));
      }

      // ===== UPGRADE CONFIRM =====
      if (action === "upgrade" && parts.length === 4) {
        const idx = parseInt(parts[2], 10);
        const user = getUser(userId);

        const prop = user.properties[idx];
        if (!prop) {
          return interaction.reply({ content: "❌ Property not found.", ephemeral: true });
        }

        const typeData = PROPERTY_TYPES[prop.type];
        const cityData = CITIES[prop.city];
        const zoneData = cityData.zones.find(z => z.id === prop.zone);
        const bonus = 1 + (zoneData.bonus / 100);
        const cost = Math.floor(typeData.price * prop.level * 0.5 * bonus);

        if (user.coins < cost) {
          return interaction.reply({ content: `❌ Not enough coins! Need **${formatNumber(cost)}**`, ephemeral: true });
        }

        user.coins -= cost;
        prop.level += 1;

        return interaction.reply({
          content: `✅ **${typeData.emoji} ${typeData.name}** upgraded to ⭐${prop.level}!\n💰 Cost: ${formatNumber(cost)}`,
          ephemeral: true,
        });
      }

      // ===== COLLECT =====
      if (action === "collect") {
        const user = getUser(userId);

        if (interaction.user.id !== userId) {
          return interaction.reply({ content: "❌ Not your game!", ephemeral: true });
        }

        const now = Date.now();
        const hoursPassed = (now - user.lastCollect) / (60 * 60 * 1000);
        const income = getTotalIncome(user);
        const earned = Math.floor(income * hoursPassed);

        if (earned <= 0) {
          return interaction.reply({ content: "⏰ No income yet! Wait a bit.", ephemeral: true });
        }

        user.coins += earned;
        user.totalEarned += earned;
        user.lastCollect = now;

        return interaction.reply({
          content: `💰 **+${formatNumber(earned)} coins collected!**\n💰 New balance: **${formatNumber(user.coins)}**`,
          ephemeral: true,
        });
      }

      // ===== TRAVEL =====
      if (action === "travel" && parts.length === 3) {
        const user = getUser(userId);
        return interaction.update(buildTravelPanel(user));
      }

      // ===== TRAVEL CONFIRM =====
      if (action === "travel" && parts.length === 4) {
        const cityId = parts[2];
        const user = getUser(userId);

        if (interaction.user.id !== userId) {
          return interaction.reply({ content: "❌ Not your game!", ephemeral: true });
        }

        if (!CITIES[cityId]) {
          return interaction.reply({ content: "❌ City not found!", ephemeral: true });
        }

        const cost = Math.floor(user.coins * 0.1);

        if (user.coins < cost) {
          return interaction.reply({ content: "❌ Not enough coins!", ephemeral: true });
        }

        user.coins -= cost;
        user.city = cityId;

        return interaction.update(buildMainPanel(user));
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
