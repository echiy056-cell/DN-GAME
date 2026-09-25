// ============================================
//   TRIVIA QUIZ MODULE — SOLO + 3 Power-ups
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  EmbedBuilder,
  MessageFlags,
} = require("discord.js");

const fs = require("fs");
const path = require("path");

const questions = require("./questions");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const TRIVIA_FILE = path.join(__dirname, "trivia.json");

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;
const COLOR_HELP    = 0x9B59B6;
const COLOR_VOTE    = 0x3498DB;

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME = 15 * 1000;         // 15 ثانية
const NEXT_QUESTION_DELAY = 2500;
const FAST_BONUS_TIME = 5 * 1000;        // Bonus لو جاوب في أقل من 5 ثواني
const FAST_BONUS_POINTS = 1;
const STREAK_THRESHOLD = 3;
const STREAK_BONUS = 2;

// Help from my friend
const HELP_FRIEND_TIME = 30 * 1000;      // 30 ثانية
const HELP_FRIEND_ANSWER_TIME = 10 * 1000; // 10 ثواني

// ============================================
//   RANKS SYSTEM
// ============================================
const RANKS = [
  { name: "Legend",   emoji: "<:emoji_3:1552826411511849123>", min: 500 },
  { name: "Master",   emoji: "<:emoji_6:1552826577266544710>", min: 300 },
  { name: "Diamond",  emoji: "<:emoji_4:1552826460765421569>", min: 200 },
  { name: "Platinum", emoji: "<:emoji_2:1552826359900930161>", min: 120 },
  { name: "Gold",     emoji: "<:emoji_7:1552826619130024016>", min: 50  },
  { name: "Silver",   emoji: "<:emoji_5:1552826504415547472>", min: 25  },
  { name: "Bronze",   emoji: "<:emoji_8:1552826680186241126>", min: 0   },
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
//   STORAGE
// ============================================
let triviaData = {};
const triviaGames = new Map();

function loadTrivia() {
  try {
    if (fs.existsSync(TRIVIA_FILE)) {
      const raw = fs.readFileSync(TRIVIA_FILE, "utf-8");
      triviaData = JSON.parse(raw);
      console.log(`🧠 Loaded ${Object.keys(triviaData).length} trivia users`);
    } else {
      triviaData = {};
      console.log("🧠 Starting fresh (no trivia file)");
    }
  } catch (err) {
    console.error("❌ Error loading trivia:", err);
    triviaData = {};
  }
}

function saveTrivia() {
  try {
    fs.writeFileSync(TRIVIA_FILE, JSON.stringify(triviaData, null, 2), "utf-8");
  } catch (err) {
    console.error("❌ Error saving trivia:", err);
  }
}

function getUser(userId) {
  if (!triviaData[userId]) {
    triviaData[userId] = {
      username: "Unknown",
      points: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      bestStreak: 0,
      currentStreak: 0,
    };
  }
  return triviaData[userId];
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

function setEmbedFooter(embed, guild) {
  if (guild && guild.iconURL()) {
    embed.setFooter({
      text: SIGNATURE,
      iconURL: guild.iconURL({ extension: "png", size: 128 }),
    });
  } else {
    embed.setFooter({ text: SIGNATURE });
  }
  return embed;
}

function progressBar(current, total, length = 10) {
  const filled = Math.round((current / total) * length);
  const empty = length - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function shortText(text, maxLen = 30) {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

// ============================================
//   🎯 SETUP PANEL
// ============================================
function buildSetupEmbed(guild) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setTitle("🧠 Trivia Quiz — Solo")
    .setDescription(
      `**📋 How to play:**\n` +
      `• ${TOTAL_QUESTIONS} questions\n` +
      `• ${QUESTION_TIME / 1000} seconds per question\n` +
      `• 4 choices (A, B, C, D)\n` +
      `• Correct answer → **+1 point**\n` +
      `• Fast bonus (+${FAST_BONUS_POINTS}) if < ${FAST_BONUS_TIME / 1000}s\n` +
      `• Streak bonus (+${STREAK_BONUS}) for ${STREAK_THRESHOLD} in a row\n\n` +
      `**🎯 Power-ups (once per game):**\n` +
      `• 🆘 **Help from my friend** — Ask a friend for help\n` +
      `• 🎯 **50:50** — Remove 2 wrong answers\n` +
      `• 🗳️ **Vote** — Bot suggests the answer`
    )
    .setFooter({ text: SIGNATURE });

  if (guild && guild.iconURL()) {
    embed.setThumbnail(guild.iconURL({ extension: "png", size: 128 }));
  }

  return embed;
}

function buildSetupButtons() {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trivia_start`)
      .setLabel("🎯 START")
      .setStyle(ButtonStyle.Secondary)
  );
  return [row];
}

// ============================================
//   🧠 QUESTION PANEL
// ============================================
function buildQuestionEmbed(game, secondsLeft = QUESTION_TIME / 1000) {
  const q = game.currentQuestion;

  let timeEmoji = "🟢";
  if (secondsLeft <= 4) timeEmoji = "🔴";
  else if (secondsLeft <= 9) timeEmoji = "🟡";

  const bar = progressBar(secondsLeft, QUESTION_TIME / 1000, 10);

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(`🧠 Question ${game.round}/${game.totalQuestions}`)
    .setDescription(`# ${q.q}`)
    .addFields(
      {
        name: "⏱️ Time",
        value: `${timeEmoji} \`${secondsLeft}s\`\n\`${bar}\``,
      },
      {
        name: "🎯 Score",
        value: `\`${game.score}\` points`,
        inline: true,
      },
      {
        name: "🔥 Streak",
        value: `\`${game.streak}\``,
        inline: true,
      },
      {
        name: "🎁 Power-ups",
        value:
          `${game.powerups.help ? "🆘" : "❌"}  ` +
          `${game.powerups.fifty ? "🎯" : "❌"}  ` +
          `${game.powerups.vote ? "🗳️" : "❌"}`,
        inline: true,
      }
    );

  return setEmbedFooter(embed, game.channel.guild);
}

function buildAnswerButtons(game, disabled = false) {
  const q = game.currentQuestion;
  const hidden = game.hiddenAnswers || []; // خيارات مخفية (50:50)

  const makeBtn = (i) => {
    if (hidden.includes(i)) {
      return new ButtonBuilder()
        .setCustomId(`trivia_disabled_${i}`)
        .setLabel(`X) ---`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
    }

    return new ButtonBuilder()
      .setCustomId(`trivia_ans_${i}`)
      .setLabel(`${["A", "B", "C", "D"][i]}) ${shortText(q.o[i])}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled);
  };

  const row1 = new ActionRowBuilder().addComponents(makeBtn(0), makeBtn(1));
  const row2 = new ActionRowBuilder().addComponents(makeBtn(2), makeBtn(3));

  return [row1, row2];
}

function buildPowerupButtons(game) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trivia_help`)
      .setLabel(game.powerups.help ? "🆘 Help from my friend" : "❌ Help (used)")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!game.powerups.help),
    new ButtonBuilder()
      .setCustomId(`trivia_fifty`)
      .setLabel(game.powerups.fifty ? "🎯 50:50" : "❌ 50:50 (used)")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!game.powerups.fifty),
    new ButtonBuilder()
      .setCustomId(`trivia_vote`)
      .setLabel(game.powerups.vote ? "🗳️ Vote" : "❌ Vote (used)")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!game.powerups.vote)
  );

  return [row];
}

// ============================================
//   🆘 HELP FRIEND PANEL (Select Menu)
// ============================================
function buildHelpSelectMenu(game, guild) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_HELP)
    .setTitle("🆘 Help from my friend")
    .setDescription(
      `**Choose a friend to help you!**\n\n` +
      `⚠️ You can only use this **once per game**.\n` +
      `⚠️ Your friend will have ${HELP_FRIEND_ANSWER_TIME / 1000} seconds to answer.`
    )
    .setFooter({ text: SIGNATURE });

  // ناخذو 25 عضو من السيرفر
  const members = guild.members.cache
    .filter(m => !m.user.bot && m.id !== game.playerId)
    .first(25);

  const select = new StringSelectMenuBuilder()
    .setCustomId(`trivia_help_select_${game.id}`)
    .setPlaceholder("Select a friend...")
    .setMinValues(1)
    .setMaxValues(1);

  if (members.size === 0) {
    select.addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel("No friends available")
        .setValue("none")
        .setDescription("No other members found")
    );
  } else {
    members.forEach(m => {
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(m.user.username.slice(0, 100))
          .setValue(m.id)
          .setDescription(`ID: ${m.id.slice(-4)}`)
      );
    });
  }

  const row = new ActionRowBuilder().addComponents(select);

  return { embed, row };
}

