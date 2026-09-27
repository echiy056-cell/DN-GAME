// ============================================
//   CRASH GAME MODULE — PostgreSQL
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
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
const COLOR_POINTS  = 0xFEE75C;

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 10;
const TOTAL_ROUNDS = 10;

// ============================================
//   RANKS
// ============================================
const RANKS = [
  { name: "Legend",   emoji: "🏆", min: 500 },
  { name: "Master",   emoji: "🔮", min: 200 },
  { name: "Platinum", emoji: "💎", min: 120 },
  { name: "Gold",     emoji: "🟡", min: 50  },
  { name: "Silver",   emoji: "⚪", min: 25  },
  { name: "Bronze",   emoji: "🟤", min: 0   },
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
//   WORDS BANK
// ============================================
const WORDS = [
  { word: "بيتزا", emoji: "🍕", hint: "أكل إيطالي" },
  { word: "برغر", emoji: "🍔", hint: "أكل أمريكي" },
  { word: "كسكسي", emoji: "🍚", hint: "طبق تونسي" },
  { word: "سوشي", emoji: "🍣", hint: "أكل ياباني" },
  { word: "شاورما", emoji: "🌯", hint: "أكل شرقي" },
  { word: "باستا", emoji: "🍝", hint: "معكرونة" },
  { word: "بطيخ", emoji: "🍉", hint: "فاكهة صيفية" },
  { word: "موز", emoji: "🍌", hint: "فاكهة صفراء" },
  { word: "برتقال", emoji: "🍊", hint: "فاكهة حامضة" },
  { word: "تفاح", emoji: "🍎", hint: "فاكهة حمراء" },
  { word: "بريك", emoji: "🥟", hint: "طبق تونسي" },
  { word: "لبلابي", emoji: "🥣", hint: "أكلة تونسية" },
  { word: "ملوخية", emoji: "🥬", hint: "طبق شرقي" },
  { word: "شكشوكة", emoji: "🍳", hint: "طبق تونسي" },
  { word: "حوت", emoji: "🐟", hint: "من البحر" },
  { word: "دجاج", emoji: "🍗", hint: "طائر مشوي" },
  { word: "خبز", emoji: "🍞", hint: "أساس الأكل" },
  { word: "طاجين", emoji: "🍲", hint: "طبق مغربي" },
  { word: "كبسة", emoji: "🍚", hint: "طبق سعودي" },
  { word: "شوربة", emoji: "🍜", hint: "طبق ساخن" },
  { word: "بيض", emoji: "🥚", hint: "من الدجاجة" },
  { word: "جبن", emoji: "🧀", hint: "من الحليب" },
  { word: "كيك", emoji: "🎂", hint: "حلوى" },
  { word: "شوكولاتة", emoji: "🍫", hint: "حلوى بنية" },
  { word: "عسل", emoji: "🍯", hint: "من النحل" },
  { word: "قهوة", emoji: "☕", hint: "مشروب ساخن" },
  { word: "شاي", emoji: "🍵", hint: "مشروب ساخن" },
  { word: "حليب", emoji: "🥛", hint: "مشروب أبيض" },
  { word: "أسد", emoji: "🦁", hint: "ملك الغابة" },
  { word: "فيل", emoji: "🐘", hint: "أكبر حيوان" },
  { word: "نمر", emoji: "🐯", hint: "مخطط" },
  { word: "زرافة", emoji: "🦒", hint: "رقبة طويلة" },
  { word: "قرد", emoji: "🐒", hint: "يأكل الموز" },
  { word: "دلفين", emoji: "🐬", hint: "ذكي في البحر" },
  { word: "تمساح", emoji: "🐊", hint: "زاحف خطير" },
  { word: "حصان", emoji: "🐴", hint: "يجرى بسرعة" },
  { word: "جمل", emoji: "🐪", hint: "سفينة الصحراء" },
  { word: "نعامة", emoji: "🦤", hint: "طائر ما يطيرش" },
  { word: "كلب", emoji: "🐕", hint: "صديق الإنسان" },
  { word: "قط", emoji: "🐈", hint: "يشرب الحليب" },
  { word: "أرنب", emoji: "🐰", hint: "يأكل الجزر" },
  { word: "دب", emoji: "🐻", hint: "يحب العسل" },
  { word: "ذئب", emoji: "🐺", hint: "من الكلاب" },
  { word: "ثعلب", emoji: "🦊", hint: "ذكي برتقالي" },
  { word: "غزال", emoji: "🦌", hint: "سريع ورشيق" },
  { word: "بقرة", emoji: "🐄", hint: "تعطي الحليب" },
  { word: "خروف", emoji: "🐑", hint: "يعطي الصوف" },
  { word: "دجاجة", emoji: "🐔", hint: "تعطي البيض" },
  { word: "بطة", emoji: "🦆", hint: "تعوم في الماء" },
  { word: "حمامة", emoji: "🕊️", hint: "رمز السلام" },
  { word: "نسر", emoji: "🦅", hint: "طائر جارح" },
  { word: "بومة", emoji: "🦉", hint: "تصحو في الليل" },
  { word: "ببغاء", emoji: "🦜", hint: "يتكلم" },
  { word: "طاووس", emoji: "🦚", hint: "ألوان جميلة" },
  { word: "قرش", emoji: "🦈", hint: "سمك مفترس" },
  { word: "حوت", emoji: "🐋", hint: "أكبر حيوان بحري" },
  { word: "أخطبوط", emoji: "🐙", hint: "8 أرجل" },
  { word: "سلحفاة", emoji: "🐢", hint: "بطيئة" },
  { word: "أفعى", emoji: "🐍", hint: "زاحف سام" },
  { word: "ضفدع", emoji: "🐸", hint: "ينق" },
  { word: "نحلة", emoji: "🐝", hint: "تعطي العسل" },
  { word: "فراشة", emoji: "🦋", hint: "ألوان جميلة" },
  { word: "نملة", emoji: "🐜", hint: "صغيرة ومجتهدة" },
  { word: "عنكبوت", emoji: "🕷️", hint: "يصنع الشبكة" },
  { word: "عقرب", emoji: "🦂", hint: "سام في الصحراء" },
  { word: "خفاش", emoji: "🦇", hint: "يطير في الليل" },
  { word: "كنغر", emoji: "🦘", hint: "يقفز" },
  { word: "كوالا", emoji: "🐨", hint: "أسترالي" },
  { word: "باندا", emoji: "🐼", hint: "أبيض وأسود" },
  { word: "ديناصور", emoji: "🦕", hint: "منقرض" },
  { word: "طوكيو", emoji: "🗼", hint: "عاصمة اليابان" },
  { word: "باريس", emoji: "🗼", hint: "برج إيفل" },
  { word: "القاهرة", emoji: "🏛️", hint: "عاصمة مصر" },
  { word: "دبي", emoji: "🏙️", hint: "مدينة الإمارات" },
  { word: "تونس", emoji: "🇹🇳", hint: "عاصمة تونس" },
  { word: "روما", emoji: "🏛️", hint: "عاصمة إيطاليا" },
  { word: "لندن", emoji: "🇬🇧", hint: "عاصمة بريطانيا" },
  { word: "نيويورك", emoji: "🗽", hint: "مدينة أمريكية" },
  { word: "مدريد", emoji: "🇪🇸", hint: "عاصمة إسبانيا" },
  { word: "برلين", emoji: "🇩🇪", hint: "عاصمة ألمانيا" },
  { word: "فيسبوك", emoji: "📘", hint: "موقع تواصل" },
  { word: "آيفون", emoji: "📱", hint: "هاتف ذكي" },
  { word: "واتساب", emoji: "💬", hint: "تطبيق دردشة" },
  { word: "يوتيوب", emoji: "▶️", hint: "موقع فيديو" },
  { word: "إنستغرام", emoji: "📷", hint: "موقع صور" },
  { word: "تيك توك", emoji: "🎵", hint: "فيديوهات قصيرة" },
  { word: "غوغل", emoji: "🔍", hint: "محرك بحث" },
  { word: "نتفليكس", emoji: "🎬", hint: "أفلام ومسلسلات" },
  { word: "ميسي", emoji: "⚽", hint: "لاعب أرجنتيني" },
  { word: "رونالدو", emoji: "⚽", hint: "لاعب برتغالي" },
  { word: "ريال مدريد", emoji: "👑", hint: "فريق إسباني" },
  { word: "برشلونة", emoji: "🔵🔴", hint: "فريق إسباني" },
  { word: "كأس العالم", emoji: "🏆", hint: "بطولة كرة القدم" },
  { word: "الأهلي", emoji: "🔴", hint: "فريق مصري" },
  { word: "الترجي", emoji: "🔴🟡", hint: "فريق تونسي" },
  { word: "ماينكرافت", emoji: "⛏️", hint: "لعبة بلوكات" },
  { word: "فورتنايت", emoji: "🏗️", hint: "Battle Royale" },
  { word: "بابجي", emoji: "🔫", hint: "لعبة موبايل" },
  { word: "فيفا", emoji: "⚽", hint: "لعبة كرة قدم" },
  { word: "جيتا", emoji: "🚗", hint: "لعبة سرقة" },
  { word: "شمس", emoji: "☀️", hint: "نجم النهار" },
  { word: "قمر", emoji: "🌙", hint: "نجم الليل" },
  { word: "بحر", emoji: "🌊", hint: "ماء مالح" },
  { word: "جبل", emoji: "🏔️", hint: "مرتفع" },
  { word: "صحراء", emoji: "🏜️", hint: "رمل وحرارة" },
  { word: "غابة", emoji: "🌲", hint: "كثيرة الأشجار" },
  { word: "نهر", emoji: "🏞️", hint: "ماء عذب" },
  { word: "مطر", emoji: "🌧️", hint: "ماء من السماء" },
  { word: "ثلج", emoji: "❄️", hint: "ماء متجمد" },
  { word: "قوس قزح", emoji: "🌈", hint: "بعد المطر" },
  { word: "بيت", emoji: "🏠", hint: "مكان السكن" },
  { word: "سيارة", emoji: "🚗", hint: "وسيلة نقل" },
  { word: "طائرة", emoji: "✈️", hint: "تطير" },
  { word: "قطار", emoji: "🚆", hint: "على السكة" },
  { word: "سفينة", emoji: "🚢", hint: "في البحر" },
  { word: "دراجة", emoji: "🚴", hint: "بعجلتين" },
  { word: "كتاب", emoji: "📕", hint: "للقراءة" },
  { word: "قلم", emoji: "✏️", hint: "للكتابة" },
  { word: "ساعة", emoji: "⌚", hint: "تقيس الوقت" },
  { word: "نظارة", emoji: "👓", hint: "للعينين" },
  { word: "مفتاح", emoji: "🔑", hint: "يفتح الباب" },
  { word: "كرسي", emoji: "🪑", hint: "للجلوس" },
  { word: "سرير", emoji: "🛏️", hint: "للنوم" },
  { word: "هاتف", emoji: "📞", hint: "للاتصال" },
  { word: "تلفاز", emoji: "📺", hint: "للمشاهدة" },
  { word: "ثلاجة", emoji: "🧊", hint: "لحفظ الأكل" },
];

// ============================================
//   STORAGE — Active Games
// ============================================
const crashGames = new Map();

// ============================================
//   HELPERS
// ============================================
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

function isInVoice(member) {
  try {
    return !!(member && member.voice && member.voice.channel);
  } catch {
    return false;
  }
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function scrambleWord(word) {
  const letters = [...word.replace(/\s/g, "")];
  return shuffleArray(letters);
}

// ============================================
//   BUILD EMBEDS
// ============================================
function buildSetupEmbed(game, guild) {
  const playersList = game.players.length > 0
    ? game.players.map((p, i) => `${i + 1}. <@${p.id}>`).join("\n")
    : "*No players yet...*";

  const embed = new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setTitle("🎮 Crash Game")
    .setDescription(
      `**Host:** <@${game.hostId}>\n\n` +
      `**Players:** \`${game.players.length}/${MAX_PLAYERS}\`\n\n` +
      `**🎯 Solo:** Click SOLO to play alone\n` +
      `**👥 Multi:** Click JOIN + START\n\n` +
      `**📋 How to play:**\n` +
      `• Bot gives you a **scrambled word**\n` +
      `• Rearrange the letters\n` +
      `• First to answer correctly → **+1 point**\n` +
      `• **${TOTAL_ROUNDS} words** per game\n\n` +
      `**🎙️ All players must be in a voice channel!**`
    )
    .addFields({
      name: "👥 Players Joined",
      value: playersList,
    });

  return setEmbedFooter(embed, guild);
}

function buildSetupButtons(game) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`crash_join_${game.id}`)
      .setLabel("✅ JOIN")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`crash_solo_${game.id}`)
      .setLabel("🎯 SOLO")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`crash_start_${game.id}`)
      .setLabel("🟢 START")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(game.players.length < MIN_PLAYERS)
  );
  return [row];
}

