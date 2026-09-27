// ============================================
//   GAMES MENU MODULE — With Buttons
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

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";
const COLOR_MENU = 0x9B59B6;

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

// ============================================
//   🎮 MAIN MENU PANEL
// ============================================
function buildGamesMenu(guild) {
  const container = new ContainerBuilder().setAccentColor(COLOR_MENU);

  const iconURL = guild && guild.iconURL()
    ? guild.iconURL({ extension: "png", size: 128 })
    : null;

  if (iconURL) {
    try {
      const section = new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent("# 🎮 Death Note Games")
        )
        .setThumbnailAccessory(
          new ThumbnailBuilder().setURL(iconURL)
        );
      container.addSectionComponents(section);
    } catch (err) {
      container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent("# 🎮 Death Note Games")
      );
    }
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("# 🎮 Death Note Games")
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎯 Choose a game from the buttons below**\n` +
      `Each game has its own commands.`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // 🎮 Row 1: XO, Mr. White, Crash
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_xo`)
      .setLabel("🎮 XO Game")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`menu_mrwhite`)
      .setLabel("🎭 Mr. White")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`menu_crash`)
      .setLabel("🎮 Crash")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row1);

  // 🎮 Row 2: Trivia, Candy, Slots
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_trivia`)
      .setLabel("🧠 Trivia Quiz")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`menu_candy`)
      .setLabel("🍬 Candy Match")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`menu_slots`)
      .setLabel("🎰 Slot Machine")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row2);

  // 🎮 Row 3: Roulette
  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_roulette`)         // 🆕
      .setLabel("🎡 Roulette Casino")        // 🆕
      .setStyle(ButtonStyle.Secondary)       // 🆕
  );
  container.addActionRowComponents(row3);

  addSignature(container);

  return container;
}

