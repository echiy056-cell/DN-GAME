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
//   📖 MAIN MENU PANEL
// ============================================
function buildGamesMenu(guild) {
  const container = new ContainerBuilder().setAccentColor(COLOR_MENU);

  // 🖼️ Server Icon
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

  // 🎯 Game Buttons (4 buttons)
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

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_trivia`)
      .setLabel("🧠 Trivia Quiz")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row2);

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
      `**🎯 Play:**\n` +
      "`.xo @user` — 🎮 Challenge a player\n\n" +
      `**📊 Stats:**\n` +
      "`.xo top` — 🏆 Leaderboard\n" +
      "`.xo stats` — 📊 Your stats\n" +
      "`.xo stats @user` — 📊 Player stats\n" +
      "`.xo profile` — 📇 Your profile\n" +
      "`.xo profile @user` — 📇 Player profile\n\n" +
      `**🎖️ Ranks:**\n` +
      "`.xo ranks` — 🎖️ All ranks\n" +
      "`.xo help` — 📖 Help"
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
      `**🎯 Play:**\n` +
      "`.mrwhite` — 🎭 Start a game\n" +
      "`.mw` — 🎭 Shortcut\n\n" +
      `**📋 How to play:**\n` +
      `• All players get the **same word**\n` +
      `• **Mr. White** gets no word\n` +
      `• Each player describes with **ONE word**\n` +
      `• Vote to eliminate Mr. White\n` +
      `• **+10 points** if he's eliminated\n\n` +
      `**🎯 Minimum:** 4 players`
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
      `**🎯 Play:**\n` +
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
      `• **10 words** per game`
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
      `**🎯 Play:**\n` +
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
      `• 🗳️ Vote`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("📖 Initializing Menu module...");

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
        const container = buildXoPanel();
        return interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== MR WHITE =====
      if (id === "menu_mrwhite") {
        const container = buildMrWhitePanel();
        return interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== CRASH =====
      if (id === "menu_crash") {
        const container = buildCrashPanel();
        return interaction.reply({
          components: [container],
          flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
      }

      // ===== TRIVIA =====
      if (id === "menu_trivia") {
        const container = buildTriviaPanel();
        return interaction.reply({
          components: [container],
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