// ============================================
//   🆘 HELP FRIEND PANEL (Final)
// ============================================
function buildHelpFriendEmbed(game, friendId, friendUsername, secondsLeft) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_HELP)
    .setTitle("🆘 Help Request")
    .setDescription(
      `<@${friendId}> **ساعد صديقك في هذا السؤال!**\n\n` +
      `**Username:** \`${friendUsername}\`\n\n` +
      `**⏱️ You have:** \`${secondsLeft}s\``
    )
    .setFooter({ text: SIGNATURE });

  return embed;
}

function buildHelpFriendButtons(game) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trivia_help_accept`)
      .setLabel("🤝 I will help you")
      .setStyle(ButtonStyle.Secondary)
  );
  return [row];
}

// ============================================
//   🆘 HELP FRIEND ANSWER PANEL
// ============================================
function buildHelpAnswerEmbed(game, friendId, secondsLeft) {
  const q = game.currentQuestion;

  const embed = new EmbedBuilder()
    .setColor(COLOR_HELP)
    .setTitle("🆘 Friend Answer")
    .setDescription(
      `<@${friendId}> **Choose the answer!**\n\n` +
      `**⏱️ You have:** \`${secondsLeft}s\``
    )
    .setFooter({ text: SIGNATURE });

  return embed;
}

