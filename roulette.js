// ============================================
//   ROULETTE CASINO MODULE
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ============================================
//   CONFIG
// ============================================
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";
const ROULETTE_FILE = path.join(__dirname, "roulette.json");

const COLOR_PLAY   = 0x5865F2;
const COLOR_WIN    = 0x57F287;
const COLOR_LOSE   = 0xED4245;
const COLOR_POINTS = 0xFEE75C;
const COLOR_RED    = 0xED4245;
const COLOR_BLACK  = 0x2C2F33;
const COLOR_GREEN  = 0x57F287;

// ✅ صور Win / Lose
const WIN_IMAGE  = "https://i.imgur.com/yIuZZFw.png";
const LOSE_IMAGE = "https://i.imgur.com/yIuZZFw.png";

// ✅ Admin IDs
const ADMIN_IDS = ["1522307310150750409"];

// الإعدادات
const STARTING_COINS = 100;
const DAILY_REWARD = 50;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const MAX_SPINS_PER_DAY = 5;
const MIN_BET = 10;
const MAX_BET = 1000;

// أرقام Rouge (European)
const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
];

const BLACK_NUMBERS = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
];

// ============================================
//   STORAGE
// ============================================
let rouletteData = {};

function loadRoulette() {
  try {
    if (fs.existsSync(ROULETTE_FILE)) {
      rouletteData = JSON.parse(fs.readFileSync(ROULETTE_FILE, "utf-8"));
      console.log(`🎰 Loaded ${Object.keys(rouletteData).length} roulette users`);
    } else {
      rouletteData = {};
      console.log("🎰 Roulette starting fresh");
    }
  } catch (err) {
    console.error("❌ Error loading roulette:", err);
    rouletteData = {};
  }
}

function saveRoulette() {
  try {
    fs.writeFileSync(ROULETTE_FILE, JSON.stringify(rouletteData, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Error saving roulette:", err);
  }
}

function getUser(userId) {
  if (!rouletteData[userId]) {
    rouletteData[userId] = {
      username: "Unknown",
      coins: STARTING_COINS,
      totalSpins: 0,
      totalWins: 0,
      biggestWin: 0,
      lastDaily: 0,
      spinsToday: 0,
      lastSpinDate: "",
      totalProfit: 0,
    };
  }
  return rouletteData[userId];
}

// ============================================
//   HELPERS
// ============================================
function addSignature(container) {
  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${SIGNATURE}`)
  );
  return container;
}

function isInVoice(member) {
  try {
    return !!(member && member.voice && member.voice.channel);
  } catch {
    return false;
  }
}

function isAdmin(userId) {
  return ADMIN_IDS.includes(userId);
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

function getTodayUTC() {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`;
}

function getTimeUntilReset() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0
  ));
  const diff = tomorrow - now;
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
}

function getNumberColor(num) {
  if (num === 0) return { emoji: "🟢", name: "GREEN", color: COLOR_GREEN };
  if (RED_NUMBERS.includes(num)) return { emoji: "🔴", name: "RED", color: COLOR_RED };
  return { emoji: "⚫", name: "BLACK", color: COLOR_BLACK };
}

// ============================================
//   🎰 ROULETTE LOGIC
// ============================================
function spinWheel() {
  return Math.floor(Math.random() * 37);
}

function parseBet(betType) {
  betType = betType.toLowerCase();

  const validBets = {
    red:     { name: "🔴 RED",      payout: 2,  type: "red" },
    black:   { name: "⚫ BLACK",    payout: 2,  type: "black" },
    even:    { name: "⚡ EVEN",      payout: 2,  type: "even" },
    odd:     { name: "🔢 ODD",       payout: 2,  type: "odd" },
    "1-18":  { name: "📊 1-18",      payout: 2,  type: "1-18" },
    "19-36": { name: "📊 19-36",     payout: 2,  type: "19-36" },
    doz1:    { name: "📊 1st 12",    payout: 3,  type: "doz1" },
    doz2:    { name: "📊 2nd 12",    payout: 3,  type: "doz2" },
    doz3:    { name: "📊 3rd 12",    payout: 3,  type: "doz3" },
    col1:    { name: "📊 Column 1",  payout: 3,  type: "col1" },
    col2:    { name: "📊 Column 2",  payout: 3,  type: "col2" },
    col3:    { name: "📊 Column 3",  payout: 3,  type: "col3" },
  };

  return validBets[betType] || null;
}

