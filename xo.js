// ============================================
//   XO GAME MODULE — كل شيء
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
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "𝐃𝐄𝐀𝐓𝐇 𝐍𝐎𝐓𝐄 𝐆𝐀𝐌𝐄 / 𝐃𝐄𝐕 𝐁𝐘 𝐀𝐅𝐆𝐇𝐀𝐍𝐈";

// 🖼️ GIFs
const CHALLENGE_GIF = "https://i.imgur.com/Jq2zgXl.gif";
const WIN_GIF       = "https://i.imgur.com/TX9WI9j.gif";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_TURN_X  = 0x5865F2;
const COLOR_TURN_O  = 0xED4245;
const COLOR_WIN     = 0x57F287;
const COLOR_TIMEOUT = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;
const COLOR_PROFILE = 0x9B59B6;

const CHALLENGE_TIMEOUT_SEC = 60;
const TURN_TIMEOUT_SEC      = 10;

const POINTS_FILE = path.join(__dirname, "points.json");

// ============================================
//   RANKS
// ============================================
const RANKS = [
  { name: "Legend",      emoji: "🏆", min: 200, label: "𝐋𝐄𝐆𝐄𝐍𝐃" },
  { name: "Grandmaster", emoji: "👑", min: 120, label: "𝐆𝐑𝐀𝐍𝐃𝐌𝐀𝐒𝐓𝐄𝐑" },
  { name: "Master",      emoji: "🔮", min: 80,  label: "𝐌𝐀𝐒𝐓𝐄𝐑" },
  { name: "Diamond",     emoji: "💠", min: 50,  label: "𝐃𝐈𝐀𝐌𝐎𝐍𝐃" },
  { name: "Platinum",    emoji: "💎", min: 30,  label: "𝐏𝐋𝐀𝐓𝐈𝐍𝐔𝐌" },
  { name: "Gold",        emoji: "🟡", min: 15,  label: "𝐆𝐎𝐋𝐃" },
  { name: "Silver",      emoji: "⚪", min: 5,   label: "𝐒𝐈𝐋𝐕𝐄𝐑" },
  { name: "Bronze",      emoji: "🟤", min: 0,   label: "𝐁𝐑𝐎𝐍𝐙𝐄" },
];

function getRank(points) {
  for (const rank of RANKS) {
    if (points >= rank.min) return rank;
  }
  return RANKS[RANKS.length - 1];
}

function getNextRank(points) {
  for (let i = 0; i < RANKS.length; i++) {
    if (points < RANKS[i].min) return RANKS[i];
  }
  return null;
}

function getRankProgress(points) {
  const currentRank = getRank(points);
  const nextRank = getNextRank(points);

  if (!nextRank) {
    return { bar: "█".repeat(15), text: "Top rank! 🏆", percent: 100 };
  }

  const currentMin = currentRank.min;
  const nextMin = nextRank.min;
  const range = nextMin - currentMin;
  const progress = points - currentMin;
  const percent = Math.round((progress / range) * 100);
  const barLength = 15;
  const filled = Math.round((progress / range) * barLength);
  const bar = "█".repeat(filled) + "░".repeat(barLength - filled);

  return { bar, text: `${points} / ${nextMin} points (${percent}%)`, percent };
}

// ============================================
//   POINTS STORAGE
// ============================================
let pointsData = {};

function loadPoints() {
  try {
    if (fs.existsSync(POINTS_FILE)) {
      const raw = fs.readFileSync(POINTS_FILE, "utf-8");
      pointsData = JSON.parse(raw);

      for (const userId in pointsData) {
        if (pointsData[userId].bestStreak === undefined) {
          pointsData[userId].bestStreak = 0;
        }
        if (pointsData[userId].currentStreak === undefined) {
          pointsData[userId].currentStreak = 0;
        }
      }
      console.log(`💾 Loaded ${Object.keys(pointsData).length} users`);
    } else {
      pointsData = {};
      console.log("💾 Starting fresh (no points file)");
    }
  } catch (err) {
    console.error("❌ Error loading points:", err);
    pointsData = {};
  }
}

