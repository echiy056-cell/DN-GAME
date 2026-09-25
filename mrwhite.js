// ============================================
//   MR. WHITE GAME MODULE — English
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
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const SETUP_GIF = "https://i.imgur.com/1TpdcFI.gif";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_VOTE    = 0xFEE75C;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_MRWHITE = 0x9B59B6;

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 20;

const START_DELAY = 10 * 1000;
const QUESTIONS_TIME = 3 * 60 * 1000;  // 3:00 minutes total
const QUESTION_TURN_TIME = 30;          // 30s per player turn
const VOTE_TIME = 30 * 1000;
const GUESS_TIME = 30 * 1000;

// ============================================
//   WORDS BANK (English)
// ============================================
const WORDS = [
  { word: "Tokyo", hint: "Capital of Japan" },
  { word: "Paris", hint: "Eiffel Tower" },
  { word: "Cairo", hint: "Capital of Egypt" },
  { word: "Riyadh", hint: "Capital of Saudi Arabia" },
  { word: "Dubai", hint: "City in UAE" },
  { word: "New York", hint: "American city" },
  { word: "London", hint: "Capital of UK" },
  { word: "Rome", hint: "Capital of Italy" },
  { word: "Madrid", hint: "Capital of Spain" },
  { word: "Berlin", hint: "Capital of Germany" },
  { word: "Tunis", hint: "Capital of Tunisia" },
  { word: "Algiers", hint: "Capital of Algeria" },
  { word: "Rabat", hint: "Capital of Morocco" },
  { word: "Beirut", hint: "Capital of Lebanon" },
  { word: "Baghdad", hint: "Capital of Iraq" },
  { word: "Pizza", hint: "Italian food" },
  { word: "Burger", hint: "American food" },
  { word: "Couscous", hint: "Tunisian food" },
  { word: "Sushi", hint: "Japanese food" },
  { word: "Shawarma", hint: "Middle Eastern food" },
  { word: "Lasagna", hint: "Italian dish" },
  { word: "Pasta", hint: "Macaroni" },
  { word: "Falafel", hint: "Vegetarian food" },
  { word: "Brik", hint: "Tunisian food" },
  { word: "Harissa", hint: "Tunisian dish" },
  { word: "Lion", hint: "King of the jungle" },
  { word: "Elephant", hint: "Largest land animal" },
  { word: "Tiger", hint: "Black and yellow stripes" },
  { word: "Giraffe", hint: "Long neck" },
  { word: "Monkey", hint: "Eats bananas" },
  { word: "Dolphin", hint: "Smart in the sea" },
  { word: "Crocodile", hint: "Dangerous reptile" },
  { word: "Horse", hint: "Runs fast" },
  { word: "Camel", hint: "Ship of the desert" },
  { word: "Ostrich", hint: "Bird that can't fly" },
  { word: "Facebook", hint: "Social media" },
  { word: "iPhone", hint: "Smartphone" },
  { word: "WhatsApp", hint: "Chat app" },
  { word: "YouTube", hint: "Video site" },
  { word: "Instagram", hint: "Photo site" },
  { word: "TikTok", hint: "Short videos" },
  { word: "Twitter", hint: "Tweets site" },
  { word: "Google", hint: "Search engine" },
  { word: "Netflix", hint: "Movies and series" },
  { word: "Amazon", hint: "Shopping site" },
  { word: "Messi", hint: "Argentine player" },
  { word: "Ronaldo", hint: "Portuguese player" },
  { word: "Real Madrid", hint: "Spanish team" },
  { word: "Barcelona", hint: "Spanish team" },
  { word: "World Cup", hint: "Football tournament" },
  { word: "Al Ahly", hint: "Egyptian team" },
  { word: "Esperance", hint: "Tunisian team" },
  { word: "Tunisia Team", hint: "Eagles of Carthage" },
  { word: "Olympics", hint: "Global games" },
  { word: "Boxing", hint: "Combat sport" },
  { word: "Titanic", hint: "Sinking ship movie" },
  { word: "Avatar", hint: "Blue movie" },
  { word: "Death Note", hint: "Anime about a killing book" },
  { word: "Naruto", hint: "Ninja anime" },
  { word: "One Piece", hint: "Pirate anime" },
  { word: "Harry Potter", hint: "Wizard" },
  { word: "Marvel", hint: "Superheroes" },
  { word: "Spider-Man", hint: "Web hero" },
  { word: "Batman", hint: "Dark Knight" },
  { word: "Joker", hint: "Famous villain" },
  { word: "Minecraft", hint: "Blocks game" },
  { word: "Fortnite", hint: "Battle Royale game" },
  { word: "PUBG", hint: "Mobile game" },
  { word: "FIFA", hint: "Football game" },
  { word: "GTA", hint: "Car theft game" },
  { word: "Call of Duty", hint: "War game" },
  { word: "Roblox", hint: "Kids game" },
  { word: "Among Us", hint: "Betrayal game" },
  { word: "Candy Crush", hint: "Candy game" },
  { word: "Clash of Clans", hint: "Strategy game" },
  { word: "Sun", hint: "Day star" },
  { word: "Moon", hint: "Night star" },
  { word: "Sea", hint: "Salt water" },
  { word: "Mountain", hint: "High land" },
  { word: "Desert", hint: "Sand and heat" },
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
      `• Ask questions in turns (30s each)\n` +
      `• Vote to eliminate Mr. White\n` +
      `• Mr. White wins if he survives OR guesses the word`
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
//   ⏱️ STARTING PANEL (Countdown)
// ============================================
function buildStartingContainer(game, secondsLeft) {
  const container = new ContainerBuilder().setAccentColor(COLOR_MRWHITE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎭 Game Starting...")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📩 Check your DMs!**\n\n` +
      `Each player has received their role.\n` +
      `Mr. White doesn't have a word.\n\n` +
      `**⏱️ Starting in:** \`${secondsLeft}s\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  let playersText = "";
  game.players.forEach((p, i) => {
    playersText += `${i + 1}. <@${p.id}>\n`;
  });

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**👥 Players:**\n${playersText}`)
  );

  addSignature(container);

  return container;
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
      `Blend in and ask vague questions.\n` +
      `Try to survive and guess the word!`
    );
  } else {
    embed.setDescription(
      `### 📝 Your secret word is:\n\n` +
      `# **${word.word}**\n\n` +
      `💡 Hint: *${word.hint}*\n\n` +
      `Describe it without revealing it!`
    );
  }

  embed.setFooter({ text: SIGNATURE });

  return embed;
}

