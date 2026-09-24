// ============================================
//   MR. WHITE GAME MODULE — v2
//   Voice-based Q&A + Vote
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

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "𝐃𝐄𝐀𝐓𝐇 𝐍𝐎𝐓𝐄 𝐆𝐀𝐌𝐄 / 𝐃𝐄𝐕 𝐁𝐘 𝐀𝐅𝐆𝐇𝐀𝐍𝐈";

const SETUP_GIF = "https://i.imgur.com/1TpdcFI.gif";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_TURN    = 0x3498DB;
const COLOR_VOTE    = 0xFEE75C;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_MRWHITE = 0x9B59B6;

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 20;

// ⏱️ Timeouts
const TURN_TIME = 15 * 1000;           // 15 ثانية لكل لاعب
const TOTAL_TIME = 170 * 1000;         // 2:50 دقيقة
const VOTE_TIME = 60 * 1000;           // 60 ثانية للتصويت

// ============================================
//   WORDS BANK (80 words)
// ============================================
const WORDS = [
  { word: "طوكيو", hint: "عاصمة اليابان" },
  { word: "باريس", hint: "برج إيفل" },
  { word: "القاهرة", hint: "عاصمة مصر" },
  { word: "الرياض", hint: "عاصمة السعودية" },
  { word: "دبي", hint: "مدينة الإمارات" },
  { word: "نيويورك", hint: "مدينة أمريكية" },
  { word: "لندن", hint: "عاصمة بريطانيا" },
  { word: "روما", hint: "عاصمة إيطاليا" },
  { word: "مدريد", hint: "عاصمة إسبانيا" },
  { word: "برلين", hint: "عاصمة ألمانيا" },
  { word: "تونس", hint: "عاصمة تونس" },
  { word: "الجزائر", hint: "عاصمة الجزائر" },
  { word: "الرباط", hint: "عاصمة المغرب" },
  { word: "بيروت", hint: "عاصمة لبنان" },
  { word: "بغداد", hint: "عاصمة العراق" },
  { word: "بيتزا", hint: "أكل إيطالي" },
  { word: "برغر", hint: "أكل أمريكي" },
  { word: "كسكسي", hint: "أكل تونسي" },
  { word: "سوشي", hint: "أكل ياباني" },
  { word: "شاورما", hint: "أكل شرقي" },
  { word: "لازانيا", hint: "طبق إيطالي" },
  { word: "باستا", hint: "معكرونة" },
  { word: "فالافل", hint: "أكل نباتي" },
  { word: "بريك", hint: "أكل تونسي" },
  { word: "حرقة", hint: "طبق تونسي" },
  { word: "أسد", hint: "ملك الغابة" },
  { word: "فيل", hint: "أكبر حيوان بري" },
  { word: "نمر", hint: "مخطط بالأسود والأصفر" },
  { word: "زرافة", hint: "رقبة طويلة" },
  { word: "قرد", hint: "يأكل الموز" },
  { word: "دلفين", hint: "ذكي في البحر" },
  { word: "تمساح", hint: "زاحف خطير" },
  { word: "حصان", hint: "يجرى بسرعة" },
  { word: "جمل", hint: "سفينة الصحراء" },
  { word: "نعامة", hint: "طائر ما يطيرش" },
  { word: "فيسبوك", hint: "موقع تواصل" },
  { word: "آيفون", hint: "هاتف ذكي" },
  { word: "واتساب", hint: "تطبيق دردشة" },
  { word: "يوتيوب", hint: "موقع فيديو" },
  { word: "إنستغرام", hint: "موقع صور" },
  { word: "تيك توك", hint: "فيديوهات قصيرة" },
  { word: "تويتر", hint: "موقع تغريدات" },
  { word: "غوغل", hint: "محرك بحث" },
  { word: "نتفليكس", hint: "أفلام ومسلسلات" },
  { word: "أمازون", hint: "موقع تسوق" },
  { word: "ميسي", hint: "لاعب أرجنتيني" },
  { word: "رونالدو", hint: "لاعب برتغالي" },
  { word: "ريال مدريد", hint: "فريق إسباني" },
  { word: "برشلونة", hint: "فريق إسباني" },
  { word: "كأس العالم", hint: "بطولة كرة القدم" },
  { word: "الأهلي", hint: "فريق مصري" },
  { word: "الترجي", hint: "فريق تونسي" },
  { word: "منتخب تونس", hint: "نسور قرطاج" },
  { word: "أولمبياد", hint: "ألعاب عالمية" },
  { word: "ملاكمة", hint: "رياضة قتالية" },
  { word: "تايتانيك", hint: "فيلم غرق السفينة" },
  { word: "أفاتار", hint: "فيلم أزرق" },
  { word: "الديث نوت", hint: "أنمي عن كتاب قتل" },
  { word: "ناروتو", hint: "أنمي نينجا" },
  { word: "ون بيس", hint: "أنمي قراصنة" },
  { word: "هاري بوتر", hint: "ساحر" },
  { word: "مارفل", hint: "أبطال خارقين" },
  { word: "سبايدرمان", hint: "رجل العنكبوت" },
  { word: "باتمان", hint: "رجل الوطواط" },
  { word: "جوكر", hint: "شرير معروف" },
  { word: "ماينكرافت", hint: "لعبة بلوكات" },
  { word: "فورتنايت", hint: "لعبة Battle Royale" },
  { word: "بابجي", hint: "لعبة موبايل" },
  { word: "فيفا", hint: "لعبة كرة قدم" },
  { word: "جيتا", hint: "لعبة سرقة سيارات" },
  { word: "كول أوف ديوتي", hint: "لعبة حرب" },
  { word: "روبلوكس", hint: "لعبة أطفال" },
  { word: "أمونغ أس", hint: "لعبة خيانة" },
  { word: "كاندي كراش", hint: "لعبة حلويات" },
  { word: "كلاش أوف كلانس", hint: "لعبة استراتيجية" },
  { word: "شمس", hint: "نجم النهار" },
  { word: "قمر", hint: "نجم الليل" },
  { word: "بحر", hint: "ماء مالح" },
  { word: "جبل", hint: "مرتفع" },
  { word: "صحراء", hint: "رمل وحرارة" },
];

