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
const DESCRIBE_TIME = 60 * 1000;
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
      `• Each player describes with **ONE word**\n` +
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
//   🎭 ROLE DM EMBED (English)
// ============================================
function buildRoleEmbed(word, isMrWhite) {
  const embed = new EmbedBuilder()
    .setColor(isMrWhite ? COLOR_MRWHITE : COLOR_PLAY)
    .setTitle("🎭 Mr. White — Your Role");

  if (isMrWhite) {
    embed.setDescription(
      `### 🕵️ You are **MR. WHITE**!\n\n` +
      `**You don't have a word.**\n\n` +
      `Blend in and describe something vague.\n` +
      `Try to survive and guess the word!`
    );
  } else {
    embed.setDescription(
      `### 📝 Your secret word is:\n\n` +
      `# **${word.word}**\n\n` +
      `💡 Hint: *${word.hint}*\n\n` +
      `Describe it with **ONE word** without revealing it!`
    );
  }

  embed.setFooter({ text: SIGNATURE });

  return embed;
}

// ============================================
//   🎭 DESCRIBE PANEL
// ============================================
function buildDescribeContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_PLAY);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎭 Describe Your Word")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Players:** ${game.players.length}\n\n` +
      `Type your **ONE word** description in the chat.\n\n` +
      `**⏱️ Time:** \`60 seconds\``
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  let playersText = "";
  game.players.forEach((p, i) => {
    const desc = game.descriptions[p.id];
    playersText += `${i + 1}. <@${p.id}> — ${desc ? `\`${desc}\`` : "⏳ *waiting...*"}\n`;
  });

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(playersText)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `✅ **Done with your description? Click READY!**`
    )
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`mrwhite_ready_${game.id}`)
      .setLabel("✅ READY")
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
      `Mr. White, guess the word!\n\n` +
      `**⏱️ Time:** \`30 seconds\``
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   🎯 GUESS PANEL
// ============================================
function buildGuessContainer(game, options) {
  const container = new ContainerBuilder().setAccentColor(COLOR_MRWHITE);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎯 Mr. White — Guess the Word")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Mr. White** <@${game.mrWhiteId}>, choose the correct word!\n\n` +
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
          descriptions: {},
          votes: {},
          ready: [],
          eliminated: [],
          phase: "setup",
          mrWhiteId: null,
          word: null,
          channel: message.channel,
          messageId: null,
          describeTimer: null,
          voteTimer: null,
          guessTimer: null,
          guessOptions: [],
          countdownInterval: null,
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

      // ===== الوصف =====
      for (const [gameId, game] of mrwhiteGames.entries()) {
        if (game.phase !== "describe") continue;
        if (game.channel.id !== message.channel.id) continue;

        const player = game.players.find(p => p.id === message.author.id);
        if (!player) continue;
        if (game.descriptions[player.id]) continue;

        const desc = message.content.trim().split(/\s+/)[0];
        if (!desc || desc.length < 1) continue;

        game.descriptions[player.id] = desc;

        const container = buildDescribeContainer(game);
        try {
          const msg = await game.channel.messages.fetch(game.messageId);
          await msg.edit({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
          });
        } catch {}

        try { await message.delete(); } catch {}

        if (Object.keys(game.descriptions).length === game.players.length) {
          clearTimeout(game.describeTimer);
          setTimeout(() => startVotePhase(client, game), 1500);
        }

        break;
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

        // 🎭 نختارو Mr. White + الكلمة
        const wordData = randomWord();
        const randomIndex = Math.floor(Math.random() * game.players.length);
        game.mrWhiteId = game.players[randomIndex].id;
        game.word = wordData.word;

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

        // ⏱️ بانال البداية
        const startingContainer = buildStartingContainer(game, 10);

        try { await interaction.message.delete(); } catch {}

        const startingMsg = await interaction.channel.send({
          components: [startingContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        game.messageId = startingMsg.id;

        console.log(`🎭 Game starting... DM sent to: ${dmSent}/${game.players.length}`);
        console.log(`⏱️ Starting in ${START_DELAY / 1000}s`);

        // ⏱️ Countdown
        let secondsLeft = START_DELAY / 1000;
        game.countdownInterval = setInterval(async () => {
          secondsLeft--;

          if (secondsLeft <= 0) {
            clearInterval(game.countdownInterval);
            game.countdownInterval = null;
            startActualGame(client, game);
            return;
          }

          try {
            const container = buildStartingContainer(game, secondsLeft);
            const msg = await game.channel.messages.fetch(game.messageId);
            await msg.edit({
              components: [container],
              flags: MessageFlags.IsComponentsV2,
            });
          } catch {}
        }, 1000);

        return;
      }

      // ===== READY =====
      if (id.startsWith("mrwhite_ready_")) {
        const gameId = id.replace("mrwhite_ready_", "");
        const game = mrwhiteGames.get(gameId);

        if (!game || game.phase !== "describe") {
          return interaction.reply({ content: "❌ Not in describe phase.", ephemeral: true });
        }

        const player = game.players.find(p => p.id === interaction.user.id);
        if (!player) {
          return interaction.reply({ content: "❌ Not a player.", ephemeral: true });
        }
        if (!game.descriptions[player.id]) {
          return interaction.reply({
            content: "❌ Type your word first!",
            ephemeral: true,
          });
        }
        if (game.ready.includes(player.id)) {
          return interaction.reply({ content: "✅ Already ready.", ephemeral: true });
        }

        game.ready.push(player.id);

        await interaction.reply({
          content: `✅ Ready! (${game.ready.length}/${game.players.length})`,
          ephemeral: true,
        });

        if (game.ready.length === game.players.length) {
          clearTimeout(game.describeTimer);
          startVotePhase(client, game);
        }

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

      // ===== GUESS =====
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

        clearTimeout(game.guessTimer);

        const guessedWord = game.guessOptions[optionIdx].word;
        const isCorrect = guessedWord === game.word;

        try { await interaction.message.delete(); } catch {}

        const container = buildWinnerContainer(
          isCorrect ? "mrwhite" : "players",
          { id: game.mrWhiteId },
          game.word,
          guessedWord
        );

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
//   🎮 START ACTUAL GAME
// ============================================
async function startActualGame(client, game) {
  try {
    game.phase = "describe";
    game.descriptions = {};
    game.votes = {};
    game.ready = [];

    try {
      const msg = await game.channel.messages.fetch(game.messageId);
      await msg.delete();
    } catch {}

    const container = buildDescribeContainer(game);
    const newMsg = await game.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    game.messageId = newMsg.id;

    console.log(`🎭 Game started! Round 1`);

    game.describeTimer = setTimeout(() => {
      if (game.phase === "describe") {
        startVotePhase(client, game);
      }
    }, DESCRIBE_TIME);

  } catch (err) {
    console.error("❌ Error in startActualGame:", err);
  }
}

// ============================================
//   🗳️ START VOTE PHASE
// ============================================
async function startVotePhase(client, game) {
  try {
    game.phase = "vote";
    game.votes = {};

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

      setTimeout(async () => {
        try {
          const guessContainer = buildGuessContainer(game, options);
          const newMsg = await game.channel.send({
            components: [guessContainer],
            flags: MessageFlags.IsComponentsV2,
          });
          game.messageId = newMsg.id;
        } catch (err) {
          console.error("❌ Error sending guess panel:", err);
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

      game.phase = "describe";
      game.descriptions = {};
      game.votes = {};
      game.ready = [];

      try {
        const msg = await game.channel.messages.fetch(game.messageId);
        await msg.delete();
      } catch {}

      const container = buildDescribeContainer(game);
      const newMsg = await game.channel.send({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
      game.messageId = newMsg.id;

      console.log(`🎭 Game continues! Remaining: ${game.players.length}`);

      game.describeTimer = setTimeout(() => {
        if (game.phase === "describe") {
          startVotePhase(client, game);
        }
      }, DESCRIBE_TIME);
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