function buildGameEmbed(game, guild) {
  const scrambled = game.scrambled.join("  ");

  let scoreText = "";
  game.players.forEach(p => {
    scoreText += `<@${p.id}>: **${p.score}**\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_PLAY)
    .setTitle(game.solo ? "🎮 Crash Game — Solo" : "🎮 Crash Game")
    .setDescription(
      `**Category:** 🎯 Word\n\n` +
      `# ${game.currentWord.emoji}\n\n` +
      `## 🔤 Letters: \`${scrambled}\`\n\n` +
      `**💡 Hint:** ${game.currentWord.hint}\n\n` +
      `**🎮 Round:** \`${game.round}/${game.totalRounds}\`\n\n` +
      `**✍️ Type your answer in chat!**`
    )
    .addFields({
      name: "🏆 Scores",
      value: scoreText,
    });

  return setEmbedFooter(embed, guild);
}

function buildWinnerEmbed(game, guild) {
  const sorted = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sorted[0];

  let leaderboard = "";
  sorted.forEach((p, i) => {
    const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
    leaderboard += `${medal} <@${p.id}> — \`${p.score}\` points\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_WIN)
    .setTitle(game.solo ? "🏆 Crash Game — Finished!" : "🏆 Crash Game — Winner!")
    .setDescription(
      (game.solo
        ? `## 🎉 Game Complete!\n\n**Your Score:** \`${winner.score}/${game.totalRounds}\`\n\n`
        : `## 🎉 Congratulations <@${winner.id}>!\n\n`) +
      `**Final Scores:**\n${leaderboard}`
    )
    .setTimestamp();

  return setEmbedFooter(embed, guild);
}

function buildLeaderboardEmbed(entries, guild) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_POINTS)
    .setTitle("🏆 Crash Game — Leaderboard");

  if (entries.length === 0) {
    embed.setDescription("*No players yet. Use `.crash` to start!*");
  } else {
    let text = "";
    entries.forEach((entry, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `**#${i + 1}**`;
      const rank = getRank(entry.points);
      text += `${medal} <@${entry.user_id}> — ${rank.emoji} **${rank.name}**\n`;
      text += `└ 💯 \`${entry.points}\` • ✅ \`${entry.correct_answers}\`\n`;
    });
    embed.setDescription(text);
  }

  return setEmbedFooter(embed, guild);
}