// ============================================
//   STORAGE
// ============================================
const mrwhiteGames = new Map();

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

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ============================================
//   🎭 SETUP EMBED
// ============================================
function buildSetupEmbed(game) {
  const playersList = game.players.length > 0
    ? game.players.map((p, i) => `${i + 1}. <@${p.id}>`).join("\n")
    : "*No players yet...*";

  const embed = new EmbedBuilder()
    .setColor(COLOR_DEFAULT)
    .setTitle("🎭 Mr. White Game")
    .setDescription(
      `**Host:** <@${game.hostId}>\n\n` +
      `**Players:** \`${game.players.length}/${MAX_PLAYERS}\`\n` +
      `**Minimum:** \`${MIN_PLAYERS}\` players\n\n` +
      `**📋 How to play:**\n` +
      `• All players get the **same word**\n` +
      `• **Mr. White** gets **no word**\n` +
      `• Each player asks a question in **VC** (15s)\n` +
      `• Total time: **2:50** minutes\n` +
      `• Vote to eliminate Mr. White`
    )
    .addFields({
      name: "👥 Players Joined",
      value: playersList,
    })
    .setImage(SETUP_GIF)
    .setFooter({ text: SIGNATURE });

  return embed;
}

function buildSetupButtons(game) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`mrwhite_join_${game.id}`)
      .setLabel("✅ JOIN")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`mrwhite_start_${game.id}`)
      .setLabel("🟢 START")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(game.players.length < MIN_PLAYERS)
  );
  return [row];
}

