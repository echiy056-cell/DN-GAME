// ============================================
//   CANDY MATCH-3 GAME — PostgreSQL
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

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;

const BOARD_SIZE = 5;
const POINTS_PER_MATCH = 10;

const EMOJIS = ["🍎", "🍋", "🍇", "🍊", "🍓"];

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

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

function formatNumber(n) {
  return n.toLocaleString("en-US");
}

// ============================================
//   BOARD GENERATION
// ============================================
function createBoard() {
  let board;
  let attempts = 0;

  do {
    board = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      board.push([]);
      for (let c = 0; c < BOARD_SIZE; c++) {
        let emoji;
        let safety = 0;
        do {
          emoji = randomEmoji();
          safety++;
        } while (
          safety < 50 &&
          (
            (c >= 2 && board[r][c - 1] === emoji && board[r][c - 2] === emoji) ||
            (r >= 2 && board[r - 1][c] === emoji && board[r - 2][c] === emoji)
          )
        );
        board[r].push(emoji);
      }
    }
    attempts++;
  } while (findAllMatches(board).length > 0 && attempts < 20);

  return board;
}

function findAllMatches(board) {
  const matches = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    let start = 0;
    for (let c = 1; c <= BOARD_SIZE; c++) {
      if (c < BOARD_SIZE && board[r][c] === board[r][start] && board[r][c] !== null) {
        continue;
      }
      const len = c - start;
      if (len >= 3 && board[r][start] !== null) {
        for (let i = start; i < c; i++) {
          matches.push({ r, c: i });
        }
      }
      start = c;
    }
  }

  for (let c = 0; c < BOARD_SIZE; c++) {
    let start = 0;
    for (let r = 1; r <= BOARD_SIZE; r++) {
      if (r < BOARD_SIZE && board[r][c] === board[start][c] && board[r][c] !== null) {
        continue;
      }
      const len = r - start;
      if (len >= 3 && board[start][c] !== null) {
        for (let i = start; i < r; i++) {
          matches.push({ r: i, c });
        }
      }
      start = r;
    }
  }

  const unique = [];
  const seen = new Set();
  for (const m of matches) {
    const key = `${m.r}_${m.c}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(m);
    }
  }

  return unique;
}

function applyGravity(board) {
  for (let c = 0; c < BOARD_SIZE; c++) {
    const column = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] !== null) {
        column.push(board[r][c]);
      }
    }

    const newColumn = [];
    const missing = BOARD_SIZE - column.length;
    for (let i = 0; i < missing; i++) {
      newColumn.push(randomEmoji());
    }
    for (const e of column) {
      newColumn.push(e);
    }

    for (let r = 0; r < BOARD_SIZE; r++) {
      board[r][c] = newColumn[r];
    }
  }
}

function processCascades(board, basePoints = POINTS_PER_MATCH) {
  let totalPoints = 0;
  let comboLevel = 1;
  let totalMatches = 0;
  let bestCombo = 0;
  let safety = 0;

  while (safety < 50) {
    safety++;
    const matches = findAllMatches(board);
    if (matches.length === 0) break;

    totalMatches += matches.length;
    const points = matches.length * basePoints * comboLevel;
    totalPoints += points;

    if (comboLevel > bestCombo) bestCombo = comboLevel;

    for (const m of matches) {
      board[m.r][m.c] = null;
    }

    applyGravity(board);
    comboLevel++;
  }

  return { totalPoints, totalMatches, bestCombo };
}

// ============================================
//   🍬 BUILD PANELS
// ============================================
function buildCandyContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_PLAY);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🍬 Candy Match-3")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎯 **Points:** \`${formatNumber(game.score)}\`\n` +
      `🔗 **Matches:** \`${formatNumber(game.totalMatches)}\`\n` +
      `🔥 **Best Combo:** \`x${game.bestCombo}\`\n` +
      `🎮 **Moves:** \`${game.moves}\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  for (let r = 0; r < BOARD_SIZE; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < BOARD_SIZE; c++) {
      const isSelected = game.selected && game.selected.r === r && game.selected.c === c;
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`candy_click_${game.id}_${r}_${c}`)
          .setLabel(game.board[r][c])
          .setStyle(isSelected ? ButtonStyle.Success : ButtonStyle.Secondary)
      );
    }
    container.addActionRowComponents(row);
  }

  const endRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`candy_end_${game.id}`)
      .setLabel("🔚 END GAME")
      .setStyle(ButtonStyle.Danger)
  );
  container.addActionRowComponents(endRow);

  addSignature(container);

  return container;
}

function buildSetupContainer() {
  const container = new ContainerBuilder().setAccentColor(COLOR_DEFAULT);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🍬 Candy Match-3")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 How to play:**\n` +
      `• Click a candy, then click a **neighbor** to swap\n` +
      `• Match **3+ same candies** in a row/column\n` +
      `• Matched candies **disappear** + new ones fall\n` +
      `• **Combos** multiply your points! (x2, x3...)\n` +
      `• Click **🔚 END** when you're done\n\n` +
      `**🎙️ You must be in a voice channel!**\n\n` +
      `**🍎 Candies:** ${EMOJIS.join(" ")}`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`candy_start`)
      .setLabel("🎮 START")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

