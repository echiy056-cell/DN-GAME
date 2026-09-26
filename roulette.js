// ============================================
//   ROULETTE GAME MODULE
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
  AttachmentBuilder,
  MessageFlags,
} = require("discord.js");

// ✅ بدلنا "canvas" بـ "@napi-rs/canvas"
const { createCanvas, loadImage } = require("@napi-rs/canvas");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_SPIN    = 0xFEE75C;

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 20;

const SPIN_DELAY = 10 * 1000;
const ELIMINATION_TIME = 30 * 1000;

const WHEEL_IMAGE = "https://i.imgur.com/AB9Uhzf.jpeg";

// ============================================
//   STORAGE
// ============================================
const rouletteGames = new Map();

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
//   🎡 GENERATE WHEEL IMAGE (Canvas)
// ============================================
async function generateWheelImage(players) {
  try {
    const wheelImage = await loadImage(WHEEL_IMAGE);

    const baseWidth = wheelImage.width;
    const baseHeight = wheelImage.height;

    const playerRowHeight = 120;
    const rows = Math.ceil(players.length / 5);
    const extraHeight = rows * playerRowHeight + 40;

    const canvasWidth = baseWidth;
    const canvasHeight = baseHeight + extraHeight;

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext("2d");

    // نرسمو الصورة الأساسية
    ctx.drawImage(wheelImage, 0, 0, baseWidth, baseHeight);

    // خلفية سوداء
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, baseHeight, canvasWidth, extraHeight);

    const playersPerRow = 5;
    const avatarSize = 70;

    for (let i = 0; i < players.length; i++) {
      const player = players[i];
      const row = Math.floor(i / playersPerRow);
      const col = i % playersPerRow;

      const cellWidth = canvasWidth / playersPerRow;
      const cellX = col * cellWidth + cellWidth / 2;
      const cellY = baseHeight + 40 + row * playerRowHeight;

      let avatarImg = null;
      try {
        const avatarURL = player.displayAvatarURL({
          extension: "png",
          size: 128,
          forceStatic: true,
        });
        avatarImg = await loadImage(avatarURL);
      } catch (err) {
        console.log(`❌ Failed to load avatar for ${player.username}`);
      }

      if (avatarImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cellX, cellY, avatarSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(
          avatarImg,
          cellX - avatarSize / 2,
          cellY - avatarSize / 2,
          avatarSize,
          avatarSize
        );
        ctx.restore();

        // border
        ctx.beginPath();
        ctx.arc(cellX, cellY, avatarSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "#57F287";
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // username
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";

      const username = player.username.length > 12
        ? player.username.slice(0, 12) + "..."
        : player.username;

      ctx.fillText(username, cellX, cellY + avatarSize / 2 + 8);
    }

    return canvas.toBuffer("image/png");

  } catch (err) {
    console.error("❌ Error generating wheel image:", err);
    return null;
  }
}

// ============================================
//   🎮 SETUP PANEL
// ============================================
function buildSetupContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_PLAY);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎡 Roulette Game")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Host:** <@${game.hostId}>\n` +
      `**Players:** \`${game.players.length}/${MAX_PLAYERS}\`\n` +
      `**Minimum:** \`${MIN_PLAYERS}\`\n\n` +
      `**📋 How to play:**\n` +
      `• Join the game with the button below\n` +
      `• Host starts the game\n` +
      `• The wheel spins — one player is chosen\n` +
      `• That player eliminates another one\n` +
      `• Last player standing wins! 🏆`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (game.players.length > 0) {
    let playersList = "";
    game.players.forEach((p, i) => {
      playersList += `${i + 1}. <@${p.id}>\n`;
    });
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(`**👥 Players:**\n${playersList}`)
    );
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No players yet...*")
    );
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`roulette_join_${game.id}`)
      .setLabel("✅ JOIN")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(game.players.length >= MAX_PLAYERS),
    new ButtonBuilder()
      .setCustomId(`roulette_leave_${game.id}`)
      .setLabel("❌ LEAVE")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`roulette_start_${game.id}`)
      .setLabel("🟢 START")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(game.players.length < MIN_PLAYERS)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🎡 SPIN PANEL