// ============================================
//   ❓ QUESTIONS PANEL (Turn-based, 30s each)
// ============================================
function buildQuestionContainer(game, currentPlayer, turnSecondsLeft, totalSecondsLeft) {
  const container = new ContainerBuilder().setAccentColor(COLOR_PLAY);

  const totalMins = Math.floor(totalSecondsLeft / 60);
  const totalSecs = totalSecondsLeft % 60;
  const totalStr = `${totalMins}:${totalSecs.toString().padStart(2, "0")}`;

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## ❓ Question Phase")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎤 It's <@${currentPlayer.id}>'s turn to ask!**\n\n` +
      `Ask any player a question about the word.\n` +
      `When you're done, click **NEXT** to pass the turn.\n\n` +
      `**⏱️ Your turn:** \`${turnSecondsLeft}s\`\n` +
      `**⏱️ Total time left:** \`${totalStr}\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  let playersText = "";
  game.players.forEach((p, i) => {
    const isCurrent = p.id === currentPlayer.id;
    playersText += `${i + 1}. <@${p.id}>${isCurrent ? " 🎤" : ""}\n`;
  });

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`**👥 Players:**\n${playersText}`)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`mrwhite_next_${game.id}`)
      .setLabel("➡️ NEXT")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🗳️ VOTE PANEL
// ============================================
function buildVoteContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_VOTE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🗳️ Vote for Mr. White")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**⏱️ Time:** \`30 seconds\`\n\n` +
      `**Votes:**`
    )
  );

  let votesText = "";
  game.players.forEach(p => {
    const vote = game.votes[p.id];
    votesText += `• <@${p.id}> → ${vote ? `<@${vote}>` : "⏳"}\n`;
  });

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(votesText)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const buttons = [];
  game.players.forEach((p) => {
    buttons.push(
      new ButtonBuilder()
        .setCustomId(`mrwhite_vote_${game.id}_${p.id}`)
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
//   🎭 MR WHITE REVEAL PANEL
// ============================================
function buildRevealContainer(game, eliminated) {
  const container = new ContainerBuilder().setAccentColor(COLOR_MRWHITE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎭 Mr. White Revealed!")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Eliminated:** <@${eliminated.id}>\n\n` +
      `They were **Mr. White**! 🕵️`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎯 FINAL CHANCE:**\n` +
      `Mr. White, check your DMs to guess the word!\n\n` +
      `**⏱️ Time:** \`30 seconds\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎯 GUESS PANEL (DM)
// ============================================
function buildGuessContainer(game, options) {
  const container = new ContainerBuilder().setAccentColor(COLOR_MRWHITE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎯 Guess the Word")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**You are Mr. White!**\n\n` +
      `Choose the correct word to **WIN**.\n` +
      `If you guess wrong, the **players win**.\n\n` +
      `**⏱️ Time:** \`30 seconds\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const buttons = options.map((opt, i) => {
    return new ButtonBuilder()
      .setCustomId(`mrwhite_guess_${game.id}_${i}`)
      .setLabel(opt.word.slice(0, 20))
      .setStyle(ButtonStyle.Secondary);
  });

  const row = new ActionRowBuilder();
  buttons.forEach(b => row.addComponents(b));
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🏆 WINNER PANEL
// ============================================
function buildWinnerContainer(winnerType, mrWhite, word, guessedWord) {
  const isWhiteWinner = winnerType === "mrwhite";

  const container = new ContainerBuilder().setAccentColor(
    isWhiteWinner ? COLOR_MRWHITE : COLOR_WIN
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      isWhiteWinner ? "## 🕵️ Mr. White WINS!" : "## 🏆 Players WIN!"
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  if (isWhiteWinner) {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `🕵️ <@${mrWhite.id}> was **Mr. White** and won!\n\n` +
        `**Real word:** \`${word}\`\n` +
        `**Mr. White guessed:** \`${guessedWord || word}\``
      )
    );
  } else {
    container.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `🎉 **All players win!**\n\n` +
        `**Mr. White:** <@${mrWhite.id}> was eliminated!\n` +
        `**Real word:** \`${word}\`\n` +
        `**Mr. White guessed:** \`${guessedWord || "nothing"}\``
      )
    );
  }

  addSignature(container);

  return container;
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
          votes: {},
          eliminated: [],
          phase: "setup",
          mrWhiteId: null,
          word: null,
          channel: message.channel,
          messageId: null,
          questionsTimer: null,
          questionsInterval: null,
          turnTimer: null,
          turnInterval: null,
          turnSecondsLeft: 30,
          questionsSecondsLeft: QUESTIONS_TIME / 1000,
          voteTimer: null,
          guessTimer: null,
          guessOptions: [],
          countdownInterval: null,
          currentTurnIndex: 0,
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
        if (game.phase !== "setup") return interaction.reply({ content: "❌ Game already started.", ephemeral: true });
        if (game.players.find(p => p.id === interaction.user.id)) {
          return interaction.reply({ content: "❌ Already joined.", ephemeral: true });
        }
        if (game.players.length >= MAX_PLAYERS) {
          return interaction.reply({ content: "❌ Game full.", ephemeral: true });
        }

        game.players.push({
          id: interaction.user.id,
          username: interaction.user.username,
        });

        const embed = buildSetupEmbed(game);
        const buttons = buildSetupButtons(game);
        await interaction.update({
          embeds: [embed],
          components: buttons,
        });

        console.log(`🎭 ${interaction.user.username} joined Mr. White`);
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
          return interaction.reply({
            content: `❌ Need at least ${MIN_PLAYERS} players.`,
            ephemeral: true,
          });
        }

        // 🎭 نختارو الكلمة
        const wordData = randomWord();
        game.word = wordData.word;

        // 🕵️ الهوست هو Mr. White دائماً
        game.mrWhiteId = game.hostId;

        // 📩 نبعثو DM لكل لاعب
        let dmSent = 0;
        for (const player of game.players) {
          const isMrWhite = player.id === game.mrWhiteId;
          const embed = buildRoleEmbed(wordData, isMrWhite);

          try {
            const user = await client.users.fetch(player.id);
            await user.send({ embeds: [embed] });
            dmSent++;
          } catch (err) {
            console.log(`❌ Failed DM to ${player.username}`);
          }
        }

        game.phase = "starting";

        const startingContainer = buildStartingContainer(game, 10);

        try { await interaction.message.delete(); } catch {}

        const startingMsg = await interaction.channel.send({
          components: [startingContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        game.messageId = startingMsg.id;

        console.log(`🎭 Game starting... DM sent to: ${dmSent}/${game.players.length}`);
        console.log(`🕵️ Mr. White = ${game.hostUser.username}`);
        console.log(`⏱️ Starting in ${START_DELAY / 1000}s`);

        let secondsLeft = START_DELAY / 1000;
        game.countdownInterval = setInterval(async () => {
          secondsLeft--;

          if (secondsLeft <= 0) {
            clearInterval(game.countdownInterval);
            game.countdownInterval = null;
            startQuestionsPhase(client, game);
            return;
          }

          try {
            const container = buildStartingContainer(game, secondsLeft);
            const msg = await game.channel.messages.fetch(game.messageId);
            await msg.edit({
              components: [container],
              flags: MessageFlags.IsComponentsV2,
            });
          } catch (err) {
            console.error("❌ Error editing countdown:", err);
          }
        }, 1000);

        return;
      }

      // ===== NEXT (Questions Phase) =====
      if (id.startsWith("mrwhite_next_")) {
        const gameId = id.replace("mrwhite_next_", "");
        const game = mrwhiteGames.get(gameId);

        if (!game || game.phase !== "questions") {
          return interaction.reply({ content: "❌ Not in questions phase.", ephemeral: true });
        }

        const currentPlayer = game.players[game.currentTurnIndex];
        if (interaction.user.id !== currentPlayer.id) {
          return interaction.reply({
            content: "❌ It's not your turn!",
            ephemeral: true,
          });
        }

        // نعدّيو للاعب اللي بعدو
        game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;

        // نحيّو الـturn timer القديم
        if (game.turnInterval) clearInterval(game.turnInterval);

        await interaction.deferUpdate().catch(() => {});

        // نبعثو panel جديد ونمسحو القديم
        await sendNewQuestionPanel(client, game);

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
        if (voter.id === targetId) {
          return interaction.reply({ content: "❌ Can't vote for yourself.", ephemeral: true });
        }

        game.votes[voter.id] = targetId;

        const container = buildVoteContainer(game);
        try {
          const msg = await game.channel.messages.fetch(game.messageId);
          await msg.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch {}

        await interaction.reply({
          content: `✅ Vote registered. (${Object.keys(game.votes).length}/${game.players.length})`,
          ephemeral: true,
        });

        if (Object.keys(game.votes).length === game.players.length) {
          clearTimeout(game.voteTimer);
          setTimeout(() => processVotes(client, game), 1500);
        }

        return;
      }

      // ===== GUESS (Mr. White in DM) =====
      if (id.startsWith("mrwhite_guess_")) {
        const parts = id.split("_");
        const gameId = parts[2];
        const optionIdx = parseInt(parts[3], 10);
        const game = mrwhiteGames.get(gameId);

        if (!game || game.phase !== "guess") {
          return interaction.reply({ content: "❌ Not guess phase.", ephemeral: true });
        }
        if (interaction.user.id !== game.mrWhiteId) {
          return interaction.reply({ content: "❌ Only Mr. White can guess.", ephemeral: true });
        }

        if (game.guessTimer) clearTimeout(game.guessTimer);

        const guessedWord = game.guessOptions[optionIdx].word;
        const isCorrect = guessedWord === game.word;

        await interaction.deferUpdate().catch(() => {});

        const container = buildWinnerContainer(
          isCorrect ? "mrwhite" : "players",
          { id: game.mrWhiteId },
          game.word,
          guessedWord
        );

        // نبعثو النتيجة في الشات العام
        await game.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🎭 Mr. White guessed: ${guessedWord} — ${isCorrect ? "WIN" : "LOSE"}`);

        mrwhiteGames.delete(game.id);
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
//   ❓ START QUESTIONS PHASE (3:00 min total, 30s per turn)
// ============================================
async function startQuestionsPhase(client, game) {
  try {
    game.phase = "questions";
    game.currentTurnIndex = 0;
    game.questionsSecondsLeft = QUESTIONS_TIME / 1000;

    // نمسحو panel الـcountdown
    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    // نبعثو أول panel
    const currentPlayer = game.players[0];
    game.turnSecondsLeft = QUESTION_TURN_TIME;

    const container = buildQuestionContainer(
      game,
      currentPlayer,
      game.turnSecondsLeft,
      game.questionsSecondsLeft
    );
    const newMsg = await game.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    game.messageId = newMsg.id;

    console.log(`❓ Questions phase started (${game.questionsSecondsLeft}s total)`);

    // نبداو الـtotal timer (3 دقائق)
    game.questionsInterval = setInterval(() => {
      game.questionsSecondsLeft--;

      if (game.questionsSecondsLeft <= 0) {
        clearInterval(game.questionsInterval);
        game.questionsInterval = null;
        if (game.turnInterval) clearInterval(game.turnInterval);
        game.turnInterval = null;
        startVotePhase(client, game);
        return;
      }
    }, 1000);

    // نبداو الـturn timer (30s للاعب الأول)
    startTurnTimer(client, game);

  } catch (err) {
    console.error("❌ Error in startQuestionsPhase:", err);
  }
}

// ============================================
//   ⏱️ TURN TIMER (30s per player)
// ============================================
function startTurnTimer(client, game) {
  if (game.turnInterval) clearInterval(game.turnInterval);

  game.turnSecondsLeft = QUESTION_TURN_TIME;

  game.turnInterval = setInterval(async () => {
    game.turnSecondsLeft--;

    if (game.turnSecondsLeft <= 0) {
      clearInterval(game.turnInterval);
      game.turnInterval = null;

      if (game.phase !== "questions") return;

      // نعدّيو للاعب اللي بعدو
      game.currentTurnIndex = (game.currentTurnIndex + 1) % game.players.length;

      // نبعثو panel جديد
      await sendNewQuestionPanel(client, game);
      return;
    }

    // نحدّثو الـpanel بالوقت
    if (game.phase !== "questions") return;
    try {
      const currentP = game.players[game.currentTurnIndex];
      const c = buildQuestionContainer(
        game,
        currentP,
        game.turnSecondsLeft,
        game.questionsSecondsLeft
      );
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.edit({
        components: [c],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch {}
  }, 1000);
}

// ============================================
//   📤 SEND NEW QUESTION PANEL (delete old, send new)
// ============================================
async function sendNewQuestionPanel(client, game) {
  if (game.phase !== "questions") return;

  // نمسحو الـpanel القديم
  try {
    const oldMsg = await game.channel.messages.fetch(game.messageId);
    await oldMsg.delete();
  } catch {}

  const currentPlayer = game.players[game.currentTurnIndex];
  game.turnSecondsLeft = QUESTION_TURN_TIME;

  const container = buildQuestionContainer(
    game,
    currentPlayer,
    game.turnSecondsLeft,
    game.questionsSecondsLeft
  );
  const newMsg = await game.channel.send({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
  game.messageId = newMsg.id;

  // نبداو turn timer جديد
  startTurnTimer(client, game);
}

// ============================================
//   🗳️ START VOTE PHASE
// ============================================
async function startVotePhase(client, game) {
  try {
    game.phase = "vote";
    game.votes = {};

    // نمسحو أي panel قديم
    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const container = buildVoteContainer(game);
    const newMsg = await game.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    game.messageId = newMsg.id;

    console.log(`🗳️ Voting started`);

    game.voteTimer = setTimeout(() => {
      if (game.phase === "vote") {
        processVotes(client, game);
      }
    }, VOTE_TIME);

  } catch (err) {
    console.error("❌ Error in startVotePhase:", err);
  }
}

// ============================================
//   🗳️ PROCESS VOTES
// ============================================
async function processVotes(client, game) {
  try {
    const votesCount = {};
    Object.values(game.votes).forEach(targetId => {
      votesCount[targetId] = (votesCount[targetId] || 0) + 1;
    });

    let maxVotes = 0;
    let eliminated = null;

    for (const [targetId, count] of Object.entries(votesCount)) {
      if (count > maxVotes) {
        maxVotes = count;
        eliminated = targetId;
      }
    }

    if (!eliminated) {
      const randomIdx = Math.floor(Math.random() * game.players.length);
      eliminated = game.players[randomIdx].id;
    }

    const eliminatedPlayer = game.players.find(p => p.id === eliminated);

    console.log(`🗳️ Eliminated: ${eliminatedPlayer.username}`);

    try {
      await game.channel.send({
        content: `🗳️ **<@${eliminated}>** was eliminated with **${maxVotes}** votes!`,
      });
    } catch {}

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    if (eliminated === game.mrWhiteId) {
      game.phase = "guess";

      const revealContainer = buildRevealContainer(game, { id: game.mrWhiteId });
      const revealMsg = await game.channel.send({
        components: [revealContainer],
        flags: MessageFlags.IsComponentsV2,
      });
      game.messageId = revealMsg.id;

      const wrongWords = WORDS
        .filter(w => w.word !== game.word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const correctWord = WORDS.find(w => w.word === game.word);
      const options = [...wrongWords, correctWord].sort(() => Math.random() - 0.5);

      game.guessOptions = options;

      // نبعثو الguess panel في DM بعد 3 ثواني
      setTimeout(async () => {
        try {
          const guessContainer = buildGuessContainer(game, options);
          const user = await client.users.fetch(game.mrWhiteId);
          await user.send({
            components: [guessContainer],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch (err) {
          console.error("❌ Error sending guess panel DM:", err);
        }

        game.guessTimer = setTimeout(() => {
          if (game.phase === "guess") {
            handleWrongGuess(client, game, null);
          }
        }, GUESS_TIME);
      }, 3000);

    } else {
      game.players = game.players.filter(p => p.id !== eliminated);
      game.eliminated.push(eliminatedPlayer);

      if (game.players.length <= 2) {
        try {
          const msg = await game.channel.messages.fetch(game.messageId);
          await msg.delete();
        } catch {}

        const container = buildWinnerContainer(
          "mrwhite",
          { id: game.mrWhiteId },
          game.word,
          null
        );

        await game.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🎭 Mr. White wins by survival!`);
        mrwhiteGames.delete(game.id);
        return;
      }

      // نعاودو الدورة من Questions Phase
      try {
        const msg = await game.channel.messages.fetch(game.messageId);
        await msg.delete();
      } catch {}

      startQuestionsPhase(client, game);
    }

  } catch (err) {
    console.error("❌ Error in processVotes:", err);
  }
}

// ============================================
//   ❌ WRONG GUESS
// ============================================
async function handleWrongGuess(client, game, guessedWord) {
  try {
    const container = buildWinnerContainer(
      "players",
      { id: game.mrWhiteId },
      game.word,
      guessedWord
    );

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    await game.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    console.log(`🎭 Players win! Mr. White failed`);
    mrwhiteGames.delete(game.id);

  } catch (err) {
    console.error("❌ Error in handleWrongGuess:", err);
  }
}

module.exports = { init };
