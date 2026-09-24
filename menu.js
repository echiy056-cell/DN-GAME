// ============================================
//   GAMES MENU MODULE
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MessageFlags,
} = require("discord.js");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "𝐃𝐄𝐀𝐓𝐇 𝐍𝐎𝐓𝐄 𝐆𝐀𝐌𝐄 / 𝐃𝐄𝐕 𝐁𝐘 𝐀𝐅𝐆𝐇𝐀𝐍𝐈";
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
function buildGamesMenu() {
  const container = new ContainerBuilder().setAccentColor(COLOR_MENU);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🎮 Death Note Games")
  );

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

  // 🎮 Word Crash
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 كلمات كراش")
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "`.crash`  `.crash top`  `.crash stats`  `.crash ranks`"
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
        const container = buildGamesMenu();
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
