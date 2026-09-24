// ============================================
//   ROULETTE GAME MODULE — مع Canvas
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
  EmbedBuilder,
  AttachmentBuilder,
  MessageFlags,
} = require("discord.js");

const { createCanvas, loadImage } = require("@napi-rs/canvas");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "𝐃𝐄𝐀𝐓𝐇 𝐍𝐎𝐓𝐄 𝐆𝐀𝐌𝐄 / 𝐃𝐄𝐕 𝐁𝐘 𝐀𝐅𝐆𝐇𝐀𝐍𝐈";

const WIN_IMAGE = "https://i.imgur.com/T4HW5tK.jpeg";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_START   = 0x57F287;
const COLOR_SPIN    = 0xFEE75C;
const COLOR_WIN     = 0x9B59B6;
const COLOR_PICK    = 0xED4245;

const MAX_PLAYERS = 25;

const PICK_MEMBER_TIMEOUT = 5 * 1000;   // 5 ثواني باش البوت يختار لاعب
const CHOOSE_TIMEOUT      = 30 * 1000;  // 30 ثانية للاختيار
const NEXT_ROUND_TIMEOUT  = 5 * 1000;   // 5 ثواني بين الجولات ✅

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
//   🎨 CANVAS — رسم عجلة اللاعبين
// ============================================
async function drawWheelImage(players) {
  const size = 800;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 80;
  const innerRadius = radius - 60;
  const centerRadius = 70;

  // ⚫ خلفية سوداء
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, size, size);

  // 🔴 الدائرة الخارجية الحمراء
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 30, 0, Math.PI * 2);
  ctx.fillStyle = "#0a0a0f";
  ctx.fill();
  ctx.strokeStyle = "#ED4245";
  ctx.lineWidth = 14;
  ctx.stroke();

  // توهج
  ctx.shadowColor = "#ED4245";
  ctx.shadowBlur = 30;
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 30, 0, Math.PI * 2);
  ctx.strokeStyle = "#ED4245";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // ⚫ الدائرة الداخلية
  ctx.beginPath();
  ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = "#2b2d31";
  ctx.lineWidth = 6;
  ctx.stroke();

  // 🎯 الدائرة المركزية
  ctx.beginPath();
  ctx.arc(cx, cy, centerRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#5865F2";
  ctx.fill();
  ctx.strokeStyle = "#ED4245";
  ctx.lineWidth = 5;
  ctx.stroke();

  // 🎰 شعار Discord
  try {
    const discordLogo = await loadImage(
      "https://cdn.discordapp.com/embed/avatars/0.png"
    );
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, centerRadius - 12, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(
      discordLogo,
      cx - centerRadius + 12,
      cy - centerRadius + 12,
      (centerRadius - 12) * 2,
      (centerRadius - 12) * 2
    );
    ctx.restore();
  } catch {}

  // 👥 Avatars اللاعبين
  const total = players.length;
  if (total === 0) {
    return canvas.toBuffer("image/png");
  }

  const angleStep = (Math.PI * 2) / total;
  const avatarRadius = 40;
  const avatarDistance = radius - 50;

  for (let i = 0; i < total; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const ax = cx + Math.cos(angle) * avatarDistance;
    const ay = cy + Math.sin(angle) * avatarDistance;

    try {
      const avatarUrl = players[i].avatar;
      const avatarImg = await loadImage(avatarUrl);

      ctx.save();
      ctx.beginPath();
      ctx.arc(ax, ay, avatarRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(
        avatarImg,
        ax - avatarRadius,
        ay - avatarRadius,
        avatarRadius * 2,
        avatarRadius * 2
      );
      ctx.restore();

      ctx.beginPath();
      ctx.arc(ax, ay, avatarRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4;
      ctx.stroke();

    } catch (err) {
      ctx.beginPath();
      ctx.arc(ax, ay, avatarRadius, 0, Math.PI * 2);
      ctx.fillStyle = "#2b2d31";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(players[i].username.charAt(0).toUpperCase(), ax, ay);
    }

    // Username
    const textY = ay + avatarRadius + 22;
    const text = players[i].username.slice(0, 12);

    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const metrics = ctx.measureText(text);
    const textWidth = metrics.width + 16;

    ctx.fillStyle = "#ED4245";
    ctx.fillRect(ax - textWidth / 2, textY - 10, textWidth, 20);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(text, ax, textY);
  }

  // 📢 عنوان في الأسفل
  ctx.fillStyle = "#ED4245";
  ctx.font = "bold 22px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("DEATH NOTE ROULETTE", cx, size - 25);

  return canvas.toBuffer("image/png");
}

// ============================================
//   🎨 CANVAS — رسم صورة الفائز مع Avatar
// ============================================
async function drawWinnerImage(winner) {
  // 1. نحمّلو الصورة الأصلية
  const bgImg = await loadImage(WIN_IMAGE);

  // 2. ناخذو الأبعاد
  const width = bgImg.width;
  const height = bgImg.height;

  // 3. نسويو canvas بنفس الأبعاد
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // 4. نرسمو الصورة الأصلية
  ctx.drawImage(bgImg, 0, 0, width, height);

  // 5. نحسبو موقع الـ avatar
  const avatarX = width * 0.5;
  const avatarY = height * 0.5;
  const avatarRadius = width * 0.08;

  // 6. نحمّلو الـ avatar
  try {
    const avatarImg = await loadImage(winner.avatar);

    // 7. نرسم الـ avatar (دائري)
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      avatarImg,
      avatarX - avatarRadius,
      avatarY - avatarRadius,
      avatarRadius * 2,
      avatarRadius * 2
    );
    ctx.restore();

    // 8. إطار للـ avatar
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.strokeStyle = "#ED4245";
    ctx.lineWidth = 6;
    ctx.stroke();

    // 9. توهج
    ctx.shadowColor = "#ED4245";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 3, 0, Math.PI * 2);
    ctx.strokeStyle = "#ED4245";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.shadowBlur = 0;

  } catch (err) {
    console.error("❌ Error drawing avatar:", err);
  }

  return canvas.toBuffer("image/png");
}