function buildHelpAnswerButtons(game) {
  const q = game.currentQuestion;

  const makeBtn = (i) => {
    return new ButtonBuilder()
      .setCustomId(`trivia_help_ans_${i}`)
      .setLabel(`${["A", "B", "C", "D"][i]}) ${shortText(q.o[i])}`)
      .setStyle(ButtonStyle.Secondary);
  };

  const row1 = new ActionRowBuilder().addComponents(makeBtn(0), makeBtn(1));
  const row2 = new ActionRowBuilder().addComponents(makeBtn(2), makeBtn(3));

  return [row1, row2];
}

// ============================================
//   ✅ ANSWER REVEAL PANEL
// ============================================
function buildAnswerEmbed(game, correctIdx, isCorrect) {
  const q = game.currentQuestion;

  const embed = new EmbedBuilder()
    .setColor(isCorrect ? COLOR_WIN : COLOR_LOSE)
    .setTitle(isCorrect ? "✅ Correct!" : "❌ Wrong!")
    .setDescription(`# ${q.o[correctIdx]}`)
    .addFields(
      {
        name: "🎯 Score",
        value: `\`${game.score}\``,
        inline: true,
      },
      {
        name: "🔥 Streak",
        value: `\`${game.streak}\``,
        inline: true,
      }
    );

  return setEmbedFooter(embed, game.channel.guild);
}

function buildAnswerButtonsDisabled(game, correctIdx) {
  const q = game.currentQuestion;

  const makeBtn = (i) => {
    let style = ButtonStyle.Secondary;
    if (i === correctIdx) style = ButtonStyle.Success;
    else style = ButtonStyle.Danger;

    return new ButtonBuilder()
      .setCustomId(`trivia_done_${i}`)
      .setLabel(`${["A", "B", "C", "D"][i]}) ${shortText(q.o[i])}`)
      .setStyle(style)
      .setDisabled(true);
  };

  const row1 = new ActionRowBuilder().addComponents(makeBtn(0), makeBtn(1));
  const row2 = new ActionRowBuilder().addComponents(makeBtn(2), makeBtn(3));

  return [row1, row2];
}