function savePoints() {
  try {
    fs.writeFileSync(POINTS_FILE, JSON.stringify(pointsData, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Error saving points:", err);
  }
}

function getUserPoints(userId) {
  if (!pointsData[userId]) {
    pointsData[userId] = {
      username: "Unknown",
      wins: 0,
      losses: 0,
      draws: 0,
      points: 0,
      bestStreak: 0,
      currentStreak: 0,
    };
  }
  return pointsData[userId];
}

function registerWin(userId, username) {
  const data = getUserPoints(userId);
  data.username = username;
  data.wins += 1;
  data.currentStreak += 1;
  if (data.currentStreak > data.bestStreak) {
    data.bestStreak = data.currentStreak;
  }
  data.points = data.wins - data.losses;
  savePoints();
  return data;
}

function registerLoss(userId, username) {
  const data = getUserPoints(userId);
  data.username = username;
  data.losses += 1;
  data.currentStreak = 0;
  data.points = data.wins - data.losses;
  savePoints();
  return data;
}

function registerDraw(userId, username) {
  const data = getUserPoints(userId);
  data.username = username;
  data.draws += 1;
  data.points = data.wins - data.losses;
  savePoints();
  return data;
}

// ============================================
//   GAME LOGIC
// ============================================
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function checkWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] };
    }
  }
  if (board.every(c => c !== null)) return { winner: "draw" };
  return null;
}

function emptyBoard() {
  return Array(9).fill(null);
}

function progressBar(current, total, length = 10) {
  const filled = Math.round((current / total) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

// ============================================
//   STORAGE
// ============================================
const games = new Map();
const challengeTimers = new Map();
const turnTimers = new Map();

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
//   🎮 BUTTONS — X أزرق، O أحمر، فارغ رمادي
// ============================================
function buildButtonRows(game, forceDisabled = false) {
  const rows = [];
  for (let r = 0; r < 3; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 3; c++) {
      const idx = r * 3 + c;
      const v = game.board[idx];

      let label, style, isDisabled;

      if (v === "X") {
        label = "X";
        style = ButtonStyle.Primary;
        isDisabled = true;
      } else if (v === "O") {
        label = "O";
        style = ButtonStyle.Danger;
        isDisabled = true;
      } else {
        label = "\u200B";
        style = ButtonStyle.Secondary;
        isDisabled = false;
      }

      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`xo_${game.id}_${idx}`)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(isDisabled || forceDisabled)
      );
    }
    rows.push(row);
  }
  return rows;
}

// ============================================
//   ⚔️ CHALLENGE EMBED — Mentions في الأسماء فقط
// ============================================
function buildChallengeEmbed(challengerUser, targetUser, secondsLeft = CHALLENGE_TIMEOUT_SEC) {
  const bar = progressBar(secondsLeft, CHALLENGE_TIMEOUT_SEC, 15);
  let timeEmoji = "🟢";
  if (secondsLeft <= 10) timeEmoji = "🔴";
  else if (secondsLeft <= 25) timeEmoji = "🟡";

  const challengerAvatar = challengerUser.displayAvatarURL({ extension: "png", size: 64 });
  const targetAvatar = targetUser.displayAvatarURL({ extension: "png", size: 64 });

  const embed = new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setAuthor({
      name: `${challengerUser.username} — Challenger`,
      iconURL: challengerAvatar,
    })
    .setThumbnail(targetAvatar)
    .setTitle("⚔️ New Challenge — XO")
    // Description: بلا mention (نص عادي)
    .setDescription(
      `${challengerUser.username} **challenged** ${targetUser.username} to a game of XO!\n\n` +
      `**Do you accept?**`
    )
    // Fields: مع mention
    .addFields(
      {
        name: "Challenger",
        value: `<@${challengerUser.id}>`,
        inline: true,
      },
      {
        name: "Opponent",
        value: `<@${targetUser.id}>`,
        inline: true,
      }
    )
    .addFields({
      name: "⏱️ Time Left",
      value: `${timeEmoji} \`${secondsLeft}s\`\n\`${bar}\``,
    })
    .setImage(CHALLENGE_GIF)
    .setFooter({ text: SIGNATURE });

  return embed;
}

function buildChallengeButtons(challengerId, targetId, disabled = false) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`acc_${challengerId}_${targetId}`)
      .setLabel("Accept")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId(`ref_${challengerId}_${targetId}`)
      .setLabel("Refuse")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled)
  );
  return [row];
}

