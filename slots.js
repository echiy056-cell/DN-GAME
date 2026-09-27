// ============================================
//   SLOT MACHINE GAME MODULE
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
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const SLOTS_FILE = path.join(__dirname, "slots.json");

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;
const COLOR_JACKPOT = 0xF1C40F;

// الإعدادات
const STARTING_COINS = 100;
const BET_AMOUNT = 10;
const DAILY_REWARD = 50;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000; // 24h

// الجوائز
const JACKPOT_REWARD = 500;  // 3 كيف
const DOUBLE_REWARD = 20;    // 2 كيف
const SINGLE_REWARD = 5;     // 1 كيف
const LOSS_AMOUNT = 10;      // 0 كيف

// 24 إيموجي — فواكه + نجوم + كنوز
const EMOJIS = [
  // 🍎 فواكه (8)
  "🍎", "🍋", "🍇", "🍊",
  "🍓", "🍒", "🍑", "🍍",
  
  // ⭐ نجوم (8)
  "⭐", "🌟", "✨", "💫",
  "💎", "💠", "🔷", "🔶",
  
  // 💰 كنوز (8)
  "💰", "💵", "🪙", "💴",
  "🎁", "🏆", "👑", "💍",
];

// ============================================
//   STORAGE
// ============================================
let slotsData = {};

function loadSlots() {
  try {
    if (fs.existsSync(SLOTS_FILE)) {
      slotsData = JSON.parse(fs.readFileSync(SLOTS_FILE, "utf-8"));
      console.log(`🎰 Loaded ${Object.keys(slotsData).length} slot users`);
    } else {
      slotsData = {};
      console.log("🎰 Starting fresh");
    }
  } catch (err) {
    console.error("❌ Error loading slots:", err);
    slotsData = {};
  }
}

