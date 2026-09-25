// ============================================
//   RAMI TUNISIEN GAME MODULE
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
  MessageFlags,
} = require("discord.js");

// ============================================
//   CONFIG
// ============================================
const PREFIX = ".";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const COLOR_DEFAULT = 0x2b2d31;
const COLOR_PLAY    = 0x5865F2;
const COLOR_WIN     = 0x57F287;
const COLOR_LOSE    = 0xED4245;
const COLOR_POINTS  = 0xFEE75C;

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 4;
const OWNER_CARDS = 15;
const OTHER_CARDS = 14;

// ============================================
//   CARDS SYSTEM
// ============================================
const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function createDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return shuffle(deck);
}

function shuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cardToText(card) {
  return `${card.value}${card.suit}`;
}

function cardToId(card) {
  return `${card.value}${card.suit}`;
}

function cardToValue(card) {
  const idx = VALUES.indexOf(card.value);
  return idx === 0 ? 14 : idx + 1; // A = 14 (للترتيب)
}

function isRedSuit(suit) {
  return suit === "♥" || suit === "♦";
}

// ============================================
//   SET/RUN VERIFICATION
// ============================================

/**
 * يحاول يلقى تقسيم للبطاقات في Sets و Runs
 * يرجع: true كان كل البطاقات منظّمين
 */
function canArrangeAll(cards) {
  if (cards.length === 0) return true;
  if (cards.length % 3 !== 0 && cards.length % 4 !== 0) {
    // عدد فردي غير 3-4 مرات ممكن يكون Set
    // نكمل التحقق عادي
  }

  // استخدام BFS للبحث عن حل
  return tryArrange([...cards], []);
}

function tryArrange(remaining, usedGroups) {
  if (remaining.length === 0) return true;
  if (remaining.length < 3) return false;

  // نحاول كل تركيبة ممكنة
  // 1. نجرب Run
  const runs = findRuns(remaining);
  for (const run of runs) {
    const newRemaining = removeCards(remaining, run);
    if (tryArrange(newRemaining, [...usedGroups, run])) return true;
  }

  // 2. نجرب Set
  const sets = findSets(remaining);
  for (const set of sets) {
    const newRemaining = removeCards(remaining, set);
    if (tryArrange(newRemaining, [...usedGroups, set])) return true;
  }

  return false;
}

function removeCards(remaining, toRemove) {
  const result = [...remaining];
  for (const card of toRemove) {
    const idx = result.findIndex(c => c.suit === card.suit && c.value === card.value);
    if (idx !== -1) result.splice(idx, 1);
  }
  return result;
}

/**
 * يلقى كل الـ Runs الممكنة (3+ متتالية بنفس اللون)
 */
function findRuns(cards) {
  const runs = [];

  for (const suit of SUITS) {
    const suitCards = cards.filter(c => c.suit === suit);
    if (suitCards.length < 3) continue;

    // نرتب حسب القيمة
    const sorted = [...suitCards].sort((a, b) => cardToValue(a) - cardToValue(b));

    // نلقاو التسلسلات
    for (let start = 0; start < sorted.length - 2; start++) {
      for (let end = start + 2; end < sorted.length; end++) {
        const seq = sorted.slice(start, end + 1);
        // نتحقق أنها متتالية
        let valid = true;
        for (let i = 1; i < seq.length; i++) {
          if (cardToValue(seq[i]) !== cardToValue(seq[i - 1]) + 1) {
            valid = false;
            break;
          }
        }
        if (valid) {
          runs.push(seq);
        }
      }
    }
  }

  // نرتبهم من الأطول للأقصر
  return runs.sort((a, b) => b.length - a.length);
}

/**
 * يلقى كل الـ Sets الممكنة (3-4 نفس القيمة بألوان مختلفة)
 */
function findSets(cards) {
  const sets = [];

  // نجمع حسب القيمة
  const byValue = {};
  for (const card of cards) {
    if (!byValue[card.value]) byValue[card.value] = [];
    byValue[card.value].push(card);
  }

  for (const value in byValue) {
    const sameValue = byValue[value];
    // نتحقق أن الألوان مختلفة
    const uniqueSuits = {};
    for (const c of sameValue) {
      uniqueSuits[c.suit] = c;
    }
    const uniqueCards = Object.values(uniqueSuits);

    if (uniqueCards.length >= 3) {
      // كل التركيبات الممكنة (3 أو 4)
      if (uniqueCards.length === 3) {
        sets.push(uniqueCards);
      } else if (uniqueCards.length === 4) {
        // نزيد 3-set و 4-set
        for (let i = 0; i < 4; i++) {
          sets.push(uniqueCards.filter((_, idx) => idx !== i));
        }
        sets.push(uniqueCards);
      }
    }
  }

  return sets.sort((a, b) => b.length - a.length);
}