// ============================================
//   🎮 XO PANEL
// ============================================
function buildXoPanel() {
  const container = new ContainerBuilder().setAccentColor(0x5865F2);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 XO Game — Commands")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎮 Play:**\n` +
      "`.xo @user` — 🎮 Challenge a player\n\n" +
      `**📊 Stats:**\n` +
      "`.xo top` — 🏆 Leaderboard\n" +
      "`.xo stats` — 📊 Your stats\n\n" +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎭 MR WHITE PANEL
// ============================================
function buildMrWhitePanel() {
  const container = new ContainerBuilder().setAccentColor(0x9B59B6);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎭 Mr. White — Commands")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎮 Play:**\n` +
      "`.mrwhite` — 🎭 Start a game\n" +
      "`.mw` — 🎭 Shortcut\n\n" +
      `**📋 How to play:**\n` +
      `• All players get the **same word**\n` +
      `• **Mr. White** gets no word\n` +
      `• Ask questions in turns (60s each)\n` +
      `• Vote to eliminate Mr. White\n` +
      `• Mr. White wins if he survives OR guesses the word\n\n` +
      `**🎯 Minimum:** 4 players\n\n` +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎮 CRASH PANEL
// ============================================
function buildCrashPanel() {
  const container = new ContainerBuilder().setAccentColor(0x57F287);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 Crash Game — Commands")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎮 Play:**\n` +
      "`.crash` — 🎮 Start a game\n\n" +
      `**📊 Stats:**\n` +
      "`.crash top` — 🏆 Leaderboard\n" +
      "`.crash stats` — 📊 Your stats\n" +
      "`.crash ranks` — 🎖️ All ranks\n\n" +
      `**📋 How to play:**\n` +
      `• Solo or Multi (2-10 players)\n` +
      `• Bot gives you a **scrambled word**\n` +
      `• Rearrange the letters\n` +
      `• First to answer correctly → **+1 point**\n` +
      `• **10 words** per game\n\n` +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🧠 TRIVIA PANEL
// ============================================
function buildTriviaPanel() {
  const container = new ContainerBuilder().setAccentColor(0xFEE75C);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🧠 Trivia Quiz — Commands")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎮 Play:**\n` +
      "`.trivia` — 🧠 Start a game (Solo)\n\n" +
      `**📊 Stats:**\n` +
      "`.trivia top` — 🏆 Leaderboard\n" +
      "`.trivia stats` — 📊 Your stats\n" +
      "`.trivia ranks` — 🎖️ All ranks\n\n" +
      `**📋 How to play:**\n` +
      `• **10 questions** from 500 total\n` +
      `• 4 choices (A, B, C, D)\n` +
      `• **+1 point** per correct answer\n` +
      `• Question 10 is **HARD** (science/history)\n` +
      `• **+10 bonus points** for winning\n\n` +
      `**🎁 Power-ups (once each):**\n` +
      `• 🎯 50:50\n` +
      `• 🗳️ Vote\n\n` +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🍬 CANDY PANEL
// ============================================
function buildCandyPanel() {
  const container = new ContainerBuilder().setAccentColor(0xEB459E);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🍬 Candy Match-3 — Commands")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎮 Play:**\n` +
      "`.candy` — 🍬 Start a game\n\n" +
      `**📊 Stats:**\n` +
      "`.candy top` — 🏆 Leaderboard\n\n" +
      `**📋 How to play:**\n` +
      `• Click a candy, then click a **neighbor** to swap\n` +
      `• Match **3+ same candies** in a row/column\n` +
      `• Matched candies **disappear** + new ones fall\n` +
      `• **Combos** multiply your points! (x2, x3...)\n` +
      `• Click **🔚 END** when you're done\n\n` +
      `**🍎 Candies:** 🍎 🍋 🍇 🍊 🍓\n\n` +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎰 SLOTS PANEL
// ============================================
function buildSlotsPanel() {
  const container = new ContainerBuilder().setAccentColor(0xF1C40F);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎰 Slot Machine — Commands")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎮 Play:**\n` +
      "`.slots` — 🎰 Open the slot machine\n\n" +
      `**📊 Stats:**\n` +
      "`.slots top` — 🏆 Leaderboard\n" +
      "`.slots coins @user` — 💰 Check coins\n\n" +
      `**📋 How to play:**\n` +
      `• Click **🎰 SPIN** to play\n` +
      `• **3 same emojis** → 🎉 JACKPOT (+500 coins)\n` +
      `• **2 same emojis** → ✨ +20 coins\n` +
      `• **0 same emojis** → 💸 -10 coins\n` +
      `• Click **💰 DAILY** for 50 free coins (24h)\n\n` +
      `**💰 Starting coins:** 100\n` +
      `**🎲 Cost per spin:** 10 coins\n\n` +
      `**👑 Admin Commands:**\n` +
      "`.slots give @user <amount>` — Give coins\n" +
      "`.slots take @user <amount>` — Take coins\n" +
      "`.slots set @user <amount>` — Set coins\n" +
      "`.slots reset @user` — Reset to 100\n" +
      "`.slots reset-all` — Reset all users\n\n" +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎡 ROULETTE PANEL — 🆕
// ============================================
function buildRoulettePanel() {
  const container = new ContainerBuilder().setAccentColor(0xEB459E);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎡 Roulette Casino — Commands")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎮 Setup:**\n` +
      "`.roulette` — 🎡 Open the game\n\n" +
      `**📊 Stats:**\n` +
      "`.roulette top` — 🏆 Leaderboard\n" +
      "`.roulette stats` — 📊 Your stats\n" +
      "`.roulette coins @user` — 💰 Check coins\n" +
      "`.roulette daily` — 💰 Daily reward (50 coins)\n\n" +
      `**🎨 Color Bets (2x):**\n` +
      "`.red <amount>` — 🔴 Red\n" +
      "`.black <amount>` — ⚫ Black\n" +
      "`.even <amount>` — ⚡ Even\n" +
      "`.odd <amount>` — 🔢 Odd\n" +
      "`.1-18 <amount>` — 📊 1-18\n" +
      "`.19-36 <amount>` — 📊 19-36\n\n" +
      `**📊 Dozens & Columns (3x):**\n` +
      "`.doz1 <amount>` — 1st 12\n" +
      "`.doz2 <amount>` — 2nd 12\n" +
      "`.doz3 <amount>` — 3rd 12\n" +
      "`.col1 <amount>` — Column 1\n" +
      "`.col2 <amount>` — Column 2\n" +
      "`.col3 <amount>` — Column 3\n\n" +
      `**🎯 Single Numbers (35x):**\n` +
      "`.<number>r<amount>` — Example: `.17r100`\n\n" +
      `**📋 Rules:**\n` +
      `• **5 spins** per day\n` +
      `• **Reset** at midnight UTC\n` +
      `• **Min bet:** 10 coins\n` +
      `• **Max bet:** 1000 coins\n\n` +
      `**👑 Admin Commands:**\n` +
      "`.roulette give @user <amount>` — Give coins\n" +
      "`.roulette reset @user` — Reset to 100\n\n" +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("📋 Initializing Menu module...");

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      if (
        message.content === `${PREFIX}games` ||
        message.content === `${PREFIX}menu` ||
        message.content === `${PREFIX}help`
      ) {
        const container = buildGamesMenu(message.guild);
        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

    } catch (err) {
      console.error("❌ Error in menu messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      if (!id.startsWith("menu_")) return;

      // ===== XO =====
      if (id === "menu_xo") {
        return interaction.reply({
          components: [buildXoPanel()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== MR WHITE =====
      if (id === "menu_mrwhite") {
        return interaction.reply({
          components: [buildMrWhitePanel()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== CRASH =====
      if (id === "menu_crash") {
        return interaction.reply({
          components: [buildCrashPanel()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== TRIVIA =====
      if (id === "menu_trivia") {
        return interaction.reply({
          components: [buildTriviaPanel()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== CANDY =====
      if (id === "menu_candy") {
        return interaction.reply({
          components: [buildCandyPanel()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== SLOTS =====
      if (id === "menu_slots") {
        return interaction.reply({
          components: [buildSlotsPanel()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== ROULETTE — 🆕 =====
      if (id === "menu_roulette") {
        return interaction.reply({
          components: [buildRoulettePanel()],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

    } catch (err) {
      console.error("❌ Error in menu interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Menu module ready!");
}

module.exports = { init };