function buildLeaderboardContainer(entries) {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 Candy Match-3 — Leaderboard")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (entries.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No players yet. Use `.candy` to start!*")
    );
  } else {
    let text = "";
    entries.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      text += `${medal} <@${entry.user_id}> — 🎯 \`${formatNumber(entry.best_score)}\`\n`;
      text += `└ 🎮 \`${entry.games_played}\` • 🔗 \`${entry.total_matches}\` • 🔥 \`x${entry.best_combo}\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

function buildEndContainer(game, isNewBest) {
  const container = new ContainerBuilder().setAccentColor(
    isNewBest ? COLOR_WIN : COLOR_LOSE
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      isNewBest ? "## 🏆 NEW BEST SCORE!" : "## 🎮 Game Ended"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎯 **Final Score:** \`${formatNumber(game.score)}\`\n` +
      `🔗 **Total Matches:** \`${formatNumber(game.totalMatches)}\`\n` +
      `🔥 **Best Combo:** \`x${game.bestCombo}\`\n` +
      `🎮 **Moves:** \`${game.moves}\`\n\n` +
      (isNewBest
        ? `### 🏆 You beat your best score!`
        : `### Click **PLAY AGAIN** to start a new game`)
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`candy_start`)
      .setLabel("🔄 PLAY AGAIN")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   STORAGE — Active Games
// ============================================
const candyGames = new Map();

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🍬 Initializing Candy Match-3 module...");

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .candy top =====
      if (message.content === ".candy top") {
        const entries = await database.getCandyLeaderboard(10);
        return message.channel.send({
          components: [buildLeaderboardContainer(entries)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .candy =====
      if (message.content === ".candy") {
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Candy!");
        }

        // ✅ نجيبو user من DB (باش نتأكدو موجود)
        await database.getCandyUser(message.author.id, message.author.username);

        return message.channel.send({
          components: [buildSetupContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

    } catch (err) {
      console.error("❌ Error in candy messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== START =====
      if (id === "candy_start") {
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play Candy!",
            ephemeral: true,
          });
        }

        const player = interaction.user;
        const gameId = `candy_${player.id}_${Date.now()}`;

        const game = {
          id: gameId,
          playerId: player.id,
          playerUser: player,
          channel: interaction.channel,
          board: createBoard(),
          selected: null,
          score: 0,
          totalMatches: 0,
          bestCombo: 0,
          moves: 0,
          phase: "play",
        };

        candyGames.set(gameId, game);

        // ✅ زيد عدد الألعاب في DB
        const user = await database.getCandyUser(player.id, player.username);
        if (user) {
          await database.updateCandyUser(player.id, {
            best_score: user.best_score,
            total_score: user.total_score,
            games_played: user.games_played + 1,
            total_matches: user.total_matches,
            best_combo: user.best_combo,
          });
        }

        const container = buildCandyContainer(game);

        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🍬 Game started by ${player.username}`);
        return;
      }

      // ===== CLICK CELL =====
      if (id.startsWith("candy_click_")) {
        const parts = id.split("_");
        const gameId = parts.slice(2, -2).join("_");
        const r = parseInt(parts[parts.length - 2], 10);
        const c = parseInt(parts[parts.length - 1], 10);

        const game = candyGames.get(gameId);
        if (!game) {
          return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        }

        if (interaction.user.id !== game.playerId) {
          return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        }

        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play!",
            ephemeral: true,
          });
        }

        // First click — select
        if (!game.selected) {
          game.selected = { r, c };
          const container = buildCandyContainer(game);
          await interaction.update({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
          return;
        }

        // Same cell — deselect
        if (game.selected.r === r && game.selected.c === c) {
          game.selected = null;
          const container = buildCandyContainer(game);
          await interaction.update({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
          return;
        }

        const dr = Math.abs(game.selected.r - r);
        const dc = Math.abs(game.selected.c - c);
        const isAdjacent = (dr === 1 && dc === 0) || (dr === 0 && dc === 1);

        if (!isAdjacent) {
          game.selected = { r, c };
          const container = buildCandyContainer(game);
          await interaction.update({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
          return;
        }

        // Swap
        const { r: r1, c: c1 } = game.selected;
        const temp = game.board[r1][c1];
        game.board[r1][c1] = game.board[r][c];
        game.board[r][c] = temp;

        game.selected = null;

        const matches = findAllMatches(game.board);

        if (matches.length === 0) {
          const temp2 = game.board[r1][c1];
          game.board[r1][c1] = game.board[r][c];
          game.board[r][c] = temp2;

          await interaction.reply({
            content: "❌ No match! Try another swap.",
            ephemeral: true,
          });
          return;
        }

        game.moves++;
        const result = processCascades(game.board, POINTS_PER_MATCH);
        game.score += result.totalPoints;
        game.totalMatches += result.totalMatches;
        if (result.bestCombo > game.bestCombo) game.bestCombo = result.bestCombo;

        const container = buildCandyContainer(game);
        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🍬 ${interaction.user.username}: +${result.totalPoints} points`);
        return;
      }

      // ===== END =====
      if (id.startsWith("candy_end_")) {
        const gameId = id.replace("candy_end_", "");
        const game = candyGames.get(gameId);

        if (!game) {
          return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        }
        if (interaction.user.id !== game.playerId) {
          return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        }

        // ✅ Save to DB
        const user = await database.getCandyUser(game.playerId, interaction.user.username);
        const isNewBest = game.score > (user?.best_score || 0);

        await database.updateCandyUser(game.playerId, {
          best_score: isNewBest ? game.score : user.best_score,
          total_score: (user.total_score || 0) + game.score,
          games_played: user.games_played,
          total_matches: (user.total_matches || 0) + game.totalMatches,
          best_combo: Math.max(user.best_combo || 0, game.bestCombo),
        });

        game.phase = "ended";
        candyGames.delete(gameId);

        const container = buildEndContainer(game, isNewBest);

        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🍬 Game ended: ${interaction.user.username} — Score: ${game.score}`);
        return;
      }

    } catch (err) {
      console.error("❌ Error in candy interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Candy Match-3 module ready!");
}

module.exports = { init };
