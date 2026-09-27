// ============================================
//   SLOT MACHINE GAME MODULE — PostgreSQL
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

const database = require("./database");

// ============================================
//   CONFIG
// ============================================
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;
const COLOR_JACKPOT = 0xF1C40F;

const ADMIN_IDS = ["1522307310150750409"];

const BET_AMOUNT = 10;
const DAILY_REWARD = 50;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

const JACKPOT_REWARD = 500;
const DOUBLE_REWARD = 20;
const LOSS_AMOUNT = 10;

// 24 إيموجي
const EMOJIS = [
  // 🍎 فواكه
  "🍎", "🍋", "🍇", "🍊",
  "🍓", "🍒", "🍑", "🍍",
  // ⭐ نجوم
  "⭐", "🌟", "✨", "💫",
  "💎", "💠", "🔷", "🔶",
  // 💰 كنوز
  "💰", "💵", "🪙", "💴",
  "🎁", "🏆", "👑", "💍",
];

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

  const counts = {};
  result.forEach(e => {
    counts[e] = (counts[e] || 0) + 1;
  });

  const maxCount = Math.max(...Object.values(counts));

  if (maxCount === 3) {
    reward = JACKPOT_REWARD;
    type = "jackpot";
    message = "🎉🎉🎉 **JACKPOT!** 🎉🎉🎉";
  } else if (maxCount === 2) {
    reward = DOUBLE_REWARD;
    type = "double";
    message = "✨ **Two match!** Nice!";
  } else {
    reward = -LOSS_AMOUNT;
    type = "loss";
    message = "😢 **No match...**";
  }

  return { result, reward, type, message };
}

// ============================================
//   🎰 BUILD PANELS
// ============================================
function buildSlotContainer(user, spinResult = null) {
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

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💰 **Coins:** \`${formatNumber(user.coins)}\`\n` +
      `🎯 **Total Spins:** \`${formatNumber(user.total_spins)}\`\n` +
      `🏆 **Jackpots:** \`${formatNumber(user.jackpots)}\`\n` +
      `💎 **Biggest Win:** \`${formatNumber(user.biggest_win)}\`\n` +
      `🎲 **Cost per spin:** \`${BET_AMOUNT} coins\``
    )
  );

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

