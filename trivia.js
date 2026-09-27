// ============================================
//   TRIVIA QUIZ MODULE — PostgreSQL
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
  MessageFlags,
} = require("discord.js");

const database = require("./database");
const questions = require("./questions");

// ============================================
//   CONFIG
// ============================================
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;

const TOTAL_QUESTIONS = 10;
const QUESTION_TIME = 15 * 1000;
const NEXT_QUESTION_DELAY = 2500;
const FINAL_QUESTION_BONUS = 10;

const TRIVIA_IMAGE = "https://i.imgur.com/OolFvru.jpeg";

// ============================================
//   RANKS
// ============================================
const RANKS = [
  { name: "Legend",   emoji: "<:emoji_3:1552826411511849123>", min: 500 },
  { name: "Master",   emoji: "<:emoji_432:1553147797359042600>", min: 300 },
  { name: "Diamond",  emoji: "<:emoji_2:1552826359900930161>", min: 200 },
  { name: "Platinum", emoji: "<:emoji_2:1552826359900930161>", min: 120 },
  { name: "Gold",     emoji: "<:emoji_433:1553147839452815381>", min: 50  },
  { name: "Silver",   emoji: "<:emoji_5:1552826504415547472>", min: 25  },
  { name: "Bronze",   emoji: "<:emoji_8:1552826680186241126>", min: 0   },
];

function getRank(points) {
  for (const rank of RANKS) {
    if (points >= rank.min) return rank;
  }
  return RANKS[RANKS.length - 1];
}

// ============================================
//   SHUFFLE
// ============================================
function shuffleQuestion(q) {
  const indices = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
  const shuffledOptions = indices.map(i => q.o[i]);
  const newCorrectIdx = indices.indexOf(q.c);

  return {
    q: q.q,
    o: shuffledOptions,
    c: newCorrectIdx,
    cat: q.cat,
  };
}

// ============================================
//   STORAGE — Active Games
// ============================================
const triviaGames = new Map();

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

function progressBar(current, total, length = 10) {
  const filled = Math.round((current / total) * length);
  const empty = length - filled;
  return "█".repeat(Math.max(0, filled)) + "░".repeat(Math.max(0, empty));
}

function shortText(text, maxLen = 30) {
  if (!text) return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 3) + "...";
}

function getNormalQuestion() {
  return shuffleQuestion(questions.getRandomQuestion());
}

function getFinalQuestion() {
  const scienceQuestions = questions.CATEGORIES.science.questions;
  const historyQuestions = questions.CATEGORIES.history.questions;
  const all = [...scienceQuestions, ...historyQuestions];
  const q = all[Math.floor(Math.random() * all.length)];
  return shuffleQuestion(q);
}

function clearOldGames(channelId) {
  let count = 0;
  for (const [gId, g] of triviaGames.entries()) {
    if (g.channel.id === channelId) {
      if (g.questionTimer) clearTimeout(g.questionTimer);
      if (g.questionCountdown) clearInterval(g.questionCountdown);
      triviaGames.delete(gId);
      count++;
    }
  }
  if (count > 0) console.log(`🧹 Cleared ${count} old game(s)`);
}

function findGameByChannel(channelId, phases = ["play"]) {
  let found = null;
  let latestTime = 0;

  for (const [gId, g] of triviaGames.entries()) {
    if (g.channel.id === channelId && phases.includes(g.phase)) {
      const time = parseInt(gId.split("_").pop()) || 0;
      if (time > latestTime) {
        latestTime = time;
        found = g;
      }
    }
  }
  return found;
}