// ============================================
//   🎰 SETUP PANEL
// ============================================
function buildSetupContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_DEFAULT);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎰 Roulette Game")
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Host:** <@${game.hostId}>\n\n` +
      `**Players joined:** \`${game.players.length}/${MAX_PLAYERS}\`\n\n` +
      `**Click a number to join the game!**`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const buttonRows = buildGridButtons(game);
  buttonRows.forEach(row => container.addActionRowComponents(row));

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const startRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`roulette_start_${game.id}`)
      .setLabel("START")
      .setStyle(ButtonStyle.Success)
      .setDisabled(game.players.length < 2)
  );
  container.addActionRowComponents(startRow);

  addSignature(container);

  return container;
}

function buildGridButtons(game) {
  const rows = [];

  for (let r = 0; r < 5; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 5; c++) {
      const idx = r * 5 + c;
      const num = idx + 1;
      const player = game.players.find(p => p.cell === idx);

      if (player) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`roulette_cell_${game.id}_${idx}`)
            .setLabel(player.username.slice(0, 20))
            .setStyle(ButtonStyle.Primary)
            .setDisabled(true)
        );
      } else {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`roulette_cell_${game.id}_${idx}`)
            .setLabel(String(num))
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(false)
        );
      }
    }
    rows.push(row);
  }

  return rows;
}