// ============================================
//   🏆 WINNER PANEL
// ============================================
function buildWinnerEmbed(game) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle("🏆 Quiz Finished!")
    .setDescription(
      `## 🎉 Game Complete!\n\n` +
      `**Final Score:** \`${game.score}/${game.totalQuestions}\`\n` +
      `**Best Streak:** \`${game.bestStreak}\`\n` +
      `**Correct Answers:** \`${game.correctCount}\``
    )
    .setTimestamp();

  return setEmbedFooter(embed, game.channel.guild);
}

// ============================================
//   🏆 LEADERBOARD
// ============================================
function buildLeaderboardEmbed(guild) {
  const entries = Object.entries(triviaData)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.points - a.points);

  const embed = new EmbedBuilder()
    .setColor(COLOR_POINTS)
    .setTitle("🏆 Trivia Quiz — Leaderboard");

  if (entries.length === 0) {
    embed.setDescription("*No players yet. Use `.trivia` to start!*");
  } else {
    const top = entries.slice(0, 10);
    let text = "";
    top.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      const rank = getRank(entry.points);
      text += `${medal} <@${entry.id}> — ${rank.emoji} **${rank.name}**\n`;
      text += `└ 💯 \`${entry.points}\` • ✅ \`${entry.correctAnswers}\`\n`;
    });
    embed.setDescription(text);
  }

  return setEmbedFooter(embed, guild);
}

// ============================================
//   🎖️ RANKS LIST
// ============================================
function buildRanksEmbed(guild) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_POINTS)
    .setTitle("🎖️ Trivia Quiz — Ranks");

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

  embed.setDescription(text);
  return setEmbedFooter(embed, guild);
}