// ============================================
//   BUILD PANELS
// ============================================
function buildSetupContainer() {
  const container = new ContainerBuilder().setAccentColor(COLOR_DEFAULT);

  try {
    const mediaGallery = new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder().setURL(TRIVIA_IMAGE)
    );
    container.addMediaGalleryComponents(mediaGallery);
  } catch (err) {}

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🧠 Trivia Quiz")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 How to play:**\n` +
      `• ${TOTAL_QUESTIONS} questions per game\n` +
      `• **+1 point** per correct answer\n` +
      `• Wrong answer → **Game Over**\n` +
      `• Question 10 is **HARD** (science/history)\n` +
      `• **+${FINAL_QUESTION_BONUS} bonus** for winning\n\n` +
      `**🎁 Power-ups (once per game):**\n` +
      `• 🎯 50:50\n` +
      `• 🗳️ Vote\n\n` +
      `**🎙️ You must be in a voice channel!**`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trivia_start`)
      .setLabel("🎯 START")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

function buildQuestionContainer(game, secondsLeft = QUESTION_TIME / 1000) {
  const q = game.currentQuestion;
  const isFinal = game.round === TOTAL_QUESTIONS;

  let timeEmoji = "🟢";
  if (secondsLeft <= 4) timeEmoji = "🔴";
  else if (secondsLeft <= 9) timeEmoji = "🟡";

  const bar = progressBar(secondsLeft, QUESTION_TIME / 1000, 10);

  const container = new ContainerBuilder().setAccentColor(
    isFinal ? COLOR_LOSE : COLOR_PLAY
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `## 🧠 Question ${game.round}/${TOTAL_QUESTIONS}` +
      (isFinal ? " 🔥 **FINAL!**" : "")
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${q.q}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `${timeEmoji} **⏱️ Time:** \`${secondsLeft}s\`\n` +
      `\`${bar}\`\n\n` +
      `🎯 **Points:** \`${game.score}\`  •  ` +
      `🔥 **Streak:** \`${game.streak}\`\n\n` +
      `🎁 **Power-ups:** ` +
      `${game.powerups.fifty ? "🎯" : "❌"}  ` +
      `${game.powerups.vote ? "🗳️" : "❌"}`
    )
  );

  const answerButtons = buildAnswerButtons(game);
  answerButtons.forEach(row => container.addActionRowComponents(row));

  const powerupRow = buildPowerupRow(game);
  container.addActionRowComponents(powerupRow);

  addSignature(container);

  return container;
}

function buildAnswerButtons(game) {
  const q = game.currentQuestion;
  const hidden = game.hiddenAnswers || [];

  const makeBtn = (i) => {
    if (hidden.includes(i)) {
      return new ButtonBuilder()
        .setCustomId(`trivia_disabled_${i}`)
        .setLabel(`${["A", "B", "C", "D"][i]}) ---`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true);
    }

    return new ButtonBuilder()
      .setCustomId(`trivia_ans_${i}`)
      .setLabel(`${["A", "B", "C", "D"][i]}) ${shortText(q.o[i])}`)
      .setStyle(ButtonStyle.Secondary);
  };

  const row1 = new ActionRowBuilder().addComponents(makeBtn(0), makeBtn(1));
  const row2 = new ActionRowBuilder().addComponents(makeBtn(2), makeBtn(3));

  return [row1, row2];
}

function buildPowerupRow(game) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trivia_fifty`)
      .setLabel(game.powerups.fifty ? "🎯 50:50" : "❌ 50:50")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!game.powerups.fifty),
    new ButtonBuilder()
      .setCustomId(`trivia_vote`)
      .setLabel(game.powerups.vote ? "🗳️ Vote" : "❌ Vote")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(!game.powerups.vote)
  );
}

function buildAnswerContainer(game, isCorrect) {
  const q = game.currentQuestion;
  const container = new ContainerBuilder().setAccentColor(
    isCorrect ? COLOR_WIN : COLOR_LOSE
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      isCorrect ? "## ✅ Correct!" : "## ❌ Wrong!"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`# ${q.o[game.correctIdx]}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎯 **Points:** \`${game.score}\`  •  ` +
      `🔥 **Streak:** \`${game.streak}\``
    )
  );

  const makeBtn = (i) => {
    const style = i === game.correctIdx ? ButtonStyle.Success : ButtonStyle.Danger;
    return new ButtonBuilder()
      .setCustomId(`trivia_done_${i}`)
      .setLabel(`${["A", "B", "C", "D"][i]}) ${shortText(q.o[i])}`)
      .setStyle(style)
      .setDisabled(true);
  };

  const row1 = new ActionRowBuilder().addComponents(makeBtn(0), makeBtn(1));
  const row2 = new ActionRowBuilder().addComponents(makeBtn(2), makeBtn(3));

  container.addActionRowComponents(row1);
  container.addActionRowComponents(row2);

  addSignature(container);

  return container;
}

function buildWinContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_WIN);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 You WON!")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎉 **You completed all ${TOTAL_QUESTIONS} questions!**\n\n` +
      `🎯 **Points:** \`${game.score}\`\n` +
      `🔥 **Best Streak:** \`${game.bestStreak}\`\n` +
      `✅ **Correct Answers:** \`${game.correctCount}/${TOTAL_QUESTIONS}\`\n\n` +
      `### Do you want to continue playing?`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trivia_next`)
      .setLabel("▶️ Next")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

function buildLoseContainer(game) {
  const q = game.currentQuestion;
  const correctText = q ? q.o[game.correctIdx] : "N/A";

  const container = new ContainerBuilder().setAccentColor(COLOR_LOSE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## ❌ You answered wrong!")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Correct Answer:** # ${correctText}\n\n` +
      `🎯 **Points:** \`${game.score}\`\n` +
      `🎮 **Question:** \`${game.round}/${TOTAL_QUESTIONS}\`\n\n` +
      `### If you want to try again, click the restart button`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`trivia_restart`)
      .setLabel("🔄 Restart")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

function buildLeaderboardContainer(entries) {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 Trivia Quiz — Leaderboard")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (entries.length === 0) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent("*No players yet. Use `.trivia` to start!*")
    );
  } else {
    let text = "";
    entries.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      const rank = getRank(entry.points);
      text += `${medal} <@${entry.user_id}> — ${rank.emoji} **${rank.name}**\n`;
      text += `└ 💯 \`${entry.points}\` • ✅ \`${entry.correct_answers}\`\n`;
    });
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  }

  addSignature(container);

  return container;
}

function buildRanksContainer() {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎖️ Trivia Quiz — Ranks")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  let text = "";
  const reversed = [...RANKS].reverse();
  for (let i = 0; i < reversed.length; i++) {
    const rank = reversed[i];
    const nextRank = reversed[i + 1];
    let range = nextRank ? `\`${rank.min} - ${nextRank.min - 1}\` points` : `\`${rank.min}+\` points`;
    text += `${rank.emoji} **${rank.name}** — ${range}\n`;
  }

  container.addTextDisplayComponents(new TextDisplayBuilder().setContent(text));
  addSignature(container);

  return container;
}

