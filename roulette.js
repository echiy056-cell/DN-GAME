// ============================================
//   ROULETTE CASINO MODULE — PostgreSQL
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
  SectionBuilder,
  ThumbnailBuilder,
  MessageFlags,
} = require("discord.js");

const database = require("./database");

// ============================================
//   CONFIG
// ============================================
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_PLAY   = 0x5865F2;
const COLOR_WIN    = 0x57F287;
const COLOR_LOSE   = 0xED4245;
const COLOR_POINTS = 0xFEE75C;
const COLOR_RED    = 0xED4245;
const COLOR_BLACK  = 0x2C2F33;
const COLOR_GREEN  = 0x57F287;

const WIN_IMAGE  = "https://i.imgur.com/yIuZZFw.png";
const LOSE_IMAGE = "https://i.imgur.com/yIuZZFw.png";

const ADMIN_IDS = ["1522307310150750409"];

const DAILY_REWARD = 50;
const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;
const MIN_BET = 10;

const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
];

const BLACK_NUMBERS = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
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

function formatNumber(n) {
  return n.toLocaleString("en-US");
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
//   🎰 BUILD PANELS
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
      `🎰 **Total Spins:** \`${formatNumber(user.total_spins)}\`\n` +
      `🏆 **Total Wins:** \`${formatNumber(user.total_wins)}\`\n` +
      `💎 **Biggest Win:** \`${formatNumber(user.biggest_win)}\``
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
      `• \`.0r100\` — 🟢 Number 0 (35x)\n\n` +
      `**🎲 All-in:**\n` +
      `• \`.red all\` — Bet ALL your coins!\n` +
      `• \`.17rall\` — All-in on number 17!`
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

function buildLeaderboardContainer(entries) {
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
    let text = "";
    entries.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      text += `${medal} <@${entry.user_id}> — 💰 \`${formatNumber(entry.coins)}\`\n`;
      text += `└ 🎰 \`${entry.total_spins}\` • 🏆 \`${entry.total_wins}\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

function buildStatsContainer(user, target) {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  const totalSpins = user.total_spins || 0;
  const totalWins = user.total_wins || 0;
  const winrate = totalSpins > 0 ? Math.round((totalWins / totalSpins) * 100) : 0;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 📊 Stats — ${target.username}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💰 **Coins:** \`${formatNumber(user.coins || 0)}\`\n` +
      `🎰 **Total Spins:** \`${formatNumber(totalSpins)}\`\n` +
      `🏆 **Total Wins:** \`${formatNumber(totalWins)}\`\n` +
      `📊 **Winrate:** \`${winrate}%\`\n` +
      `💎 **Biggest Win:** \`${formatNumber(user.biggest_win || 0)}\`\n` +
      `💵 **Total Profit:** \`${formatNumber(user.total_profit || 0)}\``
    )
  );

  addSignature(container);

  return container;
}