// ============================================
//   🎭 ROLE DM EMBED
// ============================================
function buildRoleEmbed(word, isMrWhite) {
  const embed = new EmbedBuilder()
    .setColor(isMrWhite ? COLOR_MRWHITE : COLOR_PLAY)
    .setTitle("🎭 Mr. White — Your Role");

  if (isMrWhite) {
    embed.setDescription(
      `### 🕵️ You are **MR. WHITE**!\n\n` +
      `**You don't have a word.**\n\n` +
      `Blend in, ask questions, and try to survive!\n` +
      `Make them doubt each other.`
    );
  } else {
    embed.setDescription(
      `### 📝 Your secret word is:\n\n` +
      `# **${word.word}**\n\n` +
      `💡 Hint: *${word.hint}*\n\n` +
      `Don't reveal it!`
    );
  }

  embed.setFooter({ text: SIGNATURE });
  return embed;
}

// ============================================
//   🎭 TURN EMBED (Avatar + Username)
// ============================================
function buildTurnEmbed(game, currentPlayer) {
  const turnSecondsLeft = Math.ceil(game.turnTimeLeft / 1000);
  const totalSecondsLeft = Math.ceil(game.totalTimeLeft / 1000);

  const avatarURL = currentPlayer.avatar;

  const embed = new EmbedBuilder()
    .setColor(COLOR_TURN)
    .setAuthor({
      name: `🎤 ${currentPlayer.username} — Your Turn`,
      iconURL: avatarURL,
    })
    .setThumbnail(avatarURL)
    .setTitle("🎭 Ask a Question!")
    .setDescription(
      `**<@${currentPlayer.id}>**, ask anyone a question in **VC**!\n\n` +
      `**⏱️ Your Turn:** \`${turnSecondsLeft}s\`\n` +
      `**⏱️ Game Time:** \`${formatTime(totalSecondsLeft)}\`\n\n` +
      `🎯 Click **SKIP** to move to the next player.`
    )
    .addFields(
      { name: "🎮 Round", value: `\`${game.round}\``, inline: true },
      { name: "👥 Players", value: `\`${game.players.length}\``, inline: true },
      { name: "🎤 Speaking", value: `\`${game.speakingIndex + 1}/${game.players.length}\``, inline: true }
    )
    .setFooter({ text: SIGNATURE });

  return embed;
}

function buildTurnButtons(game) {
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`mrwhite_skip_${game.id}`)
      .setLabel("⏭️ SKIP")
      .setStyle(ButtonStyle.Secondary)
  );
  return [row];
}

// ============================================
//   🗳️ VOTE EMBED
// ============================================
function buildVoteEmbed(game) {
  const voteSecondsLeft = Math.ceil(game.voteTimeLeft / 1000);

  let votesText = "";
  game.players.forEach(p => {
    const vote = game.votes[p.id];
    votesText += `• <@${p.id}> → ${vote ? `<@${vote}>` : "⏳"}\n`;
  });

  const embed = new EmbedBuilder()
    .setColor(COLOR_VOTE)
    .setTitle("🗳️ Vote for Mr. White")
    .setDescription(
      `**⏱️ Time:** \`${voteSecondsLeft}s\`\n\n` +
      `**Click the button below to vote!**\n\n` +
      `**Votes so far:**\n${votesText}`
    )
    .setFooter({ text: SIGNATURE });

  return embed;
}

function buildVoteButtons(game) {
  const buttons = [];
  game.players.forEach((p) => {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`mrwhite_vote_${game.id}_${p.id}`)
        .setLabel(p.username.slice(0, 20))
        .setStyle(ButtonStyle.Secondary)
    );
  });

  const rows = [];
  for (let i = 0; i < buttons.length; i += 5) {
    const row = new ActionRowBuilder();
    const chunk = buttons.slice(i, i + 5);
    chunk.forEach(b => row.addComponents(b));
    rows.push(row);
  }
  return rows;
}