// ============================================
//   📊 STATS
// ============================================
function buildStatsEmbed(userId, displayUser, guild) {
  const user = getUser(userId);
  const rank = getRank(user.points);
  const nextRank = getNextRank(user.points);
  const progress = getRankProgress(user.points);

  const embed = new EmbedBuilder()
    .setColor(COLOR_POINTS)
    .setTitle(`📊 Stats — ${displayUser.username}`)
    .setThumbnail(displayUser.displayAvatarURL({ extension: "png", size: 128 }));

  let rankText = `### ${rank.emoji} Rank: **${rank.name}**\n\n`;
  if (nextRank) {
    rankText += `**⏭️ Next Rank:** ${nextRank.emoji} ${nextRank.name}\n`;
    rankText += `\`${progress.bar}\`  ${progress.text}`;
  } else {
    rankText += `🏆 **You're at the top rank!**\n\`${progress.bar}\``;
  }

  embed.setDescription(rankText);
  embed.addFields(
    { name: "🎯 Points", value: `\`${user.points}\``, inline: true },
    { name: "🎮 Games", value: `\`${user.gamesPlayed}\``, inline: true },
    { name: "🏆 Wins", value: `\`${user.gamesWon}\``, inline: true },
    { name: "✅ Correct", value: `\`${user.correctAnswers}\``, inline: true },
    { name: "📝 Total", value: `\`${user.totalAnswers}\``, inline: true },
    { name: "🔥 Streak", value: `\`${user.bestStreak}\``, inline: true }
  );

  return setEmbedFooter(embed, guild);
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🧠 Initializing Trivia Quiz module...");

  loadTrivia();
  console.log(`🧠 Total questions: ${questions.totalCount}`);

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      if (message.content === `${PREFIX}trivia top`) {
        const embed = buildLeaderboardEmbed(message.guild);
        return message.channel.send({ embeds: [embed] });
      }

      if (message.content === `${PREFIX}trivia ranks`) {
        const embed = buildRanksEmbed(message.guild);
        return message.channel.send({ embeds: [embed] });
      }

      if (message.content === `${PREFIX}trivia stats`) {
        const user = getUser(message.author.id);
        user.username = message.author.username;
        saveTrivia();

        const embed = buildStatsEmbed(message.author.id, message.author, message.guild);
        return message.channel.send({ embeds: [embed] });
      }

      if (message.content === `${PREFIX}trivia`) {
        const embed = buildSetupEmbed(message.guild);
        const buttons = buildSetupButtons();
        return message.channel.send({
          embeds: [embed],
          components: buttons,
        });
      }

    } catch (err) {
      console.error("❌ Error in trivia messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      // ===== SELECT MENU =====
      if (interaction.isStringSelectMenu()) {
        const id = interaction.customId;

        if (id.startsWith("trivia_help_select_")) {
          const gameId = id.replace("trivia_help_select_", "");
          const game = triviaGames.get(gameId);

          if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
          if (interaction.user.id !== game.playerId) {
            return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
          }

          const friendId = interaction.values[0];
          if (friendId === "none") {
            return interaction.reply({ content: "❌ No friends available.", ephemeral: true });
          }

          // نحفظو
          game.helpFriendId = friendId;
          game.powerups.help = false;

          // نجيبو العضو
          const friendMember = await interaction.guild.members.fetch(friendId).catch(() => null);
          if (!friendMember) {
            return interaction.reply({ content: "❌ Member not found.", ephemeral: true });
          }

          try { await interaction.message.delete(); } catch {}

          // نبعتو بانال Help
          const helpEmbed = buildHelpFriendEmbed(game, friendId, friendMember.user.username, HELP_FRIEND_TIME / 1000);
          const helpButtons = buildHelpFriendButtons(game);

          const helpMsg = await interaction.channel.send({
            content: `<@${friendId}>`,
            embeds: [helpEmbed],
            components: helpButtons,
          });
          game.helpMessageId = helpMsg.id;

          // ⏱️ 30 ثانية
          game.helpTimer = setTimeout(async () => {
            if (game.phase === "helping") {
              // ما ردش → اللاعب الأصلي خسر
              await handleHelpTimeout(client, game);
            }
          }, HELP_FRIEND_TIME);

          return;
        }

        return;
      }

      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== START =====
      if (id === "trivia_start") {
        const player = interaction.user;

        const gameId = `solo_${player.id}_${Date.now()}`;

        const game = {
          id: gameId,
          playerId: player.id,
          playerUser: player,
          channel: interaction.channel,
          messageId: null,
          phase: "play",
          score: 0,
          streak: 0,
          bestStreak: 0,
          correctCount: 0,
          round: 0,
          totalQuestions: TOTAL_QUESTIONS,
          currentQuestion: null,
          correctIdx: 0,
          answered: false,
          startTime: 0,
          hiddenAnswers: [],
          // Power-ups
          powerups: {
            help: true,
            fifty: true,
            vote: true,
          },
          // Timers
          questionTimer: null,
          questionCountdown: null,
          helpTimer: null,
          helpAnswerTimer: null,
          helpMessageId: null,
          helpFriendId: null,
        };

        triviaGames.set(gameId, game);

        const user = getUser(player.id);
        user.username = player.username;
        user.gamesPlayed += 1;
        saveTrivia();

        try { await interaction.message.delete(); } catch {}

        nextQuestion(client, game);
        return;
      }

      // ===== ANSWER =====
      if (id.startsWith("trivia_ans_")) {
        const answerIdx = parseInt(id.replace("trivia_ans_", ""), 10);

        // نلقاو اللعبة
        let game = null;
        for (const [gId, g] of triviaGames.entries()) {
          if (g.channel.id === interaction.channel.id && g.phase === "play") {
            game = g;
            break;
          }
        }

        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) {
          return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        }
        if (game.answered) {
          return interaction.reply({ content: "❌ Already answered!", ephemeral: true });
        }

        game.answered = true;

        // نوقف الـ timers
        if (game.questionTimer) clearTimeout(game.questionTimer);
        if (game.questionCountdown) clearInterval(game.questionCountdown);

        // نحسبو
        const isCorrect = answerIdx === game.correctIdx;
        const answerTime = Date.now() - game.startTime;

        if (isCorrect) {
          let points = 1;

          // Fast bonus
          if (answerTime < FAST_BONUS_TIME) {
            points += FAST_BONUS_POINTS;
          }

          // Streak
          game.streak += 1;
          if (game.streak > game.bestStreak) {
            game.bestStreak = game.streak;
          }
          if (game.streak >= STREAK_THRESHOLD && game.streak % STREAK_THRESHOLD === 0) {
            points += STREAK_BONUS;
          }

          game.score += points;
          game.correctCount += 1;

          // نحفظو
          const user = getUser(game.playerId);
          user.points += points;
          user.correctAnswers += 1;
          user.currentStreak = game.streak;
          if (user.currentStreak > user.bestStreak) {
            user.bestStreak = user.currentStreak;
          }
          saveTrivia();
        } else {
          game.streak = 0;
          const user = getUser(game.playerId);
          user.currentStreak = 0;
          saveTrivia();
        }

        // نبعتو الإجابة
        const embed = buildAnswerEmbed(game, game.correctIdx, isCorrect);
        const buttons = buildAnswerButtonsDisabled(game, game.correctIdx);

        await interaction.update({
          embeds: [embed],
          components: buttons,
        });

        // بعد 2.5 ثانية → السؤال التالي
        setTimeout(() => {
          game.phase = "play";
          nextQuestion(client, game);
        }, NEXT_QUESTION_DELAY);

        return;
      }

      // ===== 50:50 =====
      if (id === "trivia_fifty") {
        let game = null;
        for (const [gId, g] of triviaGames.entries()) {
          if (g.channel.id === interaction.channel.id && g.phase === "play") {
            game = g;
            break;
          }
        }

        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) {
          return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        }
        if (!game.powerups.fifty) {
          return interaction.reply({ content: "❌ Already used!", ephemeral: true });
        }
        if (game.answered) {
          return interaction.reply({ content: "❌ Already answered!", ephemeral: true });
        }

        // نختارو 2 أخطاء
        const wrongIndices = [0, 1, 2, 3].filter(i => i !== game.correctIdx);
        const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        game.hiddenAnswers = toHide;
        game.powerups.fifty = false;

        // نحدث البانال
        const embed = buildQuestionEmbed(game, Math.ceil((QUESTION_TIME - (Date.now() - game.startTime)) / 1000));
        const answerButtons = buildAnswerButtons(game);
        const powerupButtons = buildPowerupButtons(game);

        await interaction.update({
          embeds: [embed],
          components: [...answerButtons, ...powerupButtons],
        });

        await interaction.followUp({
          content: "🎯 **50:50 activated!** Two wrong answers removed.",
          ephemeral: true,
        });

        return;
      }

      // ===== VOTE =====
      if (id === "trivia_vote") {
        let game = null;
        for (const [gId, g] of triviaGames.entries()) {
          if (g.channel.id === interaction.channel.id && g.phase === "play") {
            game = g;
            break;
          }
        }

        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) {
          return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        }
        if (!game.powerups.vote) {
          return interaction.reply({ content: "❌ Already used!", ephemeral: true });
        }
        if (game.answered) {
          return interaction.reply({ content: "❌ Already answered!", ephemeral: true });
        }

        game.powerups.vote = false;

        // البوت يقرّب الجواب
        const suggestion = game.correctIdx;
        const letters = ["A", "B", "C", "D"];

        await interaction.reply({
          content: `🗳️ **Vote Result:** The community suggests **${letters[suggestion]}) ${game.currentQuestion.o[suggestion]}** with 67% confidence!`,
          ephemeral: true,
        });

        // نحدث الأزرار
        try {
          const embed = buildQuestionEmbed(game, Math.ceil((QUESTION_TIME - (Date.now() - game.startTime)) / 1000));
          const answerButtons = buildAnswerButtons(game);
          const powerupButtons = buildPowerupButtons(game);

          const msg = await interaction.channel.messages.fetch(game.messageId);
          await msg.edit({
            embeds: [embed],
            components: [...answerButtons, ...powerupButtons],
          });
        } catch {}

        return;
      }

      // ===== HELP =====
      if (id === "trivia_help") {
        let game = null;
        for (const [gId, g] of triviaGames.entries()) {
          if (g.channel.id === interaction.channel.id && g.phase === "play") {
            game = g;
            break;
          }
        }

        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) {
          return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        }
        if (!game.powerups.help) {
          return interaction.reply({ content: "❌ Already used!", ephemeral: true });
        }
        if (game.answered) {
          return interaction.reply({ content: "❌ Already answered!", ephemeral: true });
        }

        // نوقفو الـ timers مؤقتًا
        if (game.questionTimer) clearTimeout(game.questionTimer);
        if (game.questionCountdown) clearInterval(game.questionCountdown);

        game.phase = "helping";
        game.helpStartTime = Date.now();

        // نبعتو Select Menu
        const { embed, row } = buildHelpSelectMenu(game, interaction.guild);

        await interaction.reply({
          embeds: [embed],
          components: [row],
          ephemeral: true,
        });

        return;
      }

      // ===== HELP ACCEPT =====
      if (id === "trivia_help_accept") {
        let game = null;
        for (const [gId, g] of triviaGames.entries()) {
          if (g.helpFriendId === interaction.user.id && g.phase === "helping") {
            game = g;
            break;
          }
        }

        if (!game) return interaction.reply({ content: "❌ Not your request.", ephemeral: true });

        // نوقف الـ 30 timer
        if (game.helpTimer) clearTimeout(game.helpTimer);

        // نبعتو بانال الإجابة للصديق
        const embed = buildHelpAnswerEmbed(game, interaction.user.id, HELP_FRIEND_ANSWER_TIME / 1000);
        const buttons = buildHelpAnswerButtons(game);

        await interaction.update({
          embeds: [embed],
          components: buttons,
        });

        // ⏱️ 10 ثواني
        game.helpAnswerTimer = setTimeout(async () => {
          if (game.phase === "helping") {
            await handleHelpTimeout(client, game);
          }
        }, HELP_FRIEND_ANSWER_TIME);

        return;
      }

      // ===== HELP ANSWER =====
      if (id.startsWith("trivia_help_ans_")) {
        const answerIdx = parseInt(id.replace("trivia_help_ans_", ""), 10);

        let game = null;
        for (const [gId, g] of triviaGames.entries()) {
          if (g.helpFriendId === interaction.user.id && g.phase === "helping") {
            game = g;
            break;
          }
        }

        if (!game) return interaction.reply({ content: "❌ Not your request.", ephemeral: true });

        // نوقف الـ timer
        if (game.helpAnswerTimer) clearTimeout(game.helpAnswerTimer);

        const isCorrect = answerIdx === game.correctIdx;

        // نرجعو للاعب الأصلي
        game.phase = "play";

        // نحسبو
        if (isCorrect) {
          let points = 1;
          game.streak += 1;
          if (game.streak > game.bestStreak) game.bestStreak = game.streak;
          if (game.streak >= STREAK_THRESHOLD && game.streak % STREAK_THRESHOLD === 0) {
            points += STREAK_BONUS;
          }
          game.score += points;
          game.correctCount += 1;

          const user = getUser(game.playerId);
          user.points += points;
          user.correctAnswers += 1;
          saveTrivia();
        } else {
          game.streak = 0;
        }

        game.answered = true;

        try { await interaction.update({ components: [] }); } catch {}

        // نبعتو النتيجة في القناة
        const resultEmbed = buildAnswerEmbed(game, game.correctIdx, isCorrect);
        resultEmbed.setTitle(isCorrect ? "✅ Friend helped correctly!" : "❌ Friend was wrong!");

        const resultButtons = buildAnswerButtonsDisabled(game, game.correctIdx);

        try {
          const msg = await game.channel.messages.fetch(game.messageId);
          await msg.edit({
            embeds: [resultEmbed],
            components: resultButtons,
          });
        } catch {}

        // بعد 2.5 ثانية → السؤال التالي
        setTimeout(() => {
          game.phase = "play";
          nextQuestion(client, game);
        }, NEXT_QUESTION_DELAY);

        return;
      }

    } catch (err) {
      console.error("❌ Error in trivia interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Trivia Quiz module ready!");
}