function buildResultContainer(user, bet, betAmount, winningNumber, won, payout, winner) {
  const numColor = getNumberColor(winningNumber);

  const container = new ContainerBuilder().setAccentColor(
    won ? COLOR_WIN : COLOR_LOSE
  );

  try {
    const section = new SectionBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `<@${winner.id}>\n## ${won ? "🎉 WON!" : "❌ LOST"}`
        )
      )
      .setThumbnailAccessory(
        new ThumbnailBuilder().setURL(won ? WIN_IMAGE : LOSE_IMAGE)
      );
    container.addSectionComponents(section);
  } catch (err) {
    console.log("⚠️ Section failed:", err.message);
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `<@${winner.id}>\n## ${won ? "🎉 WON!" : "❌ LOST"}`
      )
    );
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
      `💰 **New Balance:** \`${formatNumber(user.coins)}\``
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

    const user = await database.getRouletteUser(message.author.id, message.author.username);
    if (!user) {
      return message.reply("❌ Database error. Try again.");
    }

    // ✅ "all" → يراهن بكل coins
    if (betAmount === "all") {
      betAmount = user.coins;
      if (betAmount < MIN_BET) {
        return message.reply(`❌ You need at least \`${MIN_BET}\` coins to bet!`);
      }
    }

    if (isNaN(betAmount) || betAmount < MIN_BET) {
      return message.reply(`❌ Bet amount must be at least \`${MIN_BET}\`!`);
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

    if (user.coins < betAmount) {
      return message.reply(`❌ You don't have enough coins!\n💰 You have: \`${formatNumber(user.coins)}\``);
    }

    // ✅ Process
    const newCoins = user.coins - betAmount;
    const newSpins = user.total_spins + 1;

    const winningNumber = spinWheel();
    const won = checkWin(bet, winningNumber);

    let payout = 0;
    let netProfit = -betAmount;
    let newWins = user.total_wins;
    let newBiggestWin = user.biggest_win;
    let finalCoins = newCoins;

    if (won) {
      payout = betAmount * bet.payout;
      finalCoins = newCoins + payout;
      newWins = user.total_wins + 1;

      if (payout > newBiggestWin) {
        newBiggestWin = payout;
      }

      netProfit = payout - betAmount;
    }

    const newProfit = user.total_profit + netProfit;

    // ✅ Save to DB
    await database.updateRouletteUser(message.author.id, {
      coins: finalCoins,
      total_spins: newSpins,
      total_wins: newWins,
      biggest_win: newBiggestWin,
      last_daily: user.last_daily,
      total_profit: newProfit,
    });

    // ✅ Build container
    const updatedUser = {
      coins: finalCoins,
      total_spins: newSpins,
      total_wins: newWins,
      biggest_win: newBiggestWin,
      total_profit: newProfit,
    };

    const container = buildResultContainer(
      updatedUser, bet, betAmount, winningNumber, won, payout, message.author
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

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.content.startsWith(".")) return;

      const content = message.content.trim();

      // ===== .roulette top =====
      if (content === ".roulette top") {
        const entries = await database.getRouletteLeaderboard(10);
        return message.channel.send({
          components: [buildLeaderboardContainer(entries)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .roulette stats =====
      if (content === ".roulette stats") {
        const target = message.mentions.users.first() || message.author;
        const user = await database.getRouletteUser(target.id, target.username);
        if (!user) return message.reply("❌ User not found.");

        return message.channel.send({
          components: [buildStatsContainer(user, target)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .roulette coins @user =====
      if (content.startsWith(".roulette coins")) {
        const target = message.mentions.users.first() || message.author;
        const user = await database.getRouletteUser(target.id, target.username);

        return message.reply({
          content: `💰 **${target.username}** has \`${formatNumber(user?.coins || 0)}\` coins`,
        });
      }

      // ===== ADMIN: .roulette give-all <amount> =====
      if (content.startsWith(".roulette give-all")) {
        if (!isAdmin(message.author.id)) {
          return message.reply("❌ You don't have permission!");
        }

        const args = content.split(/\s+/);
        const amount = parseInt(args[2], 10);

        if (isNaN(amount) || amount <= 0) {
          return message.reply("❌ Usage: `.roulette give-all <amount>`");
        }

        const count = await database.giveAllRoulette(amount);
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

        const newBalance = await database.giveUserRoulette(target.id, amount, target.username);

        return message.reply(`✅ Gave **${formatNumber(amount)}** coins to <@${target.id}>\n💰 New balance: \`${formatNumber(newBalance)}\``);
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

        await database.resetUserRoulette(target.id);

        return message.reply(`✅ Reset **${target.username}** to \`100\` coins`);
      }

      // ===== .roulette (setup) =====
      if (content === ".roulette") {
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Roulette!");
        }

        const user = await database.getRouletteUser(message.author.id, message.author.username);
        if (!user) return message.reply("❌ Database error.");

        return message.channel.send({
          components: [buildRouletteContainer(user)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== SINGLE NUMBER: .17r100 ولا .17rall =====
      const numberRegex = /^\.(\d{1,2})r(all|\d+)$/i;
      const numberMatch = content.match(numberRegex);
      if (numberMatch) {
        const num = parseInt(numberMatch[1], 10);
        const amountArg = numberMatch[2].toLowerCase();

        let amount;
        if (amountArg === "all") {
          amount = "all";
        } else {
          amount = parseInt(amountArg, 10);
        }

        return processBet(client, message, String(num), amount, true);
      }

      // ===== .red 100 ولا .red all =====
      const betRegex = /^\.([a-z0-9\-]+)\s+(all|\d+)$/i;
      const betMatch = content.match(betRegex);
      if (betMatch) {
        const betType = betMatch[1].toLowerCase();
        const amountArg = betMatch[2].toLowerCase();

        if (["roulette", "slots", "mw", "mrwhite", "xo", "trivia", "candy", "crash", "menu", "games", "help"].includes(betType)) {
          return;
        }

        let amount;
        if (amountArg === "all") {
          amount = "all";
        } else {
          amount = parseInt(amountArg, 10);
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

        const user = await database.getRouletteUser(interaction.user.id, interaction.user.username);
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

        await database.updateRouletteUser(interaction.user.id, {
          coins: newCoins,
          total_spins: user.total_spins,
          total_wins: user.total_wins,
          biggest_win: user.biggest_win,
          last_daily: now,
          total_profit: user.total_profit,
        });

        await interaction.reply({
          content: `💰 **+${DAILY_REWARD} coins!**\nTotal: \`${formatNumber(newCoins)}\``,
          ephemeral: true,
        });

        return;
      }

      // ===== TOP =====
      if (id === "roulette_top") {
        const entries = await database.getRouletteLeaderboard(10);
        await interaction.reply({
          components: [buildLeaderboardContainer(entries)],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
        return;
      }

      // ===== STATS =====
      if (id === "roulette_stats") {
        const user = await database.getRouletteUser(interaction.user.id, interaction.user.username);
        if (!user) return interaction.reply({ content: "❌ DB error.", ephemeral: true });

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