// ============================================
//   🏆 WINNER EMBED
// ============================================
function buildWinnerEmbed(mrWhitePlayer, word, wasEliminated) {
  const avatarURL = mrWhitePlayer.avatar;

  const embed = new EmbedBuilder()
    .setColor(wasEliminated ? COLOR_LOSE : COLOR_MRWHITE)
    .setAuthor({
      name: wasEliminated
        ? `❌ ${mrWhitePlayer.username} — Lost`
        : `🏆 ${mrWhitePlayer.username} — Won`,
      iconURL: avatarURL,
    })
    .setThumbnail(avatarURL)
    .setTitle(wasEliminated ? "❌ Mr. White Lost!" : "🏆 Mr. White Won!")
    .setDescription(
      `**Mr. White was:** <@${mrWhitePlayer.id}>\n\n` +
      `**Real word was:** \`${word}\`\n\n` +
      (wasEliminated
        ? `🕵️ Mr. White was **eliminated** by the vote!\nPlayers win!`
        : `🕵️ Mr. White **survived** the vote!\nMr. White wins!`)
    )
    .setFooter({ text: SIGNATURE })
    .setTimestamp();

  return embed;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎭 Initializing Mr. White module...");

  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      if (message.content.startsWith(`${PREFIX}mrwhite`) ||
          message.content.startsWith(`${PREFIX}mw`)) {
        const gameId = message.id;

        const game = {
          id: gameId,
          hostId: message.author.id,
          hostUser: message.author,
          players: [],
          eliminated: [],
          votes: {},
          phase: "setup",
          mrWhiteId: null,
          word: null,
          channel: message.channel,
          messageId: null,
          // Timers
          turnTimeLeft: TURN_TIME,
          totalTimeLeft: TOTAL_TIME,
          voteTimeLeft: VOTE_TIME,
          turnInterval: null,
          totalInterval: null,
          voteInterval: null,
          // Round Robin
          speakingIndex: 0,
          round: 1,
        };

        mrwhiteGames.set(gameId, game);

        const embed = buildSetupEmbed(game);
        const buttons = buildSetupButtons(game);
        const sent = await message.channel.send({
          embeds: [embed],
          components: buttons,
        });
        game.messageId = sent.id;

        console.log(`🎭 Mr. White game created by ${message.author.username}`);
        return;
      }

    } catch (err) {
      console.error("❌ Error in mrwhite messageCreate:", err);
    }
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== JOIN =====
      if (id.startsWith("mrwhite_join_")) {
        const gameId = id.replace("mrwhite_join_", "");
        const game = mrwhiteGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (game.phase !== "setup") return interaction.reply({ content: "❌ Game started.", ephemeral: true });
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
        });

        const embed = buildSetupEmbed(game);
        const buttons = buildSetupButtons(game);
        await interaction.update({ embeds: [embed], components: buttons });

        console.log(`🎭 ${interaction.user.username} joined`);
        return;
      }

      // ===== START =====
      if (id.startsWith("mrwhite_start_")) {
        const gameId = id.replace("mrwhite_start_", "");
        const game = mrwhiteGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (interaction.user.id !== game.hostId) {
          return interaction.reply({ content: "❌ Only host can start.", ephemeral: true });
        }
        if (game.players.length < MIN_PLAYERS) {
          return interaction.reply({ content: `❌ Need at least ${MIN_PLAYERS} players.`, ephemeral: true });
        }

        game.phase = "play";

        // 🎭 نختارو Mr. White + الكلمة
        const wordData = randomWord();
        const randomIdx = Math.floor(Math.random() * game.players.length);
        game.mrWhiteId = game.players[randomIdx].id;
        game.word = wordData.word;

        // 📩 نبعثو DM لكل لاعب
        for (const player of game.players) {
          const isMrWhite = player.id === game.mrWhiteId;
          const embed = buildRoleEmbed(wordData, isMrWhite);
          try {
            const user = await client.users.fetch(player.id);
            await user.send({ embeds: [embed] });
          } catch {}
        }

        try { await interaction.message.delete(); } catch {}

        // نبداو الجولة
        startTurnPhase(client, game);
        return;
      }

      // ===== SKIP =====
      if (id.startsWith("mrwhite_skip_")) {
        const gameId = id.replace("mrwhite_skip_", "");
        const game = mrwhiteGames.get(gameId);

        if (!game || game.phase !== "play") {
          return interaction.reply({ content: "❌ Not in game.", ephemeral: true });
        }

        const currentPlayer = game.players[game.speakingIndex];
        if (interaction.user.id !== currentPlayer.id) {
          return interaction.reply({
            content: "❌ It's not your turn to skip!",
            ephemeral: true,
          });
        }

        // نعديو للاعب التالي
        nextTurn(client, game);
        return;
      }

      // ===== VOTE =====
      if (id.startsWith("mrwhite_vote_")) {
        const parts = id.split("_");
        const gameId = parts[2];
        const targetId = parts[3];
        const game = mrwhiteGames.get(gameId);

        if (!game || game.phase !== "vote") {
          return interaction.reply({ content: "❌ Not voting phase.", ephemeral: true });
        }

        const voter = game.players.find(p => p.id === interaction.user.id);
        if (!voter) return interaction.reply({ content: "❌ Not a player.", ephemeral: true });
        if (game.votes[voter.id]) return interaction.reply({ content: "❌ Already voted.", ephemeral: true });

        game.votes[voter.id] = targetId;

        // نحدث البانال
        const embed = buildVoteEmbed(game);
        const buttons = buildVoteButtons(game);
        try {
          await interaction.update({ embeds: [embed], components: buttons });
        } catch {}

        // كان كلهم صوّتو → نحسبو
        if (Object.keys(game.votes).length === game.players.length) {
          clearInterval(game.voteInterval);
          game.voteInterval = null;
          setTimeout(() => processVotes(client, game), 1500);
        }
        return;
      }

    } catch (err) {
      console.error("❌ Error in mrwhite interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Mr. White module ready!");
}

