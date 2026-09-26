// ============================================
//   XO GAME MODULE — Tic Tac Toe
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

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_X       = 0x5865F2;
const COLOR_O       = 0xED4245;
const COLOR_WIN     = 0x57F287;
const COLOR_DRAW    = 0xFEE75C;

const X_EMOJI = "❌";
const O_EMOJI = "⭕";
const EMPTY_EMOJI = "⬜";

const XP_WIN = 10;
const XP_LOSS = 2;

// ============================================
//   STORAGE
// ============================================
const xoGames = new Map();

const stats = new Map();

function getStats(userId) {
  if (!stats.has(userId)) {
    stats.set(userId, {
      wins: 0,
      losses: 0,
      draws: 0,
      xp: 0,
      streak: 0,
      bestStreak: 0,
    });
  }
  return stats.get(userId);
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

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (board.every(cell => cell !== null)) {
    return "draw";
  }

  return null;
}

// ============================================
//   🎮 BUILD BOARD CONTAINER
// ============================================
function buildBoardContainer(game) {
  const container = new ContainerBuilder().setAccentColor(
    game.currentTurn === game.playerX.id ? COLOR_X : COLOR_O
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 Tic Tac Toe")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${X_EMOJI} **<@${game.playerX.id}>** (X)\n` +
      `${O_EMOJI} **<@${game.playerO.id}>** (O)\n\n` +
      `**🎯 Turn:** <@${game.currentTurn}>`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // 3 rows × 3 boutons
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const cell = game.board[idx];

      let label = EMPTY_EMOJI;
      let style = ButtonStyle.Secondary;
      let disabled = false;

      if (cell === "X") {
        label = X_EMOJI;
        style = ButtonStyle.Primary;
        disabled = true;
      } else if (cell === "O") {
        label = O_EMOJI;
        style = ButtonStyle.Danger;
        disabled = true;
      }

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`xo_click_${game.id}_${idx}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(disabled)
      );
    }
    container.addActionRowComponents(row);
  }

  addSignature(container);

  return container;
}

// ============================================
//   🏆 WIN CONTAINER
// ============================================
function buildWinnerContainer(game, winner) {
  const isDraw = winner === "draw";
  const winnerId = isDraw ? null : (winner === "X" ? game.playerX.id : game.playerO.id);

  const container = new ContainerBuilder().setAccentColor(
    isDraw ? COLOR_DRAW : COLOR_WIN
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      isDraw ? "## 🤝 Draw!" : "## 🏆 Winner!"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (isDraw) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Both players played well!\n\n` +
        `${X_EMOJI} <@${game.playerX.id}>\n` +
        `${O_EMOJI} <@${game.playerO.id}>`
      )
    );
  } else {
    const winnerEmoji = winner === "X" ? X_EMOJI : O_EMOJI;
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `${winnerEmoji} **<@${winnerId}>** wins!\n\n` +
        `**🎁 +${XP_WIN} XP**\n\n` +
        `**Opponent:** <@${winner === "X" ? game.playerO.id : game.playerX.id}>`
      )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // اللوحة النهائية
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const cell = game.board[idx];

      let label = EMPTY_EMOJI;
      let style = ButtonStyle.Secondary;

      if (cell === "X") {
        label = X_EMOJI;
        style = ButtonStyle.Primary;
      } else if (cell === "O") {
        label = O_EMOJI;
        style = ButtonStyle.Danger;
      }

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`xo_done_${idx}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(true)
      );
    }
    container.addActionRowComponents(row);
  }

  addSignature(container);

  return container;
}

// ============================================
//   📊 LEADERBOARD
// ============================================
function buildLeaderboardContainer() {
  const entries = [...stats.entries()]
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => b.xp - a.xp);

  const container = new ContainerBuilder().setAccentColor(COLOR_DEFAULT);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 XO — Leaderboard")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (entries.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No players yet. Use `.xo @user` to start!*")
    );
  } else {
    const top = entries.slice(0, 10);
    let text = "";
    top.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      const total = entry.wins + entry.losses + entry.draws;
      const winrate = total > 0 ? Math.round((entry.wins / total) * 100) : 0;
      text += `${medal} <@${entry.id}> — 🎯 \`${entry.xp} XP\`\n`;
      text += `└ ✅ \`${entry.wins}\` ❌ \`${entry.losses}\` 🤝 \`${entry.draws}\` • 📊 \`${winrate}%\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

// ============================================
//   📊 STATS
// ============================================
function buildStatsContainer(userId, user) {
  const s = getStats(userId);
  const total = s.wins + s.losses + s.draws;
  const winrate = total > 0 ? Math.round((s.wins / total) * 100) : 0;

  const container = new ContainerBuilder().setAccentColor(COLOR_DEFAULT);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 📊 Stats — ${user.username}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎯 **XP:** \`${s.xp}\`\n` +
      `🎮 **Games:** \`${total}\`\n` +
      `✅ **Wins:** \`${s.wins}\`\n` +
      `❌ **Losses:** \`${s.losses}\`\n` +
      `🤝 **Draws:** \`${s.draws}\`\n` +
      `📊 **Winrate:** \`${winrate}%\`\n` +
      `🔥 **Current Streak:** \`${s.streak}\`\n` +
      `🏆 **Best Streak:** \`${s.bestStreak}\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎮 Initializing XO module...");

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .xo top =====
      if (message.content === `${PREFIX}xo top`) {
        return message.channel.send({
          components: [buildLeaderboardContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .xo stats =====
      if (message.content === `${PREFIX}xo stats`) {
        return message.channel.send({
          components: [buildStatsContainer(message.author.id, message.author)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .xo @user =====
      if (message.content.startsWith(`${PREFIX}xo `)) {
        // ✅ Check VC — اللي كتب الأمر
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play XO!");
        }

        const mention = message.mentions.users.first();
        if (!mention) {
          return message.reply("❌ Mention a player to challenge! `.xo @user`");
        }
        if (mention.id === message.author.id) {
          return message.reply("❌ You can't challenge yourself!");
        }
        if (mention.bot) {
          return message.reply("❌ You can't challenge a bot!");
        }

        // ✅ Check VC — الـopponent
        const opponentMember = message.guild.members.cache.get(mention.id);
        if (!isInVoice(opponentMember)) {
          return message.reply(`❌ <@${mention.id}> must be in a **voice channel** too!`);
        }

        const gameId = `xo_${Date.now()}_${message.author.id}`;

        const game = {
          id: gameId,
          playerX: { id: message.author.id, username: message.author.username },
          playerO: { id: mention.id, username: mention.username },
          board: Array(9).fill(null),
          currentTurn: message.author.id,
          channel: message.channel,
          messageId: null,
          phase: "playing",
        };

        xoGames.set(gameId, game);

        const container = buildBoardContainer(game);
        const sent = await message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        game.messageId = sent.id;

        console.log(`🎮 XO game: ${game.playerX.username} vs ${game.playerO.username}`);
        return;
      }

    } catch (err) {
      console.error("❌ Error in xo messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== CLICK CELL =====
      if (id.startsWith("xo_click_")) {
        const parts = id.split("_");
        const gameId = parts[2] + "_" + parts[3] + "_" + parts[4];
        const idx = parseInt(parts[5], 10);

        // نلقاو اللعبة — بطريقة أسهل
        let game = null;
        for (const [gId, g] of xoGames.entries()) {
          if (g.messageId === interaction.message.id) {
            game = g;
            break;
          }
        }

        if (!game) {
          return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        }

        // ✅ Check player
        if (interaction.user.id !== game.playerX.id && interaction.user.id !== game.playerO.id) {
          return interaction.reply({ content: "❌ You're not in this game!", ephemeral: true });
        }

        // ✅ Check turn
        if (interaction.user.id !== game.currentTurn) {
          return interaction.reply({ content: "❌ It's not your turn!", ephemeral: true });
        }

        // ✅ Check cell
        if (game.board[idx] !== null) {
          return interaction.reply({ content: "❌ Cell already taken!", ephemeral: true });
        }

        // ✅ Check VC — اللي كبس
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play!",
            ephemeral: true,
          });
        }

        // نحدّدو الـsymbol
        const symbol = interaction.user.id === game.playerX.id ? "X" : "O";
        game.board[idx] = symbol;

        // نشوفو كان فمّا winner
        const winner = checkWinner(game.board);

        if (winner) {
          game.phase = "ended";

          // نسجلو الإحصائيات
          if (winner === "draw") {
            const sx = getStats(game.playerX.id);
            const so = getStats(game.playerO.id);
            sx.draws += 1;
            so.draws += 1;
          } else {
            const winnerId = winner === "X" ? game.playerX.id : game.playerO.id;
            const loserId = winner === "X" ? game.playerO.id : game.playerX.id;

            const sw = getStats(winnerId);
            const sl = getStats(loserId);

            sw.wins += 1;
            sw.xp += XP_WIN;
            sw.streak += 1;
            if (sw.streak > sw.bestStreak) sw.bestStreak = sw.streak;

            sl.losses += 1;
            sl.xp += XP_LOSS;
            sl.streak = 0;
          }

          const container = buildWinnerContainer(game, winner);
          await interaction.update({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });

          xoGames.delete(game.id);
          return;
        }

        // نبدلو الدور
        game.currentTurn = game.currentTurn === game.playerX.id
          ? game.playerO.id
          : game.playerX.id;

        const container = buildBoardContainer(game);
        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        return;
      }

    } catch (err) {
      console.error("❌ Error in xo interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ XO module ready!");
}

module.exports = { init };