// ============================================
//   STORAGE
// ============================================
const ramiGames = new Map();

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

function sortHand(cards) {
  return [...cards].sort((a, b) => {
    if (a.suit !== b.suit) return SUITS.indexOf(a.suit) - SUITS.indexOf(b.suit);
    return cardToValue(a) - cardToValue(b);
  });
}

// ============================================
//   🎯 SETUP PANEL
// ============================================
function buildSetupContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_DEFAULT);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("# 🎴 Rami Game")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const playersList = game.players.length > 0
    ? game.players.map((p, i) => `${i + 1}. <@${p.id}>`).join("\n")
    : "*No players yet...*";

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**Host:** <@${game.hostId}>\n` +
      `**Players:** \`${game.players.length}/${MAX_PLAYERS}\`\n\n` +
      `**📋 How to play:**\n` +
      `• Owner starts with 15 cards, others with 14\n` +
      `• BUY → get a card → 15 cards\n` +
      `• FINISH → pick the extra card → win if 14 are arranged\n` +
      `• DISCARD → throw one card → 14 cards\n\n` +
      `**👥 Players Joined:**\n${playersList}`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`rami_join_${game.id}`)
      .setLabel("✅ JOIN")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`rami_start_${game.id}`)
      .setLabel("🟢 START")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(game.players.length < MIN_PLAYERS)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🎴 TURN PANEL
// ============================================
function buildTurnContainer(game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_PLAY);
  const currentPlayer = game.players[game.turnIndex];

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎴 Rami — Your Turn")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `<@${currentPlayer.id}> **It's your turn!**\n\n` +
      `**🎴 Your Cards:** \`${currentPlayer.cards.length}\`\n\n` +
      `**📤 Last Discarded:** \`${game.lastDiscarded ? cardToText(game.lastDiscarded) : "None"}\`\n\n` +
      `**👥 Players:**\n` +
      game.players.map(p =>
        `${p.id === currentPlayer.id ? "▶️" : "  "} <@${p.id}> — \`${p.cards.length}\` cards`
      ).join("\n")
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  // الأزرار
  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`rami_buy_${game.id}`)
      .setLabel("🎴 BUY")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`rami_finish_${game.id}`)
      .setLabel("🏁 FINISH")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`rami_discard_${game.id}`)
      .setLabel("🗑️ DISCARD")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row);

  addSignature(container);

  return container;
}