// ============================================
//   ⏱️ CHALLENGE TIMEOUT EMBED
// ============================================
function buildChallengeTimeoutEmbed(challengerUser, targetUser) {
  const challengerAvatar = challengerUser.displayAvatarURL({ extension: "png", size: 64 });
  const targetAvatar = targetUser.displayAvatarURL({ extension: "png", size: 64 });

  return new EmbedBuilder()
    .setColor(COLOR_TIMEOUT)
    .setAuthor({
      name: `${challengerUser.username} — Challenger`,
      iconURL: challengerAvatar,
    })
    .setThumbnail(targetAvatar)
    .setTitle("⏱️ Challenge Timed Out!")
    // Description: بلا mention
    .setDescription(`${targetUser.username} didn't respond in time.`)
    // Fields: مع mention
    .addFields(
      {
        name: "Challenger",
        value: `<@${challengerUser.id}>`,
        inline: true,
      },
      {
        name: "Opponent",
        value: `<@${targetUser.id}>`,
        inline: true,
      }
    )
    .setFooter({ text: SIGNATURE })
    .setTimestamp();
}

// ============================================
//   🎮 GAME PANEL (V2)
// ============================================
function buildGameContainer(game, secondsLeft = TURN_TIMEOUT_SEC) {
  const turnText = game.turn === "X"
    ? `<@${game.playerX.id}>`
    : `<@${game.playerO.id}>`;
  const turnEmoji = game.turn === "X" ? "❌" : "⭕";
  const accentColor = game.turn === "X" ? COLOR_TURN_X : COLOR_TURN_O;

  const bar = progressBar(secondsLeft, TURN_TIMEOUT_SEC, 10);

  let timeEmoji = "🟢";
  if (secondsLeft <= 3) timeEmoji = "🔴";
  else if (secondsLeft <= 6) timeEmoji = "🟡";

  const pX = getUserPoints(game.playerX.id);
  const pO = getUserPoints(game.playerO.id);
  const rX = getRank(pX.points);
  const rO = getRank(pO.points);

  const container = new ContainerBuilder().setAccentColor(accentColor);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 XO Match")
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `❌ **X** — <@${game.playerX.id}>  ${rX.emoji} \`${pX.points}\`\n` +
      `⭕ **O** — <@${game.playerO.id}>  ${rO.emoji} \`${pO.points}\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**🎯 Turn:** ${turnEmoji} ${turnText}`)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${timeEmoji} **⏱️ Time:** \`${secondsLeft}s\`\n` +
      `\`${bar}\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const buttonRows = buildButtonRows(game, false);
  buttonRows.forEach(row => container.addActionRowComponents(row));

  addSignature(container);

  return container;
}

// ============================================
//   🏆 WINNER EMBED — Mentions في الأسماء فقط
// ============================================
function buildEndEmbed(winnerUser, loserUser) {
  const wPoints = getUserPoints(winnerUser.id);

  const winnerAvatar = winnerUser.displayAvatarURL({ extension: "png", size: 64 });
  const loserAvatar = loserUser.displayAvatarURL({ extension: "png", size: 64 });

  let streakText = "";
  if (wPoints.currentStreak >= 5) {
    streakText = `\n🔥🔥 **Win streak:** \`${wPoints.currentStreak}\` — Unstoppable!`;
  } else if (wPoints.currentStreak >= 3) {
    streakText = `\n🔥 **Win streak:** \`${wPoints.currentStreak}\` — Amazing!`;
  }

  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setAuthor({
      name: `🏆 ${winnerUser.username} — WINNER`,
      iconURL: winnerAvatar,
    })
    .setThumbnail(loserAvatar)
    .setTitle("🏆 We have a winner!")
    // Description: بلا mention (نص عادي)
    .setDescription(
      `${winnerUser.username} **won** against ${loserUser.username}!${streakText}`
    )
    // Fields: مع mention
    .addFields(
      {
        name: "🏆 Winner",
        value: `<@${winnerUser.id}>`,
        inline: true,
      },
      {
        name: "💀 Loser",
        value: `<@${loserUser.id}>`,
        inline: true,
      }
    )
    .setImage(WIN_GIF)
    .setFooter({ text: SIGNATURE })
    .setTimestamp();

  return embed;
}