// ============================================
//   🎭 START TURN PHASE (Round Robin)
// ============================================
async function startTurnPhase(client, game) {
  try {
    game.phase = "play";
    game.speakingIndex = 0;
    game.round = 1;
    game.turnTimeLeft = TURN_TIME;
    game.totalTimeLeft = TOTAL_TIME;

    // ⏱️ Timer الكلي (2:50)
    game.totalInterval = setInterval(() => {
      game.totalTimeLeft -= 1000;

      if (game.totalTimeLeft <= 0) {
        clearInterval(game.totalInterval);
        clearInterval(game.turnInterval);
        game.totalInterval = null;
        game.turnInterval = null;

        console.log(`⏱️ Total time up → Voting`);
        startVotePhase(client, game);
      }
    }, 1000);

    await sendTurnPanel(client, game);

  } catch (err) {
    console.error("❌ Error in startTurnPhase:", err);
  }
}

// ============================================
//   🎤 SEND TURN PANEL
// ============================================
async function sendTurnPanel(client, game) {
  try {
    const currentPlayer = game.players[game.speakingIndex];
    game.turnTimeLeft = TURN_TIME;

    // نمسحو الرسالة القديمة
    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const embed = buildTurnEmbed(game, currentPlayer);
    const buttons = buildTurnButtons(game);

    const sent = await game.channel.send({
      content: `<@${currentPlayer.id}>`,
      embeds: [embed],
      components: buttons,
    });
    game.messageId = sent.id;

    console.log(`🎤 Turn: ${currentPlayer.username} (Round ${game.round})`);

    // ⏱️ Timer لكل دور (15s)
    if (game.turnInterval) clearInterval(game.turnInterval);
    game.turnInterval = setInterval(async () => {
      game.turnTimeLeft -= 1000;

      // نحدث العداد
      if (game.turnTimeLeft % 3000 === 0 || game.turnTimeLeft <= 5000) {
        try {
          const embed = buildTurnEmbed(game, currentPlayer);
          const msg = await game.channel.messages.fetch(game.messageId);
          await msg.edit({ embeds: [embed] });
        } catch {}
      }

      if (game.turnTimeLeft <= 0) {
        clearInterval(game.turnInterval);
        game.turnInterval = null;
        nextTurn(client, game);
      }
    }, 1000);

  } catch (err) {
    console.error("❌ Error in sendTurnPanel:", err);
  }
}