// ============================================
function buildSpinContainer(game, secondsLeft) {
  const container = new ContainerBuilder().setAccentColor(COLOR_SPIN);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎡 Spin the Wheel")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**⏱️ Spinning in:** \`${secondsLeft}s\`\n\n` +
      `**👥 Players:** \`${game.players.length}\`\n` +
      (game.eliminated.length > 0
        ? `**💀 Eliminated:** \`${game.eliminated.length}\`\n`
        : "")
    )
  );

  let playersText = "";
  game.players.forEach((p, i) => {
    playersText += `${i + 1}. <@${p.id}>\n`;
  });

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**Still in game:**\n${playersText}`)
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎯 ELIMINATION PANEL (ephemeral)
// ============================================
function buildEliminationContainer(game, chooser) {
  const container = new ContainerBuilder().setAccentColor(COLOR_LOSE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎯 Choose a Player to Eliminate")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**You were chosen by the wheel!**\n\n` +
      `Eliminate any player you want.\n` +
      `**⏱️ Time:** \`30 seconds\``
    )
  );

  const buttons = [];
  game.players.forEach((p) => {
    if (p.id === chooser.id) return;
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`roulette_elim_${game.id}_${p.id}`)
        .setLabel(p.username.slice(0, 20))
        .setStyle(ButtonStyle.Secondary)
    );
  });

  for (let i = 0; i < buttons.length; i += 5) {
    const row = new ActionRowBuilder();
    const chunk = buttons.slice(i, i + 5);
    chunk.forEach(b => row.addComponents(b));
    container.addActionRowComponents(row);
  }

  addSignature(container);

  return container;
}

// ============================================
//   🏆 WINNER PANEL
// ============================================
function buildWinnerContainer(game, winner) {
  const container = new ContainerBuilder().setAccentColor(COLOR_WIN);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 WINNER!")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎉 <@${winner.id}> is the **last player standing**!\n\n` +
      `**🎮 Total players:** \`${game.allPlayers.length}\`\n` +
      `**💀 Eliminated:** \`${game.eliminated.length}\`\n\n` +
      `**Eliminated players:**\n` +
      game.eliminated.map(e => `• <@${e.id}>`).join("\n")
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`roulette_restart`)
      .setLabel("🔄 PLAY AGAIN")
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
  console.log("🎡 Initializing Roulette module...");

  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      if (message.content === `${PREFIX}roulette`) {
        const gameId = message.id;

        const game = {
          id: gameId,
          hostId: message.author.id,
          hostUser: message.author,
          players: [],
          eliminated: [],
          allPlayers: [],
          channel: message.channel,
          messageId: null,
          phase: "setup",
          spinInterval: null,
          eliminationTimer: null,
        };

        rouletteGames.set(gameId, game);

        const container = buildSetupContainer(game);
        const sent = await message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        game.messageId = sent.id;

        console.log(`🎡 Roulette game created by ${message.author.username}`);
        return;
      }
    } catch (err) {
      console.error("❌ Error in roulette messageCreate:", err);
    }
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== JOIN =====
      if (id.startsWith("roulette_join_")) {
        const gameId = id.replace("roulette_join_", "");
        const game = rouletteGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (game.phase !== "setup") return interaction.reply({ content: "❌ Game already started.", ephemeral: true });
        if (game.players.find(p => p.id === interaction.user.id)) {
          return interaction.reply({ content: "❌ Already joined.", ephemeral: true });
        }
        if (game.players.length >= MAX_PLAYERS) {
          return interaction.reply({ content: `❌ Game full (${MAX_PLAYERS} max).`, ephemeral: true });
        }

        game.players.push({
          id: interaction.user.id,
          username: interaction.user.username,
          displayAvatarURL: (opts) => interaction.user.displayAvatarURL(opts),
        });

        const container = buildSetupContainer(game);
        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🎡 ${interaction.user.username} joined Roulette`);
        return;
      }

      // ===== LEAVE =====
      if (id.startsWith("roulette_leave_")) {
        const gameId = id.replace("roulette_leave_", "");
        const game = rouletteGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (game.phase !== "setup") return interaction.reply({ content: "❌ Game already started.", ephemeral: true });

        const playerIdx = game.players.findIndex(p => p.id === interaction.user.id);
        if (playerIdx === -1) {
          return interaction.reply({ content: "❌ You're not in the game.", ephemeral: true });
        }

        game.players.splice(playerIdx, 1);

        const container = buildSetupContainer(game);
        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🎡 ${interaction.user.username} left Roulette`);
        return;
      }

      // ===== START =====
      if (id.startsWith("roulette_start_")) {
        const gameId = id.replace("roulette_start_", "");
        const game = rouletteGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (interaction.user.id !== game.hostId) {
          return interaction.reply({ content: "❌ Only host can start.", ephemeral: true });
        }
        if (game.players.length < MIN_PLAYERS) {
          return interaction.reply({ content: `❌ Need at least ${MIN_PLAYERS} players.`, ephemeral: true });
        }

        game.phase = "spin";
        game.allPlayers = [...game.players];

        await interaction.deferUpdate().catch(() => {});

        await startSpinPhase(client, game);
        return;
      }

      // ===== ELIMINATION CHOICE =====
      if (id.startsWith("roulette_elim_")) {
        const parts = id.split("_");
        const gameId = parts[2];
        const targetId = parts[3];
        const game = rouletteGames.get(gameId);

        if (!game || game.phase !== "elimination") {
          return interaction.reply({ content: "❌ Not in elimination phase.", ephemeral: true });
        }
        if (interaction.user.id !== game.currentChooser.id) {
          return interaction.reply({ content: "❌ Not your turn to choose.", ephemeral: true });
        }

        if (game.eliminationTimer) clearTimeout(game.eliminationTimer);

        const target = game.players.find(p => p.id === targetId);
        if (!target) {
          return interaction.reply({ content: "❌ Player not found.", ephemeral: true });
        }

        game.players = game.players.filter(p => p.id !== targetId);
        game.eliminated.push(target);

        await interaction.deferUpdate().catch(() => {});

        // نعلنو في الشات العام
        try {
          await game.channel.send({
            content: `🎯 **<@${interaction.user.id}>** chose to eliminate **<@${targetId}>**!`,
          });
        } catch {}

        console.log(`🎯 ${interaction.user.username} eliminated ${target.username}`);

        // آخر واحد؟
        if (game.players.length === 1) {
          const winner = game.players[0];
          game.phase = "ended";

          try {
            const msg = await game.channel.messages.fetch(game.messageId);
            await msg.delete();
          } catch {}

          const winnerContainer = buildWinnerContainer(game, winner);
          const sent = await game.channel.send({
            components: [winnerContainer],
            flags: MessageFlags.IsComponentsV2,
          });
          game.messageId = sent.id;

          console.log(`🏆 Winner: ${winner.username}`);
          return;
        }

        // Spin جديد
        await startSpinPhase(client, game);
        return;
      }

      // ===== RESTART =====
      if (id === "roulette_restart") {
        return interaction.reply({
          content: "🎡 Use `.roulette` to start a new game!",
          ephemeral: true,
        });
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

  console.log("✅ Roulette module ready!");
}