function buildStatsContainer(user, target) {
  const container = new ContainerBuilder().setAccentColor(COLOR_POINTS);
  const rank = getRank(user.points);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## 📊 Stats — ${target.username}`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `### ${rank.emoji} Rank: **${rank.name}**\n\n` +
      `🎯 **Points:** \`${user.points}\`\n` +
      `🎮 **Games:** \`${user.games_played}\`\n` +
      `🏆 **Wins:** \`${user.games_won}\`\n` +
      `✅ **Correct:** \`${user.correct_answers}\`\n` +
      `🔥 **Best Streak:** \`${user.best_streak}\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🧠 Initializing Trivia Quiz module...");
  console.log(`🧠 Total questions: ${questions.totalCount}`);

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .trivia top =====
      if (message.content === ".trivia top") {
        const entries = await database.getTriviaLeaderboard(10);
        return message.channel.send({
          components: [buildLeaderboardContainer(entries)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .trivia ranks =====
      if (message.content === ".trivia ranks") {
        return message.channel.send({
          components: [buildRanksContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .trivia stats =====
      if (message.content === ".trivia stats") {
        const user = await database.getTriviaUser(message.author.id, message.author.username);
        if (!user) return message.reply("❌ DB error.");

        return message.channel.send({
          components: [buildStatsContainer(user, message.author)],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      // ===== .trivia =====
      if (message.content === ".trivia") {
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Trivia!");
        }

        // ✅ Ensure user in DB
        await database.getTriviaUser(message.author.id, message.author.username);

        return message.channel.send({
          components: [buildSetupContainer()],
          flags: MessageFlags.IsComponentsV2,
        });
      }

    } catch (err) {
      console.error("❌ Error in trivia messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== START =====
      if (id === "trivia_start") {
        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play Trivia!",
            ephemeral: true,
          });
        }

        clearOldGames(interaction.channel.id);

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
          currentQuestion: null,
          correctIdx: 0,
          answered: false,
          startTime: 0,
          hiddenAnswers: [],
          powerups: { fifty: true, vote: true },
          questionTimer: null,
          questionCountdown: null,
        };

        triviaGames.set(gameId, game);

        // ✅ Update DB — games_played + 1
        const user = await database.getTriviaUser(player.id, player.username);
        if (user) {
          await database.updateTriviaUser(player.id, {
            points: user.points,
            games_played: user.games_played + 1,
            games_won: user.games_won,
            correct_answers: user.correct_answers,
            best_streak: user.best_streak,
          });
        }

        try { await interaction.message.delete(); } catch {}

        nextQuestion(client, game);
        return;
      }

      // ===== ANSWER =====
      if (id.startsWith("trivia_ans_")) {
        const answerIdx = parseInt(id.replace("trivia_ans_", ""), 10);
        const game = findGameByChannel(interaction.channel.id, ["play"]);

        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        if (game.answered) return interaction.reply({ content: "❌ Already answered!", ephemeral: true });

        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play!",
            ephemeral: true,
          });
        }

        game.answered = true;
        if (game.questionTimer) clearTimeout(game.questionTimer);
        if (game.questionCountdown) clearInterval(game.questionCountdown);

        const isCorrect = answerIdx === game.correctIdx;

        if (isCorrect) {
          game.score += 1;
          game.streak += 1;
          if (game.streak > game.bestStreak) game.bestStreak = game.streak;
          game.correctCount += 1;

          // ✅ Update DB
          const user = await database.getTriviaUser(game.playerId, interaction.user.username);
          if (user) {
            await database.updateTriviaUser(game.playerId, {
              points: user.points + 1,
              games_played: user.games_played,
              games_won: user.games_won,
              correct_answers: user.correct_answers + 1,
              best_streak: Math.max(user.best_streak, game.streak),
            });
          }

          const answerContainer = buildAnswerContainer(game, true);

          await interaction.update({
            components: [answerContainer],
            flags: MessageFlags.IsComponentsV2,
          });

          if (game.round === TOTAL_QUESTIONS) {
            setTimeout(async () => {
              game.score += FINAL_QUESTION_BONUS;

              // ✅ Update DB — points + games_won
              const u = await database.getTriviaUser(game.playerId, interaction.user.username);
              if (u) {
                await database.updateTriviaUser(game.playerId, {
                  points: u.points + FINAL_QUESTION_BONUS,
                  games_played: u.games_played,
                  games_won: u.games_won + 1,
                  correct_answers: u.correct_answers,
                  best_streak: u.best_streak,
                });
              }

              try {
                const m = await game.channel.messages.fetch(game.messageId);
                await m.delete();
              } catch {}

              const winMsg = await game.channel.send({
                components: [buildWinContainer(game)],
                flags: MessageFlags.IsComponentsV2,
              });
              game.messageId = winMsg.id;
              game.phase = "won";
            }, NEXT_QUESTION_DELAY);
            return;
          }

          setTimeout(() => {
            game.phase = "play";
            nextQuestion(client, game);
          }, NEXT_QUESTION_DELAY);
        } else {
          game.streak = 0;

          const loseContainer = buildLoseContainer(game);

          try {
            await interaction.update({
              components: [loseContainer],
              flags: MessageFlags.IsComponentsV2,
            });
          } catch (err) {}

          game.phase = "lost";
        }
        return;
      }

      // ===== 50:50 =====
      if (id === "trivia_fifty") {
        const game = findGameByChannel(interaction.channel.id, ["play"]);
        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        if (!game.powerups.fifty) return interaction.reply({ content: "❌ Already used!", ephemeral: true });
        if (game.answered) return interaction.reply({ content: "❌ Already answered!", ephemeral: true });
        if (!isInVoice(interaction.member)) return interaction.reply({ content: "❌ Need VC.", ephemeral: true });

        const wrongIndices = [0, 1, 2, 3].filter(i => i !== game.correctIdx);
        game.hiddenAnswers = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
        game.powerups.fifty = false;

        const container = buildQuestionContainer(game,
          Math.ceil((QUESTION_TIME - (Date.now() - game.startTime)) / 1000));

        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      // ===== VOTE =====
      if (id === "trivia_vote") {
        const game = findGameByChannel(interaction.channel.id, ["play"]);
        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        if (!game.powerups.vote) return interaction.reply({ content: "❌ Already used!", ephemeral: true });
        if (game.answered) return interaction.reply({ content: "❌ Already answered!", ephemeral: true });
        if (!isInVoice(interaction.member)) return interaction.reply({ content: "❌ Need VC.", ephemeral: true });

        game.powerups.vote = false;

        const letters = ["A", "B", "C", "D"];
        const suggestion = game.correctIdx;

        await interaction.reply({
          content: `🗳️ **Vote Result:** **${letters[suggestion]}) ${game.currentQuestion.o[suggestion]}** (67% confidence)`,
          ephemeral: true,
        });

        const container = buildQuestionContainer(game,
          Math.ceil((QUESTION_TIME - (Date.now() - game.startTime)) / 1000));

        try {
          await interaction.message.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch {}
        return;
      }

      // ===== NEXT =====
      if (id === "trivia_next") {
        const game = findGameByChannel(interaction.channel.id, ["won"]);
        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        if (!isInVoice(interaction.member)) return interaction.reply({ content: "❌ Need VC.", ephemeral: true });

        // Reset
        game.score = 0;
        game.streak = 0;
        game.bestStreak = 0;
        game.correctCount = 0;
        game.round = 0;
        game.answered = false;
        game.hiddenAnswers = [];
        game.powerups = { fifty: true, vote: true };
        game.phase = "play";

        if (game.questionTimer) clearTimeout(game.questionTimer);
        if (game.questionCountdown) clearInterval(game.questionCountdown);
        triviaGames.delete(game.id);

        const newGameId = `solo_${game.playerId}_${Date.now()}`;
        game.id = newGameId;
        game.messageId = interaction.message.id;
        triviaGames.set(newGameId, game);

        // ✅ Update DB — games_played + 1
        const user = await database.getTriviaUser(game.playerId, interaction.user.username);
        if (user) {
          await database.updateTriviaUser(game.playerId, {
            points: user.points,
            games_played: user.games_played + 1,
            games_won: user.games_won,
            correct_answers: user.correct_answers,
            best_streak: user.best_streak,
          });
        }

        nextQuestion(client, game);
        return;
      }

      // ===== RESTART =====
      if (id === "trivia_restart") {
        const game = findGameByChannel(interaction.channel.id, ["lost"]);
        if (!game) return interaction.reply({ content: "❌ No active game.", ephemeral: true });
        if (interaction.user.id !== game.playerId) return interaction.reply({ content: "❌ Not your game.", ephemeral: true });
        if (!isInVoice(interaction.member)) return interaction.reply({ content: "❌ Need VC.", ephemeral: true });

        game.score = 0;
        game.streak = 0;
        game.bestStreak = 0;
        game.correctCount = 0;
        game.round = 0;
        game.answered = false;
        game.hiddenAnswers = [];
        game.powerups = { fifty: true, vote: true };
        game.phase = "play";

        if (game.questionTimer) clearTimeout(game.questionTimer);
        if (game.questionCountdown) clearInterval(game.questionCountdown);
        triviaGames.delete(game.id);

        const newGameId = `solo_${game.playerId}_${Date.now()}`;
        game.id = newGameId;
        game.messageId = interaction.message.id;
        triviaGames.set(newGameId, game);

        // ✅ Update DB — games_played + 1
        const user = await database.getTriviaUser(game.playerId, interaction.user.username);
        if (user) {
          await database.updateTriviaUser(game.playerId, {
            points: user.points,
            games_played: user.games_played + 1,
            games_won: user.games_won,
            correct_answers: user.correct_answers,
            best_streak: user.best_streak,
          });
        }

        nextQuestion(client, game);
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
    game.answered = false;
    game.hiddenAnswers = [];
    game.startTime = Date.now();

    let q;
    if (game.round === TOTAL_QUESTIONS) {
      q = getFinalQuestion();
    } else {
      q = getNormalQuestion();
    }
    game.currentQuestion = q;
    game.correctIdx = q.c;

    try {
      const m = await game.channel.messages.fetch(game.messageId);
      await m.delete();
    } catch {}

    const container = buildQuestionContainer(game, QUESTION_TIME / 1000);

    const sent = await game.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    game.messageId = sent.id;

    let secondsLeft = QUESTION_TIME / 1000;
    game.questionCountdown = setInterval(async () => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(game.questionCountdown);
        return;
      }
      try {
        const container = buildQuestionContainer(game, secondsLeft);
        const m = await game.channel.messages.fetch(game.messageId);
        await m.edit({ components: [container], flags: MessageFlags.IsComponentsV2 });
      } catch {}
    }, 1000);

    game.questionTimer = setTimeout(async () => {
      if (game.questionCountdown) clearInterval(game.questionCountdown);
      if (game.answered) return;

      game.answered = true;
      game.streak = 0;

      const loseContainer = buildLoseContainer(game);

      try {
        const m = await game.channel.messages.fetch(game.messageId);
        await m.edit({
          components: [loseContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (err) {}

      game.phase = "lost";
    }, QUESTION_TIME);

  } catch (err) {
    console.error("❌ Error in nextQuestion:", err);
  }
}

module.exports = { init };