// ============================================
//   ⏭️ NEXT TURN
// ============================================
async function nextTurn(client, game) {
  try {
    if (game.turnInterval) {
      clearInterval(game.turnInterval);
      game.turnInterval = null;
    }

    // كان الوقت الكلي كمّل → التصويت
    if (game.totalTimeLeft <= 0) {
      return startVotePhase(client, game);
    }

    // اللاعب التالي
    game.speakingIndex++;

    // كان كمّلنا الدورة → دورة جديدة
    if (game.speakingIndex >= game.players.length) {
      game.speakingIndex = 0;
      game.round++;
      console.log(`🔄 New round: ${game.round}`);
    }

    await sendTurnPanel(client, game);

  } catch (err) {
    console.error("❌ Error in nextTurn:", err);
  }
}

// ============================================
//   🗳️ START VOTE PHASE
// ============================================
async function startVotePhase(client, game) {
  try {
    game.phase = "vote";
    game.votes = {};
    game.voteTimeLeft = VOTE_TIME;

    // نمسحو رسالة الدور
    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const embed = buildVoteEmbed(game);
    const buttons = buildVoteButtons(game);

    const sent = await game.channel.send({
      embeds: [embed],
      components: buttons,
    });
    game.messageId = sent.id;

    console.log(`🗳️ Voting started`);

    // ⏱️ Timer التصويت (60s)
    game.voteInterval = setInterval(async () => {
      game.voteTimeLeft -= 1000;

      // نحدث كل 5 ثواني
      if (game.voteTimeLeft % 5000 === 0) {
        try {
          const embed = buildVoteEmbed(game);
          const msg = await game.channel.messages.fetch(game.messageId);
          await msg.edit({ embeds: [embed] });
        } catch {}
      }

      if (game.voteTimeLeft <= 0) {
        clearInterval(game.voteInterval);
        game.voteInterval = null;
        processVotes(client, game);
      }
    }, 1000);

  } catch (err) {
    console.error("❌ Error in startVotePhase:", err);
  }
}

// ============================================
//   🗳️ PROCESS VOTES
// ============================================
async function processVotes(client, game) {
  try {
    // نحسبو الأصوات
    const votesCount = {};
    Object.values(game.votes).forEach(targetId => {
      votesCount[targetId] = (votesCount[targetId] || 0) + 1;
    });

    // نلقاو الأكثر أصوات
    let maxVotes = 0;
    let eliminated = null;
    let tie = false;

    for (const [targetId, count] of Object.entries(votesCount)) {
      if (count > maxVotes) {
        maxVotes = count;
        eliminated = targetId;
        tie = false;
      } else if (count === maxVotes && eliminated) {
        tie = true;
      }
    }

    const mrWhitePlayer = game.players.find(p => p.id === game.mrWhiteId);

    // نمسحو بانال التصويت
    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    // 🎯 نتحققو
    let wasEliminated = false;

    if (!eliminated) {
      // ما فماش أصوات → Mr. White يربح
      wasEliminated = false;
    } else if (tie) {
      // تعادل → Mr. White يربح
      wasEliminated = false;
      console.log(`🤝 Tie → Mr. White wins`);
    } else if (eliminated === game.mrWhiteId) {
      // Mr. White طلع → خسر
      wasEliminated = true;
      console.log(`❌ Mr. White eliminated`);
    } else {
      // لاعب عادي طلع → Mr. White يربح
      wasEliminated = false;
      console.log(`🏆 Mr. White survived`);
    }

    // نبعتو النتيجة
    const embed = buildWinnerEmbed(mrWhitePlayer, game.word, wasEliminated);

    await game.channel.send({
      content: `<@${game.mrWhiteId}>`,
      embeds: [embed],
    });

    console.log(`🏆 Mr. White: ${wasEliminated ? "LOST" : "WON"}`);

    mrwhiteGames.delete(game.id);

  } catch (err) {
    console.error("❌ Error in processVotes:", err);
  }
}

module.exports = { init };