function buildRanksEmbed(guild) {
  const embed = new EmbedBuilder()
    .setColor(COLOR_POINTS)
    .setTitle("🎖️ Crash Game — Ranks");

  let text = "";
  const reversed = [...RANKS].reverse();
  for (let i = 0; i < reversed.length; i++) {
    const rank = reversed[i];
    const nextRank = reversed[i + 1];
    let range = nextRank ? `\`${rank.min} - ${nextRank.min - 1}\` points` : `\`${rank.min}+\` points`;
    text += `${rank.emoji} **${rank.name}** — ${range}\n`;
  }

  embed.setDescription(text);
  return setEmbedFooter(embed, guild);
}

function buildStatsEmbed(user, displayUser, guild) {
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
    { name: "📝 Words", value: `\`${user.total_words}\``, inline: true },
    { name: "🎮 Games", value: `\`${user.games_played}\``, inline: true },
    { name: "🏆 Wins", value: `\`${user.games_won}\``, inline: true },
    { name: "✅ Correct", value: `\`${user.correct_answers}\``, inline: true },
    { name: "🔥 Best Streak", value: `\`${user.best_streak}\``, inline: true }
  );

  return setEmbedFooter(embed, guild);
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎮 Initializing Crash Game module...");

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .crash top =====
      if (message.content === ".crash top") {
        const entries = await database.getCrashLeaderboard(10);
        const embed = buildLeaderboardEmbed(entries, message.guild);
        return message.channel.send({ embeds: [embed] });
      }

      // ===== .crash ranks =====
      if (message.content === ".crash ranks") {
        const embed = buildRanksEmbed(message.guild);
        return message.channel.send({ embeds: [embed] });
      }

      // ===== .crash stats =====
      if (message.content === ".crash stats") {
        const user = await database.getCrashUser(message.author.id, message.author.username);
        if (!user) return message.reply("❌ DB error.");

        const embed = buildStatsEmbed(user, message.author, message.guild);
        return message.channel.send({ embeds: [embed] });
      }

      // ===== .crash =====
      if (message.content === ".crash") {
        if (!isInVoice(message.member)) {
          return message.reply("❌ You must be in a **voice channel** to play Crash!");
        }

        const gameId = message.id;

        const game = {
          id: gameId,
          hostId: message.author.id,
          hostUser: message.author,
          players: [],
          phase: "setup",
          channel: message.channel,
          messageId: null,
          currentWord: null,
          scrambled: null,
          round: 0,
          totalRounds: TOTAL_ROUNDS,
          answered: false,
          solo: false,
        };

        crashGames.set(gameId, game);

        const embed = buildSetupEmbed(game, message.guild);
        const buttons = buildSetupButtons(game);
        const sent = await message.channel.send({
          embeds: [embed],
          components: buttons,
        });
        game.messageId = sent.id;
        return;
      }

      // ===== Answer =====
      for (const [gameId, game] of crashGames.entries()) {
        if (game.phase !== "play") continue;
        if (game.channel.id !== message.channel.id) continue;
        if (game.answered) continue;

        const player = game.players.find(p => p.id === message.author.id);
        if (!player) continue;

        if (!isInVoice(message.member)) continue;

        const answer = message.content.trim().toLowerCase();
        const correct = game.currentWord.word.toLowerCase();

        if (answer === correct) {
          game.answered = true;
          player.score += 1;

          // ✅ Update DB
          const user = await database.getCrashUser(player.id, player.username);
          if (user) {
            const newStreak = user.best_streak;
            await database.updateCrashUser(player.id, {
              points: user.points + 1,
              total_words: user.total_words + 1,
              games_played: user.games_played,
              games_won: user.games_won,
              correct_answers: user.correct_answers + 1,
              best_streak: newStreak,
            });

            // 🎖️ Rank up?
            const oldRank = getRank(user.points);
            const newRank = getRank(user.points + 1);

            if (oldRank.name !== newRank.name) {
              try { await message.delete(); } catch {}
              await game.channel.send({
                content: `🎖️ **Congrats <@${player.id}>!** Rank up: ${oldRank.emoji} **${oldRank.name}** → ${newRank.emoji} **${newRank.name}**!`,
              });
            }
          }

          try { await message.delete(); } catch {}

          await game.channel.send({
            content: `✅ **<@${player.id}>** guessed correctly! The word was **\`${game.currentWord.word}\`**`,
          });

          setTimeout(() => nextRound(client, game), 2000);
          break;
        } else {
          try { await message.react("❌"); } catch {}
        }
      }

    } catch (err) {
      console.error("❌ Error in crash messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== JOIN =====
      if (id.startsWith("crash_join_")) {
        const gameId = id.replace("crash_join_", "");
        const game = crashGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (game.phase !== "setup") return interaction.reply({ content: "❌ Game started.", ephemeral: true });

        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to join!",
            ephemeral: true,
          });
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
          score: 0,
        });

        const embed = buildSetupEmbed(game, interaction.guild);
        const buttons = buildSetupButtons(game);
        await interaction.update({ embeds: [embed], components: buttons });
        return;
      }

      // ===== SOLO =====
      if (id.startsWith("crash_solo_")) {
        const gameId = id.replace("crash_solo_", "");
        const game = crashGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (game.phase !== "setup") return interaction.reply({ content: "❌ Game started.", ephemeral: true });

        if (!isInVoice(interaction.member)) {
          return interaction.reply({
            content: "❌ You must be in a **voice channel** to play!",
            ephemeral: true,
          });
        }

        const soloGameId = `solo_${interaction.user.id}_${Date.now()}`;

        const soloGame = {
          id: soloGameId,
          hostId: interaction.user.id,
          hostUser: interaction.user,
          players: [{
            id: interaction.user.id,
            username: interaction.user.username,
            score: 0,
          }],
          phase: "play",
          channel: interaction.channel,
          messageId: null,
          currentWord: null,
          scrambled: null,
          round: 0,
          totalRounds: TOTAL_ROUNDS,
          answered: false,
          solo: true,
        };

        crashGames.set(soloGameId, soloGame);

        // ✅ Update DB — games_played + 1
        const user = await database.getCrashUser(interaction.user.id, interaction.user.username);
        if (user) {
          await database.updateCrashUser(interaction.user.id, {
            points: user.points,
            total_words: user.total_words,
            games_played: user.games_played + 1,
            games_won: user.games_won,
            correct_answers: user.correct_answers,
            best_streak: user.best_streak,
          });
        }

        try { await interaction.message.delete(); } catch {}

        nextRound(client, soloGame);
        return;
      }

      // ===== START =====
      if (id.startsWith("crash_start_")) {
        const gameId = id.replace("crash_start_", "");
        const game = crashGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (interaction.user.id !== game.hostId) {
          return interaction.reply({ content: "❌ Only host can start.", ephemeral: true });
        }
        if (game.players.length < MIN_PLAYERS) {
          return interaction.reply({ content: `❌ Need ${MIN_PLAYERS}+ players.`, ephemeral: true });
        }

        // ✅ Check VC — كل اللاعبين
        try { await interaction.guild.members.fetch(); } catch {}

        const notInVC = [];
        for (const p of game.players) {
          const member = interaction.guild.members.cache.get(p.id);
          if (!member || !isInVoice(member)) {
            notInVC.push(p);
          }
        }

        if (notInVC.length > 0) {
          const mentions = notInVC.map(p => `<@${p.id}>`).join(", ");
          return interaction.reply({
            content: `❌ These players must join a **voice channel** first:\n${mentions}`,
            ephemeral: true,
          });
        }

        game.phase = "play";
        game.round = 0;

        // ✅ Update DB — games_played + 1
        for (const p of game.players) {
          const user = await database.getCrashUser(p.id, p.username);
          if (user) {
            await database.updateCrashUser(p.id, {
              points: user.points,
              total_words: user.total_words,
              games_played: user.games_played + 1,
              games_won: user.games_won,
              correct_answers: user.correct_answers,
              best_streak: user.best_streak,
            });
          }
        }

        try { await interaction.message.delete(); } catch {}
        nextRound(client, game);
        return;
      }

    } catch (err) {
      console.error("❌ Error in crash interactionCreate:", err);
    }
  });

  console.log("✅ Crash Game module ready!");
}

