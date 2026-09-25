// ============================================
//   GAMES MENU MODULE
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
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
//   📖 GAMES MENU PANEL
// ============================================
function buildGamesMenu(guild) {
  const container = new ContainerBuilder().setAccentColor(COLOR_MENU);

  // 🖼️ Avatar السيرفر في الأعلى
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

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("**Prefix:** `.`")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // 🎮 XO
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 XO Game")
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "`.xo @user`  `.xo top`  `.xo stats`\n" +
      "`.xo profile`  `.xo ranks`  `.xo help`"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // 🎭 Mr. White
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎭 Mr. White")
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "`.mrwhite`  `.mw`"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // 🎮 Crash Game
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 Crash Game")
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "`.crash`  `.crash top`  `.crash stats`  `.crash ranks`"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // 🧠 Trivia Quiz
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🧠 Trivia Quiz")
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "`.trivia`  `.trivia top`  `.trivia stats`  `.trivia ranks`"
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

  console.log("✅ Menu module ready!");
}

module.exports = { init };