// ============================================
//   🏆 WINNER CONTAINER
// ============================================
function buildWinnerContainer(winner, game) {
  const container = new ContainerBuilder().setAccentColor(COLOR_WIN);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🏆 We have a WINNER!")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `🎉 <@${winner.id}> **won the game!**\n\n` +
      `**Final Hands:**\n` +
      game.players.map(p =>
        `${p.id === winner.id ? "🥇" : "  "} <@${p.id}> — \`${p.cards.length}\` cards`
      ).join("\n")
    )
  );

  addSignature(container);

  return container;
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎴 Initializing Rami Game module...");

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .rami =====
      if (message.content === `${PREFIX}rami`) {
        const gameId = `rami_${message.id}`;

        const game = {
          id: gameId,
          hostId: message.author.id,
          hostUser: message.author,
          players: [],
          phase: "setup",
          channel: message.channel,
          messageId: null,
          deck: [],
          turnIndex: 0,
          lastDiscarded: null,
        };

        ramiGames.set(gameId, game);

        const container = buildSetupContainer(game);
        const sent = await message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        game.messageId = sent.id;

        console.log(`🎴 Rami game created by ${message.author.username}`);
        return;
      }

    } catch (err) {
      console.error("❌ Error in rami messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      // ===== SELECT MENU =====
      if (interaction.isStringSelectMenu()) {
        const id = interaction.customId;

        if (id.startsWith("rami_discard_select_")) {
          const parts = id.replace("rami_discard_select_", "").split("_");
          const gameId = parts[0];
          const game = ramiGames.get(gameId);

          if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });

          const currentPlayer = game.players[game.turnIndex];
          if (interaction.user.id !== currentPlayer.id) {
            return interaction.reply({ content: "❌ Not your turn!", ephemeral: true });
          }

          const cardId = interaction.values[0];
          // نلقاو البطاقة
          const cardIdx = currentPlayer.cards.findIndex(c => cardToId(c) === cardId);
          if (cardIdx === -1) {
            return interaction.reply({ content: "❌ Card not found.", ephemeral: true });
          }

          const discardedCard = currentPlayer.cards[cardIdx];
          currentPlayer.cards.splice(cardIdx, 1);
          game.lastDiscarded = discardedCard;

          await interaction.reply({
            content: `✅ Discarded: **\`${cardToText(discardedCard)}\`**`,
            ephemeral: true,
          });

          // نمسحو البانال القديم
          try {
            const m = await game.channel.messages.fetch(game.messageId);
            await m.delete();
          } catch {}

          // الدور التالي
          nextTurn(client, game);
          return;
        }

        return;
      }

      if (!interaction.isButton()) return;
      const id = interaction.customId;

      // ===== JOIN =====
      if (id.startsWith("rami_join_")) {
        const gameId = id.replace("rami_join_", "");
        const game = ramiGames.get(gameId);

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
          cards: [],
        });

        const container = buildSetupContainer(game);
        await interaction.update({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      // ===== START =====
      if (id.startsWith("rami_start_")) {
        const gameId = id.replace("rami_start_", "");
        const game = ramiGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });
        if (interaction.user.id !== game.hostId) {
          return interaction.reply({ content: "❌ Only host can start.", ephemeral: true });
        }
        if (game.players.length < MIN_PLAYERS) {
          return interaction.reply({ content: `❌ Need ${MIN_PLAYERS}+ players.`, ephemeral: true });
        }

        // توزيع البطاقات
        game.deck = createDeck();

        // Owner ياخذ 15
        for (let i = 0; i < OWNER_CARDS; i++) {
          game.players[0].cards.push(game.deck.pop());
        }

        // الباقي 14
        for (let i = 1; i < game.players.length; i++) {
          for (let j = 0; j < OTHER_CARDS; j++) {
            game.players[i].cards.push(game.deck.pop());
          }
        }

        // نرتبو البطاقات
        game.players.forEach(p => {
          p.cards = sortHand(p.cards);
        });

        // Owner يبدا الدور الأول
        game.turnIndex = 0;
        game.phase = "play";
        game.lastDiscarded = null;

        console.log(`🎴 Rami game started with ${game.players.length} players`);

        try { await interaction.message.delete(); } catch {}

        // نبعتو رسالة: Owner يرمي وحدة الأولى
        const container = new ContainerBuilder().setAccentColor(COLOR_PLAY);
        container.addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## 🎴 Game Started!\n\n` +
            `<@${game.players[0].id}> **You have 15 cards!**\n\n` +
            `🎯 **You must discard 1 card to start the game.**`
          )
        );
        container.addSeparatorComponents(
          new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
        );

        // Select Menu للـ Owner
        const selectRow = buildDiscardSelect(game, game.players[0]);
        container.addActionRowComponents(selectRow);

        addSignature(container);

        const sent = await game.channel.send({
          content: `<@${game.players[0].id}>`,
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        game.messageId = sent.id;
        return;
      }

      // ===== BUY =====
      if (id.startsWith("rami_buy_")) {
        const gameId = id.replace("rami_buy_", "");
        const game = ramiGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });

        const currentPlayer = game.players[game.turnIndex];
        if (interaction.user.id !== currentPlayer.id) {
          return interaction.reply({ content: "❌ Not your turn!", ephemeral: true });
        }

        // كان Deck خالي → نعاودو نشكّلوه
        if (game.deck.length === 0) {
          game.deck = createDeck();
          console.log("🎴 Deck reshuffled");
        }

        const newCard = game.deck.pop();
        currentPlayer.cards.push(newCard);
        currentPlayer.cards = sortHand(currentPlayer.cards);

        await interaction.reply({
          content: `✅ Got a card! Now you have \`${currentPlayer.cards.length}\` cards.`,
          ephemeral: true,
        });

        // نحدث البانال
        const container = buildTurnContainer(game);
        await interaction.message.edit({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      // ===== FINISH =====
      if (id.startsWith("rami_finish_")) {
        const gameId = id.replace("rami_finish_", "");
        const game = ramiGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });

        const currentPlayer = game.players[game.turnIndex];
        if (interaction.user.id !== currentPlayer.id) {
          return interaction.reply({ content: "❌ Not your turn!", ephemeral: true });
        }

        if (currentPlayer.cards.length !== 15) {
          return interaction.reply({
            content: `❌ You need **15 cards** to finish! You have \`${currentPlayer.cards.length}\`.`,
            ephemeral: true,
          });
        }

        // نبعتو Select Menu باش يختار البطاقة الزايدة
        const selectRow = new ActionRowBuilder().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId(`rami_finish_select_${game.id}`)
            .setPlaceholder("Pick the extra card...")
            .setMinValues(1)
            .setMaxValues(1)
            .addOptions(
              sortHand(currentPlayer.cards).slice(0, 25).map((card, i) =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(cardToText(card))
                  .setValue(cardToId(card))
                  .setDescription(isRedSuit(card.suit) ? "🔴 Red" : "⚫ Black")
              )
            )
        );

        await interaction.reply({
          content: "🎯 **Pick the extra card** (the one you don't need):",
          components: [selectRow],
          ephemeral: true,
        });
        return;
      }

      // ===== DISCARD =====
      if (id.startsWith("rami_discard_")) {
        const gameId = id.replace("rami_discard_", "");
        const game = ramiGames.get(gameId);

        if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });

        const currentPlayer = game.players[game.turnIndex];
        if (interaction.user.id !== currentPlayer.id) {
          return interaction.reply({ content: "❌ Not your turn!", ephemeral: true });
        }

        const selectRow = buildDiscardSelect(game, currentPlayer);

        await interaction.reply({
          content: "🎯 **Pick a card to discard:**",
          components: [selectRow],
          ephemeral: true,
        });
        return;
      }

      // ===== FINISH SELECT =====
      if (id.startsWith("rami_finish_select_")) {
        return; // already handled in isStringSelectMenu
      }

    } catch (err) {
      console.error("❌ Error in rami interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  // نعاملو الـ Select Menu متاع Finish
  client.on("interactionCreate", async (interaction) => {
    try {
      if (!interaction.isStringSelectMenu()) return;
      const id = interaction.customId;

      if (!id.startsWith("rami_finish_select_")) return;

      const gameId = id.replace("rami_finish_select_", "");
      const game = ramiGames.get(gameId);

      if (!game) return interaction.reply({ content: "❌ Game not found.", ephemeral: true });

      const currentPlayer = game.players[game.turnIndex];
      if (interaction.user.id !== currentPlayer.id) {
        return interaction.reply({ content: "❌ Not your turn!", ephemeral: true });
      }

      const cardId = interaction.values[0];
      const cardIdx = currentPlayer.cards.findIndex(c => cardToId(c) === cardId);
      if (cardIdx === -1) {
        return interaction.reply({ content: "❌ Card not found.", ephemeral: true });
      }

      const extraCard = currentPlayer.cards[cardIdx];

      // نجربو نحذفو ونتحققو
      const testCards = [...currentPlayer.cards];
      testCards.splice(cardIdx, 1);

      const canWin = canArrangeAll(testCards);

      if (canWin) {
        // 🏆 يفوز
        currentPlayer.cards = testCards;
        game.lastDiscarded = extraCard;
        game.phase = "done";

        try { await interaction.message.delete(); } catch {}

        // نمسحو بانال الدور
        try {
          const m = await game.channel.messages.fetch(game.messageId);
          await m.delete();
        } catch {}

        // نبعتو بانال الفوز
        const container = buildWinnerContainer(currentPlayer, game);
        await game.channel.send({
          content: `<@${currentPlayer.id}>`,
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });

        console.log(`🏆 Rami winner: ${currentPlayer.username}`);

        ramiGames.delete(gameId);
      } else {
        // ❌ ما ربحش
        await interaction.reply({
          content: `❌ **You can't win with those cards!** The extra card was **\`${cardToText(extraCard)}\`**.\n\nYour remaining 14 cards aren't all arranged.`,
          ephemeral: true,
        });
      }
      return;

    } catch (err) {
      console.error("❌ Error in rami finish select:", err);
    }
  });

  console.log("✅ Rami Game module ready!");
}

// ============================================
//   SELECT MENU BUILDER
// ============================================
function buildDiscardSelect(game, player) {
  const cards = sortHand(player.cards).slice(0, 25);

  return new ActionRowBuilder().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(`rami_discard_select_${game.id}`)
      .setPlaceholder("Pick a card to discard...")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions(
        cards.map(card =>
          new StringSelectMenuOptionBuilder()
            .setLabel(cardToText(card))
            .setValue(cardToId(card))
            .setDescription(isRedSuit(card.suit) ? "🔴 Red suit" : "⚫ Black suit")
        )
      )
  );
}

// ============================================
//   NEXT TURN
// ============================================
async function nextTurn(client, game) {
  try {
    // الدور التالي
    game.turnIndex = (game.turnIndex + 1) % game.players.length;

    // نبعتو بانال الدور الجديد
    const container = buildTurnContainer(game);
    const sent = await game.channel.send({
      content: `<@${game.players[game.turnIndex].id}>`,
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
    game.messageId = sent.id;

    console.log(`🎴 Turn: ${game.players[game.turnIndex].username}`);

  } catch (err) {
    console.error("❌ Error in nextTurn:", err);
  }
}

module.exports = { init };
