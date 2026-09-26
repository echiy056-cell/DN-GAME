// ============================================
//   CANDY MATCH-3 GAME — 5x5
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

const fs = require("fs");
const path = require("path");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const CANDY_FILE = path.join(__dirname, "candy.json");

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;

const BOARD_SIZE = 5;
const POINTS_PER_MATCH = 10;

const EMOJIS = ["🍎", "🍋", "🍇", "🍊", "🍓"];

// ============================================
//   STORAGE
// ============================================
let candyData = {};
const candyGames = new Map();

function loadCandy() {
  try {
    if (fs.existsSync(CANDY_FILE)) {
      candyData = JSON.parse(fs.readFileSync(CANDY_FILE, "utf-8"));
      console.log(`🍬 Loaded ${Object.keys(candyData).length} candy users`);
    } else {
      candyData = {};
      console.log("🍬 Starting fresh");
    }
  } catch (err) {
    console.error("❌ Error loading candy:", err);
    candyData = {};
  }
}

function saveCandy() {
  try {
    fs.writeFileSync(CANDY_FILE, JSON.stringify(candyData, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Error saving candy:", err);
  }
}

function getUser(userId) {
  if (!candyData[userId]) {
    candyData[userId] = {
      username: "Unknown",
      bestScore: 0,
      totalScore: 0,
      gamesPlayed: 0,
      totalMatches: 0,
      bestCombo: 0,
    };
  }
  return candyData[userId];
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

function randomEmoji() {
  return EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
}

// ✅ Check VC
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

// ============================================
//   MATCH DETECTION
// ============================================
function findAllMatches(board) {
  const matches = [];

  // أفقي
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

  // عمودي
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

  // نحيّو المكرر
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

// ============================================
//   GRAVITY + REFILL
// ============================================
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

// ============================================
//   CASCADE
// ============================================
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
//   🍬 BUILD PANEL
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
      `🎯 **Points:** \`${game.score}\`\n` +
      `🔗 **Matches:** \`${game.totalMatches}\`\n` +
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
          .setCustomId(`candy_click_${r}_${c}`)
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

// ============================================
//   🎮 SETUP PANEL
// ============================================
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

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
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

// ============================================
//   🏆 LEADERBOARD
// ============================================
function buildLeaderboardContainer() {
  const entries = Object.entries(candyData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.bestScore - a.bestScore);

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
    const top = entries.slice(0, 10);
    let text = "";
    top.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      text += `${medal} <@${entry.id}> — 🎯 \`${entry.bestScore}\`\n`;
      text += `└ 🎮 \`${entry.gamesPlayed}\` • 🔗 \`${entry.totalMatches}\` • 🔥 \`x${entry.bestCombo}\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

// ============================================
//   🏁 END PANEL
// ============================================
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
      `🎯 **Final Score:** \`${game.score}\`\n` +
      `🔗 **Total Matches:** \`${game.totalMatches}\`\n` +
      `🔥 **Best Combo:** \`x${game.bestCombo}\`\n` +
      `🎮 **Moves:** \`${game.moves}\`\n\n` +
      (isNewBest
        ? `### 🏆 You beat your best score!`
        : `### Click **PLAY AGAIN** to start a new game`)
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
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
//   INIT
// ============================================
function init(client) {
  console.log("🍬 Initializing Candy Match-3 module...");

  loadCandy();

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      if (message.content === `${PREFIX}candy top`) {
        return message.channel.send({
          components: [buildLeaderboardContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (message.content === `${PREFIX}candy`) {
        // ✅ Check VC — اللي كتب الأمر
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Candy!");
        }

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
        // ✅ Check VC
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

        const user = getUser(player.id);
        user.username = player.username;
        user.gamesPlayed += 1;
        saveCandy();

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
        const r = parseInt(parts[2], 10);
        const c = parseInt(parts[3], 10);

        let game = null;
        for (const [gId, g] of candyGames.entries()) {
          if (g.channel.id === interaction.channel.id && g.playerId === interaction.user.id && g.phase === "play") {
            game = g;
            break;
          }
        }

        if (!game) {
          return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        }

        // ✅ Check VC — كي يكبس
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play!",
            ephemeral: true,
          });
        }

        if (!game.selected) {
          game.selected = { r, c };
          const container = buildCandyContainer(game);
          await interaction.update({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
          return;
        }

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

        const user = getUser(game.playerId);
        const isNewBest = game.score > user.bestScore;

        user.totalScore += game.score;
        user.totalMatches += game.totalMatches;
        if (game.bestCombo > user.bestCombo) user.bestCombo = game.bestCombo;
        if (isNewBest) user.bestScore = game.score;
        saveCandy();

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