// ============================================
//   🎡 START SPIN PHASE
// ============================================
async function startSpinPhase(client, game) {
  try {
    game.phase = "spin";

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const imageBuffer = await generateWheelImage(game.players);

    const container = buildSpinContainer(game, 10);

    if (imageBuffer) {
      const attachment = new AttachmentBuilder(imageBuffer, { name: "wheel.png" });
      const gallery = new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL("attachment://wheel.png")
      );
      container.addMediaGalleryComponents(gallery);

      const sent = await game.channel.send({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
      });
      game.messageId = sent.id;
    } else {
      const sent = await game.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      game.messageId = sent.id;
    }

    console.log(`🎡 Spin started (${game.players.length} players)`);

    let secondsLeft = 10;
    game.spinInterval = setInterval(async () => {
      secondsLeft--;

      if (secondsLeft <= 0) {
        clearInterval(game.spinInterval);
        game.spinInterval = null;
        await spinWheel(client, game);
        return;
      }

      try {
        const c = buildSpinContainer(game, secondsLeft);
        const msg = await game.channel.messages.fetch(game.messageId);
        await msg.edit({
          components: [c],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch {}
    }, 1000);

  } catch (err) {
    console.error("❌ Error in startSpinPhase:", err);
  }
}

// ============================================
//   🎲 SPIN THE WHEEL
// ============================================
async function spinWheel(client, game) {
  try {
    const randomIdx = Math.floor(Math.random() * game.players.length);
    const chooser = game.players[randomIdx];

    game.currentChooser = chooser;
    game.phase = "elimination";

    try {
      await game.channel.send({
        content: `🎡 **The wheel chose <@${chooser.id}>!**\nThey can now eliminate any player.`,
      });
    } catch {}

    try {
      const user = await client.users.fetch(chooser.id);
      const container = buildEliminationContainer(game, chooser);

      await user.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });

      console.log(`🎯 Elimination panel sent to ${chooser.username}`);
    } catch (err) {
      console.error("❌ Failed to send elimination DM:", err);

      try {
        const container = buildEliminationContainer(game, chooser);
        const msg = await game.channel.send({
          content: `<@${chooser.id}> — check the buttons below!`,
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        game.eliminationMessageId = msg.id;
      } catch (err2) {
        console.error("❌ Failed to send elimination panel in channel:", err2);
      }
    }

    game.eliminationTimer = setTimeout(async () => {
      if (game.phase !== "elimination") return;

      const targets = game.players.filter(p => p.id !== chooser.id);
      const randomTarget = targets[Math.floor(Math.random() * targets.length)];

      game.players = game.players.filter(p => p.id !== randomTarget.id);
      game.eliminated.push(randomTarget);

      try {
        await game.channel.send({
          content: `⏱️ Time's up! <@${chooser.id}> didn't choose. Random elimination: **<@${randomTarget.id}>**`,
        });
      } catch {}

      if (game.players.length === 1) {
        const winner = game.players[0];
        game.phase = "ended";

        const winnerContainer = buildWinnerContainer(game, winner);
        await game.channel.send({
          components: [winnerContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      await startSpinPhase(client, game);
    }, ELIMINATION_TIME);

  } catch (err) {
    console.error("❌ Error in spinWheel:", err);
  }
}

module.exports = { init };