// ============================================
//   🎡 SPIN PANEL
// ============================================
async function buildSpinEmbed(game) {
  const buffer = await drawWheelImage(game.players);
  const attachment = new AttachmentBuilder(buffer, { name: "wheel.png" });

  let playersText = "";
  game.players.forEach((p, i) => {
    playersText += `${i + 1}. <@${p.id}>\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_SPIN)
    .setTitle("🎡 Roulette — Spin the Wheel!")
    .setDescription(
      `**👥 Players:**\n${playersText}\n\n` +
      `**⏱️ Picking a player in 5 seconds...**`
    )
    .setImage("attachment://wheel.png")
    .setFooter({ text: SIGNATURE });

  return { embed, attachment };
}

// ============================================
//   🎯 PICK PANEL
// ============================================
function buildPickContainer(game, chosenPlayer) {
  const container = new ContainerBuilder().setAccentColor(COLOR_PICK);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎯 Choose a Player to Eliminate")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Selected player:** <@${chosenPlayer.id}>\n\n` +
      `**${chosenPlayer.username}**, choose who to eliminate!\n\n` +
      `**⏱️ You have 30 seconds**`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const buttons = [];
  game.players.forEach((p) => {
    if (p.id === chosenPlayer.id) return;
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`roulette_elim_${game.id}_${p.id}`)
        .setLabel(p.username.slice(0, 20))
        .setStyle(ButtonStyle.Danger)
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
//   🏆 WINNER EMBED — مع Avatar فوق الصورة
// ============================================
async function buildWinnerEmbed(game, winner) {
  const buffer = await drawWinnerImage(winner);
  const attachment = new AttachmentBuilder(buffer, { name: "winner.png" });

  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle("🏆 We have a WINNER!")
    .setDescription(
      `### 🎉 Congratulations <@${winner.id}>!\n\n` +
      `**You are the last one standing!**\n\n` +
      `**Username:** ${winner.username}`
    )
    .addFields(
      {
        name: "📊 Stats",
        value:
          `**Total players:** \`${game.players.length + game.eliminated.length}\`\n` +
          `**Eliminated:** \`${game.eliminated.length}\``,
      }
    )
    .setImage("attachment://winner.png")
    .setFooter({ text: SIGNATURE })
    .setTimestamp();

  return { embed, attachment };
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎰 Initializing Roulette module...");

  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.content.startsWith(`${PREFIX}roulette`)) return;

      const gameId = message.id;

      const game = {
        id: gameId,
        hostId: message.author.id,
        hostUser: message.author,
        players: [],
        eliminated: [],
        channel: message.channel,
        phase: "setup",
        messageId: null,
        currentChooser: null,
        pickTimer: null,
      };

      rouletteGames.set(gameId, game);

      const container = buildSetupContainer(game);

      const sent = await message.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });

      game.messageId = sent.id;

      console.log(`🎰 Roulette game created by ${message.author.username}`);

    } catch (err) {
      console.error("❌ Error in messageCreate:", err);
    }
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== CELL CLICK =====
      if (id.startsWith("roulette_cell_")) {
        const parts = id.split("_");
        const gameId = parts[2];
        const cellIdx = parseInt(parts[3], 10);
        const game = rouletteGames.get(gameId);

        if (!game) {
          return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        }
        if (game.phase !== "setup") {
          return interaction.reply({ content: "❌ Game already started.", ephemeral: true });
        }
        if (game.players.find(p => p.cell === cellIdx)) {
          return interaction.reply({ content: "❌ Slot taken.", ephemeral: true });
        }
        if (game.players.find(p => p.id === interaction.user.id)) {
          return interaction.reply({ content: "❌ Already joined.", ephemeral: true });
        }
        if (game.players.length >= MAX_PLAYERS) {
          return interaction.reply({ content: "❌ Game full.", ephemeral: true });
        }

        game.players.push({
          id: interaction.user.id,
          username: interaction.user.username,
          avatar: interaction.user.displayAvatarURL({ extension: "png", size: 128 }),
          cell: cellIdx,
        });

        const container = buildSetupContainer(game);
        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🎰 ${interaction.user.username} joined slot ${cellIdx + 1}`);
        return;
      }

      // ===== START =====
      if (id.startsWith("roulette_start_")) {
        const gameId = id.replace("roulette_start_", "");
        const game = rouletteGames.get(gameId);

        if (!game) {
          return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        }
        if (interaction.user.id !== game.hostId) {
          return interaction.reply({ content: "❌ Only host can start.", ephemeral: true });
        }
        if (game.players.length < 2) {
          return interaction.reply({ content: "❌ Need 2+ players.", ephemeral: true });
        }

        game.phase = "spin";

        const { embed, attachment } = await buildSpinEmbed(game);

        try { await interaction.message.delete(); } catch {}

        const newMsg = await interaction.channel.send({
          files: [attachment],
          embeds: [embed],
        });

        game.messageId = newMsg.id;

        console.log(`🎡 Game started with ${game.players.length} players`);

        // ⏱️ بعد 5 ثواني → البوت يختار لاعب
        setTimeout(() => startPickPhase(client, game), PICK_MEMBER_TIMEOUT);
        return;
      }

      // ===== ELIMINATE =====
      if (id.startsWith("roulette_elim_")) {
        const parts = id.split("_");
        const gameId = parts[2];
        const targetId = parts[3];
        const game = rouletteGames.get(gameId);

        if (!game) {
          return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        }
        if (interaction.user.id !== game.currentChooser) {
          return interaction.reply({ content: "❌ Not your turn.", ephemeral: true });
        }
        if (targetId === interaction.user.id) {
          return interaction.reply({ content: "❌ Can't eliminate yourself.", ephemeral: true });
        }

        if (game.pickTimer) {
          clearTimeout(game.pickTimer);
          game.pickTimer = null;
        }

        await eliminatePlayer(client, game, targetId);
        return;
      }

    } catch (err) {
      console.error("❌ Error in interactionCreate:", err);
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
//   🎯 PICK PHASE — البوت يختار لاعب عشوائي
// ============================================
async function startPickPhase(client, game) {
  try {
    if (game.players.length <= 1) {
      return finishGame(client, game);
    }

    // 🎲 نختارو لاعب عشوائي
    const randomPlayer = game.players[Math.floor(Math.random() * game.players.length)];
    game.currentChooser = randomPlayer.id;
    game.phase = "pick";

    const container = buildPickContainer(game, randomPlayer);

    try {
      const message = await game.channel.messages.fetch(game.messageId);
      await message.delete();
    } catch {}

    try {
      const newMsg = await game.channel.send({
        content: `<@${randomPlayer.id}>`,
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      game.messageId = newMsg.id;
    } catch (err) {
      console.error("❌ Error sending pick panel:", err);
    }

    console.log(`🎯 ${randomPlayer.username} is choosing...`);

    // ⏱️ 30 ثانية — كان ما اختارش، البوت يختار
    game.pickTimer = setTimeout(async () => {
      if (game.phase !== "pick") return;
      if (game.currentChooser !== randomPlayer.id) return;

      const others = game.players.filter(p => p.id !== randomPlayer.id);
      if (others.length === 0) return;

      const randomTarget = others[Math.floor(Math.random() * others.length)];

      console.log(`⏱️ Timeout — auto-eliminating ${randomTarget.username}`);

      await eliminatePlayer(client, game, randomTarget.id);

    }, CHOOSE_TIMEOUT);

  } catch (err) {
    console.error("❌ Error in startPickPhase:", err);
  }
}

// ============================================
//   ❌ ELIMINATE
// ============================================
async function eliminatePlayer(client, game, targetId) {
  try {
    const target = game.players.find(p => p.id === targetId);
    if (!target) return;

    game.players = game.players.filter(p => p.id !== targetId);
    game.eliminated.push(target);
    game.currentChooser = null;

    console.log(`❌ ${target.username} eliminated! Remaining: ${game.players.length}`);

    // نبعثو رسالة الإقصاء
    try {
      await game.channel.send({
        content: `❌ **<@${targetId}>** has been eliminated!`,
      });
    } catch {}

    // ⏱️ بعد 5 ثواني → نعاودو
    setTimeout(async () => {
      if (game.players.length <= 1) {
        return finishGame(client, game);
      }

      game.phase = "spin";

      const { embed, attachment } = await buildSpinEmbed(game);

      try {
        const message = await game.channel.messages.fetch(game.messageId);
        await message.delete();
      } catch {}

      try {
        const newMsg = await game.channel.send({
          files: [attachment],
          embeds: [embed],
        });
        game.messageId = newMsg.id;
      } catch {}

      // ⏱️ بعد 5 ثواني → نختارو لاعب جديد
      setTimeout(() => startPickPhase(client, game), PICK_MEMBER_TIMEOUT);

    }, NEXT_ROUND_TIMEOUT);

  } catch (err) {
    console.error("❌ Error in eliminatePlayer:", err);
  }
}

// ============================================
//   🏆 FINISH
// ============================================
async function finishGame(client, game) {
  try {
    game.phase = "done";

    const winner = game.players[0];
    if (!winner) return;

    const { embed, attachment } = await buildWinnerEmbed(game, winner);

    try {
      const message = await game.channel.messages.fetch(game.messageId);
      await message.delete();
    } catch {}

    try {
      await game.channel.send({
        content: `<@${winner.id}>`,
        files: [attachment],
        embeds: [embed],
      });
    } catch (err) {
      console.error("❌ Error sending winner:", err);
    }

    console.log(`🏆 Winner: ${winner.username}`);

    rouletteGames.delete(game.id);

  } catch (err) {
    console.error("❌ Error in finishGame:", err);
  }
}

module.exports = { init };