// ============================================
//   🧠 NEXT QUESTION
// ============================================
async function nextQuestion(client, game) {
  try {
    game.round += 1;

    if (game.round > game.totalQuestions) {
      return finishGame(client, game);
    }

    const q = questions.getRandomQuestion();
    game.currentQuestion = q;
    game.correctIdx = q.c;
    game.answered = false;
    game.startTime = Date.now();
    game.hiddenAnswers = [];

    // نمسحو البانال القديم
    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    // نبعتو البانال الجديد
    const embed = buildQuestionEmbed(game, QUESTION_TIME / 1000);
    const answerButtons = buildAnswerButtons(game);
    const powerupButtons = buildPowerupButtons(game);

    const sent = await game.channel.send({
      embeds: [embed],
      components: [...answerButtons, ...powerupButtons],
    });
    game.messageId = sent.id;

    console.log(`🧠 Q${game.round}/${game.totalQuestions}: ${q.q}`);

    // ⏱️ Countdown
    let secondsLeft = QUESTION_TIME / 1000;
    game.questionCountdown = setInterval(async () => {
      secondsLeft--;

      if (secondsLeft <= 0) {
        clearInterval(game.questionCountdown);
        return;
      }

      try {
        const embed = buildQuestionEmbed(game, secondsLeft);
        const msg = await game.channel.messages.fetch(game.messageId);
        await msg.edit({ embeds: [embed] });
      } catch {}
    }, 1000);

    // ⏱️ Timer
    game.questionTimer = setTimeout(async () => {
      if (game.questionCountdown) clearInterval(game.questionCountdown);
      if (game.answered) return;

      // ما جاوبش → خسر السؤال
      game.answered = true;
      game.streak = 0;

      const user = getUser(game.playerId);
      user.currentStreak = 0;
      saveTrivia();

      const embed = buildAnswerEmbed(game, game.correctIdx, false);
      embed.setTitle("⏱️ Time's up!");
      const buttons = buildAnswerButtonsDisabled(game, game.correctIdx);

      try {
        const msg = await game.channel.messages.fetch(game.messageId);
        await msg.edit({
          embeds: [embed],
          components: buttons,
        });
      } catch {}

      // بعد 2.5 ثانية → السؤال التالي
      setTimeout(() => nextQuestion(client, game), NEXT_QUESTION_DELAY);
    }, QUESTION_TIME);

  } catch (err) {
    console.error("❌ Error in nextQuestion:", err);
  }
}