// ============================================
//   🤝 DRAW PANEL (V2)
// ============================================
function buildDrawContainer(game) {
  const pX = getUserPoints(game.playerX.id);
  const pO = getUserPoints(game.playerO.id);
  const rX = getRank(pX.points);
  const rO = getRank(pO.points);

  const container = new ContainerBuilder().setAccentColor(COLOR_DEFAULT);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🤝 Draw!")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `❌ <@${game.playerX.id}>  ${rX.emoji} \`${pX.points}\`\n` +
      `⭕ <@${game.playerO.id}>  ${rO.emoji} \`${pO.points}\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("*⚖️ Draws give no points*")
  );

  const buttonRows = buildButtonRows(game, true);
  buttonRows.forEach(row => container.addActionRowComponents(row));

  addSignature(container);

  return container;
}

// ============================================
//   ⏱️ TIMEOUT EMBED
// ============================================
function buildTimeoutEmbed(timedOutPlayerId, winnerUser, loserUser) {
  const winnerAvatar = winnerUser.displayAvatarURL({ extension: "png", size: 64 });
  const loserAvatar = loserUser.displayAvatarURL({ extension: "png", size: 64 });

  return new EmbedBuilder()
    .setColor(COLOR_TIMEOUT)
    .setAuthor({
      name: `🏆 ${winnerUser.username} — WINNER`,
      iconURL: winnerAvatar,
    })
    .setThumbnail(loserAvatar)
    .setTitle("⏱️ Time is up!")
    // Description: بلا mention
    .setDescription(`${loserUser.username} **didn't play** in time.`)
    // Fields: مع mention
    .addFields(
      {
        name: "🏆 Winner",
        value: `<@${winnerUser.id}>`,
        inline: true,
      },
      {
        name: "💀 Loser",
        value: `<@${loserUser.id}>`,
        inline: true,
      }
    )
    .setImage(WIN_GIF)
    .setFooter({ text: SIGNATURE })
    .setTimestamp();
}

// ============================================
//   📇 PROFILE
// ============================================
function buildProfileContainer(userId, displayUser) {
  const data = getUserPoints(userId);
  const rank = getRank(data.points);
  const nextRank = getNextRank(data.points);
  const progress = getRankProgress(data.points);

  const entries = Object.entries(pointsData)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.points - a.points);
  const playerIndex = entries.findIndex(e => e.id === userId);
  const playerRank = playerIndex >= 0 ? playerIndex + 1 : entries.length + 1;

  const totalGames = data.wins + data.losses + data.draws;
  const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;

  const container = new ContainerBuilder().setAccentColor(COLOR_PROFILE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 📇 Profile — ${displayUser.username}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`### ${rank.emoji} Rank: **${rank.name}**`)
  );

  if (nextRank) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `**⏭️ Next Rank:** ${nextRank.emoji} ${nextRank.name}\n` +
        `\`${progress.bar}\`  ${progress.text}`
      )
    );
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `🏆 **You're at the top rank!**\n\`${progress.bar}\``
      )
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `💯 **Points:** \`${data.points}\`\n` +
      `✅ **Wins:** \`${data.wins}\`\n` +
      `❌ **Losses:** \`${data.losses}\`\n` +
      `🤝 **Draws:** \`${data.draws}\`\n` +
      `🎮 **Total Games:** \`${totalGames}\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `📊 **Win Rate:** \`${winRate}%\`\n` +
      `🔥 **Best Streak:** \`${data.bestStreak}\`\n` +
      `⚡ **Current Streak:** \`${data.currentStreak}\`\n` +
      `🏆 **Rank:** \`#${playerRank}\` of \`${entries.length}\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎖️ RANKS
// ============================================
function buildRanksContainer() {
  const container = new ContainerBuilder().setAccentColor(COLOR_PROFILE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎖️ Ranks — XO")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  let text = "";
  const reversed = [...RANKS].reverse();
  for (let i = 0; i < reversed.length; i++) {
    const rank = reversed[i];
    const nextRank = reversed[i + 1];

    let range = "";
    if (nextRank) {
      range = `\`${rank.min} - ${nextRank.min - 1}\` points`;
    } else {
      range = `\`${rank.min}+\` points`;
    }

    text += `${rank.emoji} **${rank.name}** — ${range}\n`;
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(text)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `*💡 Win games to rank up! Use \`.xo profile\` to see your rank.*`
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🏆 LEADERBOARD
// ============================================
function buildLeaderboardContainer() {
  const entries = Object.entries(pointsData)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.points - a.points);

  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 Leaderboard — XO")
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
      const rank = getRank(entry.points);
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      text += `${medal} <@${entry.userId}> — ${rank.emoji} **${rank.name}**\n`;
      text += `└ 💯 \`${entry.points}\` • ✅ \`${entry.wins}\` • ❌ \`${entry.losses}\` • 🤝 \`${entry.draws}\`\n`;
    });
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(text)
    );
  }

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`*📊 Total players: \`${entries.length}\`*`)
  );

  addSignature(container);

  return container;
}