function saveSlots() {
  try {
    fs.writeFileSync(SLOTS_FILE, JSON.stringify(slotsData, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Error saving slots:", err);
  }
}

function getUser(userId) {
  if (!slotsData[userId]) {
    slotsData[userId] = {
      username: "Unknown",
      coins: STARTING_COINS,
      totalSpins: 0,
      totalWins: 0,
      jackpots: 0,
      biggestWin: 0,
      lastDaily: 0,
    };
  }
  return slotsData[userId];
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
    if (!member) return false;
    if (!member.voice) return false;
    if (!member.voice.channel) return false;
    return true;
  } catch {
    return false;
  }
}

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

// ============================================
//   🎰 SPIN LOGIC
// ============================================
function spinSlots() {
  const result = [randomEmoji(), randomEmoji(), randomEmoji()];
  
  let reward = 0;
  let type = "loss";
  let message = "";

  // نعدّو كم إيموجي كيف كيف
  const counts = {};
  result.forEach(e => {
    counts[e] = (counts[e] || 0) + 1;
  });
  
  const maxCount = Math.max(...Object.values(counts));

  if (maxCount === 3) {
    // 🎉 JACKPOT — 3 كيف
    reward = JACKPOT_REWARD;
    type = "jackpot";
    message = "🎉🎉🎉 **JACKPOT!** 🎉🎉🎉";
  } else if (maxCount === 2) {
    // ✅ 2 كيف
    reward = DOUBLE_REWARD;
    type = "double";
    message = "✨ **Two match!** Nice!";
  } else {
    // ❌ 0 كيف
    reward = -LOSS_AMOUNT;
    type = "loss";
    message = "😢 **No match...**";
  }

  return { result, reward, type, message };
}

// ============================================
//   🎰 BUILD SLOT PANEL
// ============================================
function buildSlotContainer(user, spinResult = null, coinsLeft = null) {
  const container = new ContainerBuilder().setAccentColor(
    spinResult ? (
      spinResult.type === "jackpot" ? COLOR_JACKPOT :
      spinResult.type === "double" ? COLOR_WIN :
      COLOR_LOSE
    ) : COLOR_PLAY
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎰 Slot Machine")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // نتيجة الـspin ولا slot فارغ
  if (spinResult) {
    const r = spinResult.result;
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# ${r[0]}  ${r[1]}  ${r[2]}\n\n` +
        `${spinResult.message}`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );

    if (spinResult.reward > 0) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `💰 **+${formatNumber(spinResult.reward)} coins**`
        )
      );
    } else {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `💸 **${formatNumber(spinResult.reward)} coins**`
        )
      );
    }

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `# 🎰  ?  🎰\n\n` +
        `Click **SPIN** to play!`
      )
    );

    container.addSeparatorComponents(
      new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
    );
  }

  // Stats
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💰 **Coins:** \`${formatNumber(user.coins)}\`\n` +
      `🎯 **Total Spins:** \`${formatNumber(user.totalSpins)}\`\n` +
      `🏆 **Jackpots:** \`${formatNumber(user.jackpots)}\`\n` +
      `💎 **Biggest Win:** \`${formatNumber(user.biggestWin)}\`\n` +
      `🎲 **Cost per spin:** \`${BET_AMOUNT} coins\``
    )
  );

  // Buttons
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("slots_spin")
      .setLabel("🎰 SPIN")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(user.coins < BET_AMOUNT),
    new ButtonBuilder()
      .setCustomId("slots_daily")
      .setLabel("💰 DAILY")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("slots_top")
      .setLabel("🏆 TOP")
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
  const entries = Object.entries(slotsData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.coins - a.coins);

  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 Slot Machine — Leaderboard")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (entries.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No players yet. Use `.slots` to start!*")
    );
  } else {
    const top = entries.slice(0, 10);
    let text = "";
    top.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      text += `${medal} <@${entry.id}> — 💰 \`${formatNumber(entry.coins)}\`\n`;
      text += `└ 🎰 \`${entry.totalSpins}\` • 🏆 \`${entry.jackpots}\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

// ============================================
//   🏆 WINNER PANEL
// ============================================
function buildJackpotContainer(user, spinResult) {
  const container = new ContainerBuilder().setAccentColor(COLOR_JACKPOT);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎉🎉🎉 JACKPOT! 🎉🎉🎉")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `# ${spinResult.result[0]}  ${spinResult.result[1]}  ${spinResult.result[2]}\n\n` +
      `## 💰 +${formatNumber(JACKPOT_REWARD)} coins!`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💰 **Coins:** \`${formatNumber(user.coins)}\`\n` +
      `🏆 **Jackpots:** \`${formatNumber(user.jackpots)}\``
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("slots_spin")
      .setLabel("🎰 SPIN AGAIN")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎰 Initializing Slot Machine module...");

  loadSlots();

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .slots top =====
      if (message.content === `${PREFIX}slots top`) {
        return message.channel.send({
          components: [buildLeaderboardContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .slots =====
      if (message.content === `${PREFIX}slots`) {
        // ✅ VC Check
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Slots!");
        }

        const user = getUser(message.author.id);
        user.username = message.author.username;
        saveSlots();

        return message.channel.send({
          components: [buildSlotContainer(user)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

    } catch (err) {
      console.error("❌ Error in slots messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== SPIN =====
      if (id === "slots_spin") {
        // ✅ VC Check
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play!",
            ephemeral: true,
          });
        }

        const user = getUser(interaction.user.id);
        user.username = interaction.user.username;

        // Check coins
        if (user.coins < BET_AMOUNT) {
          return interaction.reply({
            content: `❌ You don't have enough coins!\n💰 You have: \`${user.coins}\` coins\n🎲 Need: \`${BET_AMOUNT}\` coins\n\nUse **💰 DAILY** to get free coins!`,
            ephemeral: true,
          });
        }

        // ننقصو الرهان
        user.coins -= BET_AMOUNT;
        user.totalSpins += 1;

        // نعملو الـspin
        const spinResult = spinSlots();

        // نضيفو الجائزة
        if (spinResult.reward > 0) {
          user.coins += spinResult.reward;
          user.totalWins += 1;

          if (spinResult.type === "jackpot") {
            user.jackpots += 1;
            if (spinResult.reward > user.biggestWin) {
              user.biggestWin = spinResult.reward;
            }
          }
        } else {
          // خسارة — الفلوس راحو (BET_AMOUNT + LOSS_AMOUNT)
          user.coins -= LOSS_AMOUNT;
        }

        // نتأكدو ما مشيش في السالب
        if (user.coins < 0) user.coins = 0;

        saveSlots();

        // نبنيو الـpanel
        const container = spinResult.type === "jackpot"
          ? buildJackpotContainer(user, spinResult)
          : buildSlotContainer(user, spinResult);

        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        // Log
        console.log(`🎰 ${interaction.user.username}: ${spinResult.result.join(" ")} → ${spinResult.type} (${spinResult.reward > 0 ? "+" : ""}${spinResult.reward})`);

        return;
      }

      // ===== DAILY =====
      if (id === "slots_daily") {
        // ✅ VC Check
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to claim daily!",
            ephemeral: true,
          });
        }

        const user = getUser(interaction.user.id);
        user.username = interaction.user.username;

        const now = Date.now();
        const timeSince = now - user.lastDaily;

        if (timeSince < DAILY_COOLDOWN) {
          const remaining = DAILY_COOLDOWN - timeSince;
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

          return interaction.reply({
            content: `⏰ You already claimed your daily reward!\n\n**Next reward in:** \`${hours}h ${minutes}m\``,
            ephemeral: true,
          });
        }

        user.coins += DAILY_REWARD;
        user.lastDaily = now;
        saveSlots();

        await interaction.reply({
          content: `💰 **+${DAILY_REWARD} coins!**\n\nTotal: \`${formatNumber(user.coins)}\` coins`,
          ephemeral: true,
        });

        // نحدّثو الـpanel
        const container = buildSlotContainer(user);
        try {
          await interaction.message.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch {}

        console.log(`💰 ${interaction.user.username} claimed daily: +${DAILY_REWARD}`);
        return;
      }

      // ===== TOP =====
      if (id === "slots_top") {
        // ✅ VC Check
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel**!",
            ephemeral: true,
          });
        }

        await interaction.reply({
          components: [buildLeaderboardContainer()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
      }

    } catch (err) {
      console.error("❌ Error in slots interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Slot Machine module ready!");
}

module.exports = { init };
