// ============================================
//   GAMES MENU MODULE — Menu + Buttons
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
//   🏠 MAIN MENU PANEL
// ============================================
function buildMainMenu(guild) {
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
      `**🎯 Choose a game to see its commands!**\n\n` +
      `🎮 **XO Game** — Classic XO with ranks\n` +
      `🎭 **Mr. White** — Social deduction game\n` +
      `🎮 **Crash Game** — Guess scrambled words\n` +
      `🧠 **Trivia Quiz** — Answer trivia questions`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // 🎯 الأزرار
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_xo`)
      .setLabel("🎮 XO Game")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`menu_mrwhite`)
      .setLabel("🎭 Mr. White")
      .setStyle(ButtonStyle.Secondary)
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_crash`)
      .setLabel("🎮 Crash Game")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`menu_trivia`)
      .setLabel("🧠 Trivia Quiz")
      .setStyle(ButtonStyle.Secondary)
  );

  container.addActionRowComponents(row1);
  container.addActionRowComponents(row2);

  addSignature(container);

  return container;
}

// ============================================
//   🎮 XO PANEL
// ============================================
function buildXoPanel(guild) {
  const container = new ContainerBuilder().setAccentColor(0x5865F2);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🎮 XO Game")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 Commands:**\n\n` +
      `**🎯 Challenge**\n` +
      `\`.xo @user\`\n` +
      `└ Challenge a player to XO\n\n` +
      `**🏆 Leaderboard**\n` +
      `\`.xo top\`\n` +
      `└ Show top 10 players\n\n` +
      `**📊 Stats**\n` +
      `\`.xo stats\`\n` +
      `└ Your personal stats\n\n` +
      `\`.xo stats @user\`\n` +
      `└ Other player's stats\n\n` +
      `**📇 Profile**\n` +
      `\`.xo profile\`\n` +
      `└ Your full profile\n\n` +
      `\`.xo profile @user\`\n` +
      `└ Other player's profile\n\n` +
      `**🎖️ Ranks**\n` +
      `\`.xo ranks\`\n` +
      `└ Show all ranks\n\n` +
      `**📖 Help**\n` +
      `\`.xo help\`\n` +
      `└ Show all commands`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_back`)
      .setLabel("↩️ Back")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🎭 MR WHITE PANEL
// ============================================
function buildMrWhitePanel(guild) {
  const container = new ContainerBuilder().setAccentColor(0x9B59B6);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🎭 Mr. White")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 Commands:**\n\n` +
      `**🎮 Start Game**\n` +
      `\`.mrwhite\`\n` +
      `└ Start a Mr. White game\n\n` +
      `\`.mw\`\n` +
      `└ Shortcut for .mrwhite\n\n` +
      `**📝 How to play:**\n` +
      `• All players get the same word\n` +
      `• Mr. White gets no word\n` +
      `• Each player describes with ONE word\n` +
      `• Vote to eliminate Mr. White\n` +
      `• Mr. White wins if he survives or guesses`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_back`)
      .setLabel("↩️ Back")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🎮 CRASH PANEL
// ============================================
function buildCrashPanel(guild) {
  const container = new ContainerBuilder().setAccentColor(0x5865F2);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🎮 Crash Game")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 Commands:**\n\n` +
      `**🎮 Start Game**\n` +
      `\`.crash\`\n` +
      `└ Start a Crash word game\n\n` +
      `**🏆 Leaderboard**\n` +
      `\`.crash top\`\n` +
      `└ Show top 10 players\n\n` +
      `**📊 Stats**\n` +
      `\`.crash stats\`\n` +
      `└ Your personal stats\n\n` +
      `**🎖️ Ranks**\n` +
      `\`.crash ranks\`\n` +
      `└ Show all ranks\n\n` +
      `**📝 How to play:**\n` +
      `• Bot gives you a scrambled word\n` +
      `• Rearrange the letters\n` +
      `• First to answer correctly → +1 point\n` +
      `• 10 words per game`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_back`)
      .setLabel("↩️ Back")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🧠 TRIVIA PANEL
// ============================================
function buildTriviaPanel(guild) {
  const container = new ContainerBuilder().setAccentColor(0x5865F2);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🧠 Trivia Quiz")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 Commands:**\n\n` +
      `**🎮 Start Game**\n` +
      `\`.trivia\`\n` +
      `└ Start a solo trivia game\n\n` +
      `**🏆 Leaderboard**\n` +
      `\`.trivia top\`\n` +
      `└ Show top 10 players\n\n` +
      `**📊 Stats**\n` +
      `\`.trivia stats\`\n` +
      `└ Your personal stats\n\n` +
      `**🎖️ Ranks**\n` +
      `\`.trivia ranks\`\n` +
      `└ Show all ranks\n\n` +
      `**📝 How to play:**\n` +
      `• 10 questions per game\n` +
      `• +1 point per correct answer\n` +
      `• Wrong answer → Game Over\n` +
      `• Question 10 is HARD\n` +
      `• +10 bonus for winning`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`menu_back`)
      .setLabel("↩️ Back")
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
        const container = buildMainMenu(message.guild);
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

      // ===== XO =====
      if (id === "menu_xo") {
        const container = buildXoPanel(interaction.guild);
        return interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== MR WHITE =====
      if (id === "menu_mrwhite") {
        const container = buildMrWhitePanel(interaction.guild);
        return interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== CRASH =====
      if (id === "menu_crash") {
        const container = buildCrashPanel(interaction.guild);
        return interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== TRIVIA =====
      if (id === "menu_trivia") {
        const container = buildTriviaPanel(interaction.guild);
        return interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== BACK =====
      if (id === "menu_back") {
        const container = buildMainMenu(interaction.guild);
        return interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
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