function buildLeaderboardContainer(entries) {
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
    let text = "";
    entries.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      text += `${medal} <@${entry.user_id}> — 💰 \`${formatNumber(entry.coins)}\`\n`;
      text += `└ 🎰 \`${entry.total_spins}\` • 🏆 \`${entry.jackpots}\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

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

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .slots top =====
      if (message.content === ".slots top") {
        const entries = await database.getSlotsLeaderboard(10);
        return message.channel.send({
          components: [buildLeaderboardContainer(entries)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .slots coins @user =====
      if (message.content.startsWith(".slots coins")) {
        const target = message.mentions.users.first() || message.author;
        const user = await database.getSlotsUser(target.id, target.username);

        return message.reply({
          content: `💰 **${target.username}** has \`${formatNumber(user?.coins || 0)}\` coins`,
        });
      }

      // ===== ADMIN: .slots give-all <amount> =====
      if (message.content.startsWith(".slots give-all")) {
        if (!isAdmin(message.author.id)) {
          return message.reply("❌ You don't have permission!");
        }

        const args = message.content.split(/\s+/);
        const amount = parseInt(args[2], 10);

        if (isNaN(amount) || amount <= 0) {
          return message.reply("❌ Usage: `.slots give-all <amount>`");
        }

        const count = await database.giveAllSlots(amount);
        console.log(`👑 ${message.author.username} gave ${amount} coins to ALL ${count} users`);

        return message.reply(`✅ Gave **${formatNumber(amount)}** coins to **${count}** users!`);
      }

      // ===== ADMIN: .slots give @user <amount> =====
      if (message.content.startsWith(".slots give")) {
        if (!isAdmin(message.author.id)) {
          return message.reply("❌ You don't have permission!");
        }

        const args = message.content.split(/\s+/);
        const target = message.mentions.users.first();
        const amount = parseInt(args[3], 10);

        if (!target || isNaN(amount) || amount <= 0) {
          return message.reply("❌ Usage: `.slots give @user <amount>`");
        }

        const newBalance = await database.giveUserSlots(target.id, amount, target.username);

        return message.reply(`✅ Gave **${formatNumber(amount)}** coins to <@${target.id}>\n💰 New balance: \`${formatNumber(newBalance)}\``);
      }

      // ===== ADMIN: .slots reset @user =====
      if (message.content.startsWith(".slots reset")) {
        if (!isAdmin(message.author.id)) {
          return message.reply("❌ You don't have permission!");
        }

        const target = message.mentions.users.first();
        if (!target) {
          return message.reply("❌ Usage: `.slots reset @user`");
        }

        await database.resetUserSlots(target.id);

        return message.reply(`✅ Reset **${target.username}** to \`100\` coins`);
      }

      // ===== .slots =====
      if (message.content === ".slots") {
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Slots!");
        }

        const user = await database.getSlotsUser(message.author.id, message.author.username);
        if (!user) return message.reply("❌ Database error.");

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
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play!",
            ephemeral: true,
          });
        }

        const user = await database.getSlotsUser(interaction.user.id, interaction.user.username);
        if (!user) return interaction.reply({ content: "❌ DB error.", ephemeral: true });

        if (user.coins < BET_AMOUNT) {
          return interaction.reply({
            content: `❌ You don't have enough coins!\n💰 You have: \`${user.coins}\` coins\n🎲 Need: \`${BET_AMOUNT}\` coins\n\nUse **💰 DAILY** to get free coins!`,
            ephemeral: true,
          });
        }

        // ✅ Process
        let newCoins = user.coins - BET_AMOUNT;
        let newSpins = user.total_spins + 1;
        let newWins = user.total_wins;
        let newJackpots = user.jackpots;
        let newBiggestWin = user.biggest_win;

        const spinResult = spinSlots();

        if (spinResult.reward > 0) {
          newCoins += spinResult.reward;
          newWins += 1;

          if (spinResult.type === "jackpot") {
            newJackpots += 1;
            if (spinResult.reward > newBiggestWin) {
              newBiggestWin = spinResult.reward;
            }
          }
        } else {
          newCoins -= LOSS_AMOUNT;
        }

        if (newCoins < 0) newCoins = 0;

        // ✅ Save to DB
        await database.updateSlotsUser(interaction.user.id, {
          coins: newCoins,
          total_spins: newSpins,
          total_wins: newWins,
          jackpots: newJackpots,
          biggest_win: newBiggestWin,
          last_daily: user.last_daily,
        });

        // ✅ Build panel
        const updatedUser = {
          coins: newCoins,
          total_spins: newSpins,
          total_wins: newWins,
          jackpots: newJackpots,
          biggest_win: newBiggestWin,
        };

        const container = spinResult.type === "jackpot"
          ? buildJackpotContainer(updatedUser, spinResult)
          : buildSlotContainer(updatedUser, spinResult);

        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🎰 ${interaction.user.username}: ${spinResult.result.join(" ")} → ${spinResult.type} (${spinResult.reward > 0 ? "+" : ""}${spinResult.reward})`);
        return;
      }

      // ===== DAILY =====
      if (id === "slots_daily") {
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to claim daily!",
            ephemeral: true,
          });
        }

        const user = await database.getSlotsUser(interaction.user.id, interaction.user.username);
        if (!user) return interaction.reply({ content: "❌ DB error.", ephemeral: true });

        const now = Date.now();
        if (now - user.last_daily < DAILY_COOLDOWN) {
          const remaining = DAILY_COOLDOWN - (now - user.last_daily);
          const hours = Math.floor(remaining / (60 * 60 * 1000));
          const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

          return interaction.reply({
            content: `⏰ You already claimed!\n**Next in:** \`${hours}h ${minutes}m\``,
            ephemeral: true,
          });
        }

        const newCoins = user.coins + DAILY_REWARD;

        await database.updateSlotsUser(interaction.user.id, {
          coins: newCoins,
          total_spins: user.total_spins,
          total_wins: user.total_wins,
          jackpots: user.jackpots,
          biggest_win: user.biggest_win,
          last_daily: now,
        });

        await interaction.reply({
          content: `💰 **+${DAILY_REWARD} coins!**\nTotal: \`${formatNumber(newCoins)}\``,
          ephemeral: true,
        });

        // Update panel
        const updatedUser = {
          coins: newCoins,
          total_spins: user.total_spins,
          total_wins: user.total_wins,
          jackpots: user.jackpots,
          biggest_win: user.biggest_win,
        };

        const container = buildSlotContainer(updatedUser);
        try {
          await interaction.message.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch {}

        return;
      }

      // ===== TOP =====
      if (id === "slots_top") {
        const entries = await database.getSlotsLeaderboard(10);
        await interaction.reply({
          components: [buildLeaderboardContainer(entries)],
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