function checkWin(bet, winningNumber) {
  const num = winningNumber;
  const type = bet.type;

  if (type === "red")   return RED_NUMBERS.includes(num);
  if (type === "black") return BLACK_NUMBERS.includes(num);
  if (type === "even")  return num !== 0 && num % 2 === 0;
  if (type === "odd")   return num % 2 === 1;
  if (type === "1-18")  return num >= 1 && num <= 18;
  if (type === "19-36") return num >= 19 && num <= 36;
  if (type === "doz1")  return num >= 1 && num <= 12;
  if (type === "doz2")  return num >= 13 && num <= 24;
  if (type === "doz3")  return num >= 25 && num <= 36;
  if (type === "col1")  return num !== 0 && num % 3 === 1;
  if (type === "col2")  return num !== 0 && num % 3 === 2;
  if (type === "col3")  return num !== 0 && num % 3 === 0;
  if (type === "single") return num === bet.number;

  return false;
}

// ============================================
//   🎰 BUILD PANEL
// ============================================
function buildRouletteContainer(user) {
  const container = new ContainerBuilder().setAccentColor(COLOR_PLAY);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎰 Roulette Casino")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💰 **Coins:** \`${formatNumber(user.coins)}\`\n` +
      `🎯 **Spins Today:** \`${user.spinsToday}/${MAX_SPINS_PER_DAY}\`\n` +
      `🏆 **Total Wins:** \`${formatNumber(user.totalWins)}\`\n` +
      `💎 **Biggest Win:** \`${formatNumber(user.biggestWin)}\`\n` +
      `⏰ **Reset in:** \`${getTimeUntilReset()}\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 How to play:**\n\n` +
      `**Color bets:**\n` +
      `• \`.red 100\` — 🔴 Red (2x)\n` +
      `• \`.black 100\` — ⚫ Black (2x)\n` +
      `• \`.even 100\` — ⚡ Even (2x)\n` +
      `• \`.odd 100\` — 🔢 Odd (2x)\n` +
      `• \`.1-18 100\` — 📊 1-18 (2x)\n` +
      `• \`.19-36 100\` — 📊 19-36 (2x)\n\n` +
      `**Dozens & Columns:**\n` +
      `• \`.doz1 100\` — 1st 12 (3x)\n` +
      `• \`.col1 100\` — Column 1 (3x)\n\n` +
      `**Single number:**\n` +
      `• \`.1r100\` — 🎯 Number 1 (35x)\n` +
      `• \`.17r50\` — 🎯 Number 17 (35x)\n` +
      `• \`.0r100\` — 🟢 Number 0 (35x)`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("roulette_daily")
      .setLabel("💰 DAILY")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("roulette_top")
      .setLabel("🏆 TOP")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("roulette_stats")
      .setLabel("📊 STATS")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🏆 LEADERBOARD
// ============================================
function buildLeaderboardContainer() {
  const entries = Object.entries(rouletteData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.coins - a.coins);

  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 Roulette — Leaderboard")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (entries.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No players yet. Use `.roulette` to start!*")
    );
  } else {
    const top = entries.slice(0, 10);
    let text = "";
    top.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      text += `${medal} <@${entry.id}> — 💰 \`${formatNumber(entry.coins)}\`\n`;
      text += `└ 🎰 \`${entry.totalSpins}\` • 🏆 \`${entry.totalWins}\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

// ============================================
//   📊 STATS
// ============================================
function buildStatsContainer(user, target) {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  const winrate = user.totalSpins > 0
    ? Math.round((user.totalWins / user.totalSpins) * 100)
    : 0;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 📊 Stats — ${target.username}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💰 **Coins:** \`${formatNumber(user.coins)}\`\n` +
      `🎰 **Total Spins:** \`${formatNumber(user.totalSpins)}\`\n` +
      `🏆 **Total Wins:** \`${formatNumber(user.totalWins)}\`\n` +
      `📊 **Winrate:** \`${winrate}%\`\n` +
      `💎 **Biggest Win:** \`${formatNumber(user.biggestWin)}\`\n` +
      `💵 **Total Profit:** \`${formatNumber(user.totalProfit)}\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎰 RESULT PANEL (Win / Lose)
// ============================================
function buildResultContainer(user, bet, betAmount, winningNumber, won, payout, winner) {
  const numColor = getNumberColor(winningNumber);

  const container = new ContainerBuilder().setAccentColor(
    won ? COLOR_WIN : COLOR_LOSE
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      won
        ? `## 🎉 <@${winner.id}> WON!`
        : `## ❌ <@${winner.id}> LOST`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // ✅ Image (Win / Lose)
  try {
    const gallery = new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder().setURL(won ? WIN_IMAGE : LOSE_IMAGE)
    );
    container.addMediaGalleryComponents(gallery);
  } catch (err) {
    console.log("⚠️ MediaGallery failed:", err.message);
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# ${numColor.emoji} ${winningNumber} ${numColor.name}\n\n` +
      `**Your bet:** \`${bet.name}\` — \`${formatNumber(betAmount)}\` coins\n` +
      (won
        ? `💰 **Won:** \`+${formatNumber(payout)}\` coins (${bet.payout}x)`
        : `💸 **Lost:** \`-${formatNumber(betAmount)}\` coins`)
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💰 **New Balance:** \`${formatNumber(user.coins)}\`\n` +
      `🎯 **Spins Today:** \`${user.spinsToday}/${MAX_SPINS_PER_DAY}\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎯 PROCESS BET
// ============================================
async function processBet(client, message, betType, betAmount, isSingleNumber = false) {
  try {
    if (!isInVoice(message.member)) {
      return message.reply("❌ You must be in a **voice channel** to play Roulette!");
    }

    if (isNaN(betAmount) || betAmount < MIN_BET || betAmount > MAX_BET) {
      return message.reply(`❌ Bet amount must be between \`${MIN_BET}\` and \`${MAX_BET}\`!`);
    }

    let bet;
    if (isSingleNumber) {
      const num = parseInt(betType, 10);
      if (isNaN(num) || num < 0 || num > 36) {
        return message.reply("❌ Number must be between `0` and `36`!");
      }
      bet = { name: `🎯 Number ${num}`, payout: 35, type: "single", number: num };
    } else {
      bet = parseBet(betType);
      if (!bet) {
        return message.reply("❌ Invalid bet type! Use: `red`, `black`, `even`, `odd`, `1-18`, `19-36`, `doz1-3`, `col1-3`");
      }
    }

    const user = getUser(message.author.id);
    user.username = message.author.username;

    const today = getTodayUTC();
    if (user.lastSpinDate !== today) {
      user.spinsToday = 0;
      user.lastSpinDate = today;
    }

    if (user.spinsToday >= MAX_SPINS_PER_DAY) {
      return message.reply(
        `❌ You've used all your spins today!\n` +
        `🎯 Spins: \`${user.spinsToday}/${MAX_SPINS_PER_DAY}\`\n` +
        `⏰ Next reset in: \`${getTimeUntilReset()}\``
      );
    }

    if (user.coins < betAmount) {
      return message.reply(`❌ You don't have enough coins!\n💰 You have: \`${formatNumber(user.coins)}\``);
    }

    user.coins -= betAmount;
    user.spinsToday += 1;
    user.totalSpins += 1;

    const winningNumber = spinWheel();
    const won = checkWin(bet, winningNumber);

    let payout = 0;
    let netProfit = -betAmount;

    if (won) {
      payout = betAmount * bet.payout;
      user.coins += payout;
      user.totalWins += 1;

      if (payout > user.biggestWin) {
        user.biggestWin = payout;
      }

      netProfit = payout - betAmount;
    }

    user.totalProfit += netProfit;
    saveRoulette();

    const container = buildResultContainer(
      user, bet, betAmount, winningNumber, won, payout, message.author
    );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("roulette_daily")
        .setLabel("💰 DAILY")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("roulette_top")
        .setLabel("🏆 TOP")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("roulette_stats")
        .setLabel("📊 STATS")
        .setStyle(ButtonStyle.Secondary)
    );
    container.addActionRowComponents(row);

    await message.channel.send({
      content: `<@${message.author.id}>`,
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    console.log(`🎰 ${message.author.username}: ${bet.name} ${betAmount} → ${winningNumber} → ${won ? "WIN " + payout : "LOSE"}`);

  } catch (err) {
    console.error("❌ Error in processBet:", err);
  }
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎰 Initializing Roulette Casino module...");

  loadRoulette();

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.content.startsWith(".")) return;

      const content = message.content.trim();

      // ===== .roulette top =====
      if (content === ".roulette top") {
        return message.channel.send({
          components: [buildLeaderboardContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .roulette stats =====
      if (content === ".roulette stats") {
        const target = message.mentions.users.first() || message.author;
        const user = getUser(target.id);
        user.username = target.username;
        saveRoulette();

        return message.channel.send({
          components: [buildStatsContainer(user, target)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .roulette coins @user =====
      if (content.startsWith(".roulette coins")) {
        const target = message.mentions.users.first() || message.author;
        const user = getUser(target.id);
        user.username = target.username;
        saveRoulette();

        return message.reply({
          content: `💰 **${target.username}** has \`${formatNumber(user.coins)}\` coins`,
        });
      }

      // ============================================
      //   👑 ADMIN COMMANDS
      // ============================================

      // ===== ADMIN: .roulette give-all <amount> ===== 🆕
      if (content.startsWith(".roulette give-all")) {
        if (!isAdmin(message.author.id)) {
          return message.reply("❌ You don't have permission!");
        }

        const args = content.split(/\s+/);
        const amount = parseInt(args[2], 10);

        if (isNaN(amount) || amount <= 0) {
          return message.reply("❌ Usage: `.roulette give-all <amount>`");
        }

        let count = 0;
        for (const userId in rouletteData) {
          rouletteData[userId].coins += amount;
          count++;
        }
        saveRoulette();

        console.log(`👑 ${message.author.username} gave ${amount} coins to ALL ${count} users`);

        return message.reply({
          content: `✅ Gave **${formatNumber(amount)}** coins to **${count}** users!`,
        });
      }

      // ===== ADMIN: .roulette give @user <amount> =====
      if (content.startsWith(".roulette give")) {
        if (!isAdmin(message.author.id)) {
          return message.reply("❌ You don't have permission!");
        }

        const args = content.split(/\s+/);
        const target = message.mentions.users.first();
        const amount = parseInt(args[3], 10);

        if (!target || isNaN(amount) || amount <= 0) {
          return message.reply("❌ Usage: `.roulette give @user <amount>`");
        }

        const targetUser = getUser(target.id);
        targetUser.username = target.username;
        targetUser.coins += amount;
        saveRoulette();

        return message.reply(`✅ Gave **${formatNumber(amount)}** coins to <@${target.id}>\n💰 New balance: \`${formatNumber(targetUser.coins)}\``);
      }

      // ===== ADMIN: .roulette reset @user =====
      if (content.startsWith(".roulette reset")) {
        if (!isAdmin(message.author.id)) {
          return message.reply("❌ You don't have permission!");
        }

        const target = message.mentions.users.first();
        if (!target) {
          return message.reply("❌ Usage: `.roulette reset @user`");
        }

        const targetUser = getUser(target.id);
        targetUser.coins = STARTING_COINS;
        targetUser.spinsToday = 0;
        saveRoulette();

        return message.reply(`✅ Reset **${target.username}** to \`${STARTING_COINS}\` coins`);
      }

      // ===== .roulette (setup) =====
      if (content === ".roulette") {
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Roulette!");
        }

        const user = getUser(message.author.id);
        user.username = message.author.username;

        const today = getTodayUTC();
        if (user.lastSpinDate !== today) {
          user.spinsToday = 0;
          user.lastSpinDate = today;
        }

        saveRoulette();

        return message.channel.send({
          components: [buildRouletteContainer(user)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== SINGLE NUMBER: .1r100 =====
      const numberRegex = /^\.(\d{1,2})r(\d+)$/;
      const numberMatch = content.match(numberRegex);
      if (numberMatch) {
        const num = parseInt(numberMatch[1], 10);
        const amount = parseInt(numberMatch[2], 10);
        return processBet(client, message, String(num), amount, true);
      }

      // ===== .red 100 =====
      const betRegex = /^\.([a-z0-9\-]+)\s+(\d+)$/i;
      const betMatch = content.match(betRegex);
      if (betMatch) {
        const betType = betMatch[1].toLowerCase();
        const amount = parseInt(betMatch[2], 10);

        if (["roulette", "slots", "mw", "mrwhite", "xo", "trivia", "candy", "crash", "menu", "games", "help"].includes(betType)) {
          return;
        }

        return processBet(client, message, betType, amount, false);
      }

    } catch (err) {
      console.error("❌ Error in roulette messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== DAILY =====
      if (id === "roulette_daily") {
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel**!",
            ephemeral: true,
          });
        }

        const user = getUser(interaction.user.id);
        user.username = interaction.user.username;

        const now = Date.now();
        if (now - user.lastDaily < DAILY_COOLDOWN) {
          const remaining = DAILY_COOLDOWN - (now - user.lastDaily);
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

          return interaction.reply({
            content: `⏰ You already claimed!\n**Next in:** \`${hours}h ${minutes}m\``,
            ephemeral: true,
          });
        }

        user.coins += DAILY_REWARD;
        user.lastDaily = now;
        saveRoulette();

        await interaction.reply({
          content: `💰 **+${DAILY_REWARD} coins!**\nTotal: \`${formatNumber(user.coins)}\``,
          ephemeral: true,
        });

        return;
      }

      // ===== TOP =====
      if (id === "roulette_top") {
        await interaction.reply({
          components: [buildLeaderboardContainer()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
      }

      // ===== STATS =====
      if (id === "roulette_stats") {
        const user = getUser(interaction.user.id);
        user.username = interaction.user.username;
        saveRoulette();

        await interaction.reply({
          components: [buildStatsContainer(user, interaction.user)],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
      }

    } catch (err) {
      console.error("❌ Error in roulette interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Roulette Casino module ready!");
}

module.exports = { init };