// ============================================
//   ❌ HELP TIMEOUT
// ============================================
async function handleHelpTimeout(client, game) {
  try {
    game.phase = "play";
    game.answered = true;
    game.streak = 0;

    const user = getUser(game.playerId);
    user.currentStreak = 0;
    saveTrivia();

    // نمسحو رسائل الـ Help
    try {
      if (game.helpMessageId) {
        const m = await game.channel.messages.fetch(game.helpMessageId);
        await m.delete();
      }
    } catch {}

    const embed = buildAnswerEmbed(game, game.correctIdx, false);
    embed.setTitle("❌ Friend didn't answer in time!");
    const buttons = buildAnswerButtonsDisabled(game, game.correctIdx);

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.edit({
        embeds: [embed],
        components: buttons,
      });
    } catch {}

    setTimeout(() => nextQuestion(client, game), NEXT_QUESTION_DELAY);

  } catch (err) {
    console.error("❌ Error in handleHelpTimeout:", err);
  }
}

// ============================================
//   🏆 FINISH
// ============================================
async function finishGame(client, game) {
  try {
    game.phase = "done";

    const user = getUser(game.playerId);
    user.currentStreak = 0;
    if (game.score >= game.totalQuestions * 0.6) {
      user.gamesWon += 1;
    }
    saveTrivia();

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const embed = buildWinnerEmbed(game);
    await game.channel.send({
      content: `<@${game.playerId}>`,
      embeds: [embed],
    });

    console.log(`🏆 Trivia finished: ${game.score}/${game.totalQuestions}`);

    triviaGames.delete(game.id);

  } catch (err) {
    console.error("❌ Error in finishGame:", err);
  }
}

module.exports = { init };