// ============================================
//   📊 STATS
// ============================================
function buildStatsContainer(userId) {
  const data = getUserPoints(userId);
  const rank = getRank(data.points);
  const totalGames = data.wins + data.losses + data.draws;
  const winRate = totalGames > 0 ? Math.round((data.wins / totalGames) * 100) : 0;

  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 📊 Stats — ${data.username}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${rank.emoji} **Rank:** **${rank.name}**\n` +
      `💯 **Points:** \`${data.points}\`\n\n` +
      `✅ **Wins:** \`${data.wins}\`\n` +
      `❌ **Losses:** \`${data.losses}\`\n` +
      `🤝 **Draws:** \`${data.draws}\`\n` +
      `🎮 **Total Games:** \`${totalGames}\`\n` +
      `📊 **Win Rate:** \`${winRate}%\`\n` +
      `🔥 **Best Streak:** \`${data.bestStreak}\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   📖 HELP
// ============================================
function buildHelpContainer() {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 📖 Bot Commands — XO")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      "**🎮 Play**\n" +
      "`.xo @user` — Challenge a player\n\n" +
      "**📊 Stats**\n" +
      "`.xo top` — 🏆 Leaderboard\n" +
      "`.xo stats` — 📊 Your stats\n" +
      "`.xo stats @user` — 📊 Player stats\n\n" +
      "**👤 Profile & Ranks**\n" +
      "`.xo profile` — 📇 Your profile\n" +
      "`.xo profile @user` — 📇 Player profile\n" +
      "`.xo ranks` — 🎖️ All ranks\n\n" +
      "**ℹ️ Other**\n" +
      "`.xo help` — 📖 This menu"
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   TIMERS
// ============================================

function startTurnTimer(game, channel, client) {
  clearTurnTimer(game.id);

  let secondsLeft = TURN_TIMEOUT_SEC;

  const interval = setInterval(async () => {
    secondsLeft--;

    const currentGame = games.get(game.id);
    if (!currentGame) {
      clearTurnTimer(game.id);
      return;
    }

    if (secondsLeft <= 0) {
      clearTurnTimer(game.id);

      const timedOutPlayerId = currentGame.turn === "X"
        ? currentGame.playerX.id
        : currentGame.playerO.id;

      const winnerId = timedOutPlayerId === currentGame.playerX.id
        ? currentGame.playerO.id
        : currentGame.playerX.id;

      const winnerUser = await client.users.fetch(winnerId).catch(() => null);
      const loserUser = await client.users.fetch(timedOutPlayerId).catch(() => null);

      if (!winnerUser || !loserUser) {
        games.delete(game.id);
        return;
      }

      registerWin(winnerId, winnerUser.username);
      registerLoss(timedOutPlayerId, loserUser.username);

      const embed = buildTimeoutEmbed(timedOutPlayerId, winnerUser, loserUser);

      try {
        const message = await channel.messages.fetch(currentGame.id);
        await message.delete();
      } catch {}

      try {
        await channel.send({ embeds: [embed] });
      } catch (err) {
        console.error("❌ Error sending timeout embed:", err);
      }

      games.delete(game.id);
      return;
    }

    try {
      const container = buildGameContainer(currentGame, secondsLeft);
      const message = await channel.messages.fetch(currentGame.id);
      await message.edit({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch {}
  }, 1000);

  turnTimers.set(game.id, { interval, channel });
}

function clearTurnTimer(gameId) {
  const timer = turnTimers.get(gameId);
  if (timer) {
    clearInterval(timer.interval);
    turnTimers.delete(gameId);
  }
}

function startChallengeTimer(challengeId, channel, messageId, challengerUser, targetUser) {
  clearChallengeTimer(challengeId);

  let secondsLeft = CHALLENGE_TIMEOUT_SEC;

  const interval = setInterval(async () => {
    secondsLeft--;

    if (secondsLeft <= 0) {
      clearChallengeTimer(challengeId);

      const embed = buildChallengeTimeoutEmbed(challengerUser, targetUser);
      const buttons = buildChallengeButtons(challengerUser.id, targetUser.id, true);

      try {
        const message = await channel.messages.fetch(messageId);
        await message.edit({
          embeds: [embed],
          components: buttons,
        });
      } catch {}
      return;
    }

    try {
      const embed = buildChallengeEmbed(challengerUser, targetUser, secondsLeft);
      const buttons = buildChallengeButtons(challengerUser.id, targetUser.id);
      const message = await channel.messages.fetch(messageId);
      await message.edit({
        embeds: [embed],
        components: buttons,
      });
    } catch {}
  }, 1000);

  challengeTimers.set(challengeId, { interval, channel });
}

function clearChallengeTimer(challengeId) {
  const timer = challengeTimers.get(challengeId);
  if (timer) {
    clearInterval(timer.interval);
    challengeTimers.delete(challengeId);
  }
}

// ============================================
//   INIT
// ============================================

function init(client) {
  console.log("🎮 Initializing XO module...");

  loadPoints();

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.content.startsWith(`${PREFIX}xo`)) return;

      const args = message.content.slice(PREFIX.length + 2).trim().split(/\s+/);
      const subCommand = args[0]?.toLowerCase();

      if (subCommand === "help" || subCommand === "commands") {
        return message.channel.send({
          components: [buildHelpContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (subCommand === "top" || subCommand === "leaderboard") {
        return message.channel.send({
          components: [buildLeaderboardContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (subCommand === "ranks" || subCommand === "rank") {
        return message.channel.send({
          components: [buildRanksContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (subCommand === "profile" || subCommand === "profil" || subCommand === "p") {
        const targetUser = message.mentions.users.first() || message.author;
        return message.channel.send({
          components: [buildProfileContainer(targetUser.id, targetUser)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (subCommand === "stats" || subCommand === "me") {
        const targetUser = message.mentions.users.first() || message.author;
        return message.channel.send({
          components: [buildStatsContainer(targetUser.id)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      const target = message.mentions.users.first();
      const challenger = message.author;

      if (!target) {
        return message.channel.send({
          components: [buildHelpContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }
      if (target.id === challenger.id) return message.reply("❌ You can't challenge yourself!");
      if (target.bot) return message.reply("❌ You can't challenge a bot!");

      const embed = buildChallengeEmbed(challenger, target);
      const buttons = buildChallengeButtons(challenger.id, target.id);

      const sentMessage = await message.channel.send({
        embeds: [embed],
        components: buttons,
      });

      startChallengeTimer(
        sentMessage.id,
        message.channel,
        sentMessage.id,
        challenger,
        target
      );

    } catch (err) {
      console.error("❌ Error in messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== REFUSE =====
      if (id.startsWith("ref_")) {
        const parts = id.split("_");
        const challengerId = parts[1];
        const targetId = parts[2];

        if (interaction.user.id !== targetId) {
          return interaction.reply({ content: "❌ This challenge isn't yours.", ephemeral: true });
        }

        clearChallengeTimer(interaction.message.id);
        try { await interaction.message.delete(); } catch {}

        return interaction.reply({
          content: `❌ <@${targetId}> refused the challenge from <@${challengerId}>.`,
        });
      }

      // ===== ACCEPT =====
      if (id.startsWith("acc_")) {
        const parts = id.split("_");
        const challengerId = parts[1];
        const targetId = parts[2];

        if (interaction.user.id !== targetId) {
          return interaction.reply({ content: "❌ This challenge isn't yours.", ephemeral: true });
        }

        clearChallengeTimer(interaction.message.id);

        const challengerIsX = Math.random() < 0.5;
        const challengerUser = await client.users.fetch(challengerId);
        const targetUser = await client.users.fetch(targetId);

        const playerX = challengerIsX ? challengerUser : targetUser;
        const playerO = challengerIsX ? targetUser : challengerUser;

        try { await interaction.message.delete(); } catch {}

        const tempGame = {
          id: "temp",
          playerX: { id: playerX.id },
          playerO: { id: playerO.id },
          board: emptyBoard(),
          turn: "X",
        };

        const tempContainer = buildGameContainer(tempGame, TURN_TIMEOUT_SEC);

        const gameMessage = await interaction.channel.send({
          components: [tempContainer],
          flags: MessageFlags.IsComponentsV2,
        });

        const gameId = gameMessage.id;

        const game = {
          id: gameId,
          playerX: { id: playerX.id },
          playerO: { id: playerO.id },
          board: emptyBoard(),
          turn: "X",
        };
        games.set(gameId, game);

        const updatedContainer = buildGameContainer(game, TURN_TIMEOUT_SEC);
        await gameMessage.edit({
          components: [updatedContainer],
          flags: MessageFlags.IsComponentsV2,
        });

        startTurnTimer(game, interaction.channel, client);
        return;
      }

      // ===== CELL CLICK =====
      if (id.startsWith("xo_")) {
        const parts = id.split("_");
        const gameId = parts[1];
        const cellIdx = parseInt(parts[2], 10);
        const game = games.get(gameId);

        if (!game) {
          return interaction.reply({ content: "❌ This game is outdated.", ephemeral: true });
        }

        const currentPlayerId = game.turn === "X" ? game.playerX.id : game.playerO.id;
        if (interaction.user.id !== currentPlayerId) {
          return interaction.reply({ content: "❌ It's not your turn!", ephemeral: true });
        }

        if (game.board[cellIdx] !== null) {
          return interaction.reply({ content: "❌ That cell is already taken!", ephemeral: true });
        }

        clearTurnTimer(gameId);

        game.board[cellIdx] = game.turn;
        game.turn = game.turn === "X" ? "O" : "X";

        const result = checkWinner(game.board);

        if (result) {
          if (result.winner === "draw") {
            const pX = await client.users.fetch(game.playerX.id).catch(() => null);
            const pO = await client.users.fetch(game.playerO.id).catch(() => null);
            if (pX) registerDraw(game.playerX.id, pX.username);
            if (pO) registerDraw(game.playerO.id, pO.username);

            const endContainer = buildDrawContainer(game);

            await interaction.update({
              components: [endContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          } else {
            const winnerSymbol = result.winner;
            const winnerId = winnerSymbol === "X" ? game.playerX.id : game.playerO.id;
            const loserId = winnerSymbol === "X" ? game.playerO.id : game.playerX.id;

            const winnerUser = await client.users.fetch(winnerId).catch(() => null);
            const loserUser = await client.users.fetch(loserId).catch(() => null);

            if (!winnerUser || !loserUser) {
              return interaction.reply({ content: "❌ Something went wrong.", ephemeral: true });
            }

            registerWin(winnerId, winnerUser.username);
            registerLoss(loserId, loserUser.username);

            const embed = buildEndEmbed(winnerUser, loserUser);

            try { await interaction.message.delete(); } catch {}
            await interaction.channel.send({ embeds: [embed] });
          }

          games.delete(gameId);
          clearTurnTimer(gameId);
          return;
        }

        const container = buildGameContainer(game, TURN_TIMEOUT_SEC);

        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        startTurnTimer(game, interaction.channel, client);
      }

    } catch (err) {
      console.error("❌ Error in interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Something went wrong, try again.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ XO module ready!");
}

// ============================================
//   KEEP-ALIVE
// ============================================
setInterval(() => {
  const mem = process.memoryUsage();
  const ramMB = Math.round(mem.heapUsed / 1024 / 1024);
  console.log(`💓 Alive | RAM: ${ramMB}MB | Games: ${games.size} | Users: ${Object.keys(pointsData).length}`);
}, 5 * 60 * 1000);

module.exports = { init };