// ============================================
//   NEXT ROUND
// ============================================
async function nextRound(client, game) {
  try {
    game.round += 1;

    if (game.round > game.totalRounds) {
      const sorted = [...game.players].sort((a, b) => b.score - a.score);
      const winner = sorted[0];

      // ✅ Update DB — games_won + 1
      const user = await database.getCrashUser(winner.id, winner.username);
      if (user) {
        await database.updateCrashUser(winner.id, {
          points: user.points,
          total_words: user.total_words,
          games_played: user.games_played,
          games_won: user.games_won + 1,
          correct_answers: user.correct_answers,
          best_streak: user.best_streak,
        });
      }

      try {
        const msg = await game.channel.messages.fetch(game.messageId);
        await msg.delete();
      } catch {}

      const embed = buildWinnerEmbed(game, game.channel.guild);
      await game.channel.send({
        content: `<@${winner.id}>`,
        embeds: [embed],
      });

      crashGames.delete(game.id);
      return;
    }

    const wordData = WORDS[Math.floor(Math.random() * WORDS.length)];
    const scrambled = scrambleWord(wordData.word);

    game.currentWord = wordData;
    game.scrambled = scrambled;
    game.answered = false;

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const embed = buildGameEmbed(game, game.channel.guild);
    const sent = await game.channel.send({ embeds: [embed] });
    game.messageId = sent.id;

  } catch (err) {
    console.error("❌ Error in nextRound:", err);
  }
}

module.exports = { init };
