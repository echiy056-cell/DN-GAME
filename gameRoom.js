// ============================================
//   GAMING ROOM SYSTEM — Discord.js v14
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  ChannelType,
  PermissionFlagsBits,
  ContainerBuilder,
  TextDisplayBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  MediaGalleryBuilder,
  MediaGalleryItemBuilder,
  MessageFlags,
} = require("discord.js");

const database = require("./database");

// ============================================
//   CONFIG
// ============================================
const PANEL_CHANNEL_ID = "1524321495780823120";
const CATEGORY_ID = "1337591964807463005";
const PANEL_IMAGE = "https://i.imgur.com/LNfgMSP.png";
const AUTO_CLEAN_DELAY = 5 * 60 * 1000;

const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";

const GAMES = [
  { name: "Valorant", emoji: "🎯", defaultLimit: 5 },
  { name: "League of Legends", emoji: "⚔️", defaultLimit: 5 },
  { name: "CS2", emoji: "🔫", defaultLimit: 5 },
  { name: "Among Us", emoji: "🚀", defaultLimit: 10 },
  { name: "Minecraft", emoji: "⛏️", defaultLimit: 10 },
  { name: "Fortnite", emoji: "🏗️", defaultLimit: 4 },
  { name: "Rocket League", emoji: "🚗", defaultLimit: 6 },
  { name: "Apex Legends", emoji: "🎯", defaultLimit: 3 },
  { name: "Overwatch 2", emoji: "🎮", defaultLimit: 5 },
  { name: "PES", emoji: "⚽", defaultLimit: 2 },
  { name: "Free Fire", emoji: "🔥", defaultLimit: 4 },
  { name: "CUSTOM", emoji: "🎮", defaultLimit: 5 },
];

// ============================================
//   STORAGE
// ============================================
const activeRooms = new Map();
const pendingCustom = new Map();

// ============================================
//   HELPERS
// ============================================
function isInVoice(member) {
  try {
    return !!(member && member.voice && member.voice.channel);
  } catch {
    return false;
  }
}

function addSignature(container) {
  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );
  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`-# ${SIGNATURE}`)
  );
  return container;
}

function gameButton(game, customId) {
  return new ButtonBuilder()
    .setCustomId(customId)
    .setLabel(`${game.emoji} ${game.name}`)
    .setStyle(ButtonStyle.Secondary);
}

// ============================================
//   🎮 BUILD PANEL
// ============================================
function buildGamingPanel() {
  const container = new ContainerBuilder().setAccentColor(0x5865F2);

  // ✅ الصورة
  try {
    const gallery = new MediaGalleryBuilder().addItems(
      new MediaGalleryItemBuilder().setURL(PANEL_IMAGE)
    );
    container.addMediaGalleryComponents(gallery);
  } catch (err) {
    console.log("⚠️ MediaGallery failed:", err.message);
  }

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent("## 🎮 Gaming Room System")
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**📋 How to use:**\n` +
      `• Make sure you're in a **voice channel**\n` +
      `• Click a game button to create a room\n` +
      `• Pick player limit (1-20)\n` +
      `• Bot creates a VC + moves you there\n\n` +
      `**⚡ Features:**\n` +
      `• Auto room creation\n` +
      `• Player limit\n` +
      `• Auto-clean empty rooms\n` +
      `• Kick / Blacklist / Whitelist\n\n` +
      `**🎮 Pick a game below:**`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  const rows = [];
  let currentRow = new ActionRowBuilder();

  for (let i = 0; i < GAMES.length; i++) {
    currentRow.addComponents(
      gameButton(GAMES[i], `game_${GAMES[i].name.replace(/\s/g, "_")}`)
    );

    if ((i + 1) % 5 === 0 || i === GAMES.length - 1) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }
  }

  rows.forEach(r => container.addActionRowComponents(r));

  addSignature(container);

  return container;
}

// ============================================
//   🎯 BUILD LIMIT PANEL
// ============================================
function buildLimitContainer(gameName, emoji) {
  const container = new ContainerBuilder().setAccentColor(0x57F287);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${emoji} ${gameName} — Player Limit`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**🎯 Choose the player limit (1-20):**\n\n` +
      `The room will be created with this limit.`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  for (let r = 0; r < 4; r++) {
    const row = new ActionRowBuilder();
    for (let c = 0; c < 5; c++) {
      const n = r * 5 + c + 1;
      row.addComponents(
        new ButtonBuilder()
          .setCustomId(`gamelimit_${n}_${gameName.replace(/\s/g, "_")}`)
          .setLabel(`${n}`)
          .setStyle(ButtonStyle.Secondary)
      );
    }
    container.addActionRowComponents(row);
  }

  addSignature(container);

  return container;
}

// ============================================
//   👑 BUILD ROOM PANEL
// ============================================
function buildRoomPanel(room) {
  const container = new ContainerBuilder().setAccentColor(0x9B59B6);

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(`## ${room.emoji} ${room.gameName} Room`)
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `👑 **Owner:** <@${room.ownerId}>\n` +
      `👥 **Players:** ${room.channel.members.size}/${room.limit}\n` +
      `🔒 **Locked:** ${room.locked ? "Yes" : "No"}\n` +
      `🔗 **Voice:** <#${room.channel.id}>`
    )
  );

  container.addSeparatorComponents(
    new SeparatorBuilder().setDivider(true).setSpacing(SeparatorSpacingSize.Small)
  );

  container.addTextDisplayComponents(
    new TextDisplayBuilder().setContent(
      `**👑 Owner Actions:**\n` +
      `Use the buttons below to manage your room.`
    )
  );

  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`room_kick_${room.channel.id}`)
      .setLabel("🚫 KICK")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`room_blacklist_${room.channel.id}`)
      .setLabel("📛 BLACKLIST")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`room_whitelist_${room.channel.id}`)
      .setLabel("✅ WHITELIST")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row1);

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`room_lock_${room.channel.id}`)
      .setLabel("🔒 LOCK")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`room_unlock_${room.channel.id}`)
      .setLabel("🔓 UNLOCK")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`room_limit_${room.channel.id}`)
      .setLabel("👥 LIMIT")
      .setStyle(ButtonStyle.Secondary)
  );
  container.addActionRowComponents(row2);

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`room_rename_${room.channel.id}`)
      .setLabel("📝 RENAME")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`room_transfer_${room.channel.id}`)
      .setLabel("👑 TRANSFER")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(`room_delete_${room.channel.id}`)
      .setLabel("❌ DELETE")
      .setStyle(ButtonStyle.Danger)
  );
  container.addActionRowComponents(row3);

  addSignature(container);

  return container;
}

// ============================================
//   🧹 AUTO CLEAN
// ============================================
function startAutoClean(client) {
  setInterval(async () => {
    for (const [roomId, room] of activeRooms.entries()) {
      try {
        const channel = await client.channels.fetch(roomId).catch(() => null);
        if (!channel) {
          activeRooms.delete(roomId);
          continue;
        }

        if (channel.members.size === 0) {
          if (!room.emptySince) room.emptySince = Date.now();

          const elapsed = Date.now() - room.emptySince;
          if (elapsed >= AUTO_CLEAN_DELAY) {
            try {
              if (room.panelMessageId && room.panelChannelId) {
                const panelChannel = await client.channels.fetch(room.panelChannelId).catch(() => null);
                if (panelChannel) {
                  const msg = await panelChannel.messages.fetch(room.panelMessageId).catch(() => null);
                  if (msg) await msg.delete().catch(() => {});
                }
              }
            } catch {}

            await channel.delete().catch(() => {});
            activeRooms.delete(roomId);
            console.log(`🧹 Deleted empty room: ${room.gameName}`);
          }
        } else {
          room.emptySince = null;
        }
      } catch (err) {
        console.error("❌ Error in auto-clean:", err);
      }
    }
  }, 30 * 1000);
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎮 Initializing Gaming Room module...");

  startAutoClean(client);

  // ============ MESSAGE CREATE ============
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;

      // ===== .setup-games =====
      if (message.content === ".setup-games") {
        if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
          return message.reply("❌ You need **Manage Channels** permission!");
        }

        const panel = buildGamingPanel();
        await message.channel.send({
          components: [panel],
          flags: MessageFlags.IsComponentsV2,
        });

        return message.delete().catch(() => {});
      }

      // ===== CUSTOM / RENAME =====
      const pending = pendingCustom.get(message.author.id);
      if (!pending) return;

      if (pending.step === "name") {
        const gameName = message.content.trim();
        if (gameName.length < 2 || gameName.length > 30) {
          return message.reply("❌ Game name must be 2-30 characters.");
        }

        pending.data.gameName = gameName;
        pending.step = "limit";

        await message.reply({
          content: `✅ Game: **${gameName}**\n\nNow click a **limit** button (1-20):`,
        });

        const container = buildLimitContainer(gameName, "🎮");
        return message.channel.send({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }

      if (pending.step === "rename") {
        const newName = message.content.trim();
        if (newName.length < 2 || newName.length > 30) {
          return message.reply("❌ Name must be 2-30 characters.");
        }

        const room = activeRooms.get(pending.data.channelId);
        if (!room) {
          pendingCustom.delete(message.author.id);
          return message.reply("❌ Room not found.");
        }

        await room.channel.setName(newName);
        pendingCustom.delete(message.author.id);

        return message.reply(`✅ Renamed to **${newName}**`);
      }

    } catch (err) {
      console.error("❌ Error in gameRoom messageCreate:", err);
    }
  });

  // ============ INTERACTIONS ============
  client.on("interactionCreate", async (interaction) => {
    try {
      // ============ BUTTONS ============
      if (interaction.isButton()) {
        const id = interaction.customId;

        // ===== CREATE ROOM =====
        if (id.startsWith("game_")) {
          const gameName = id.replace("game_", "").replace(/_/g, " ");
          const game = GAMES.find(g => g.name === gameName);
          if (!game) return;

          if (game.name === "CUSTOM") {
            pendingCustom.set(interaction.user.id, { step: "name", data: {} });
            return interaction.reply({
              content: "✏️ **Type the game name in chat** (within 30s):",
              ephemeral: true,
            });
          }

          const container = buildLimitContainer(game.name, game.emoji);
          return interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
          });
        }

        // ===== LIMIT SELECTED =====
        if (id.startsWith("gamelimit_")) {
          const parts = id.split("_");
          const limit = parseInt(parts[1], 10);
          const gameName = parts.slice(2).join(" ").replace(/_/g, " ");
          const game = GAMES.find(g => g.name === gameName);
          if (!game) return;

          await interaction.deferReply({ ephemeral: true });

          const guild = interaction.guild;
          const member = interaction.member;

          if (!isInVoice(member)) {
            return interaction.editReply({ content: "❌ You must be in a **voice channel** first!" });
          }

          if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) {
            return interaction.editReply({ content: "❌ I don't have **Manage Channels** permission!" });
          }

          const roomName = `${game.emoji} ${gameName} — 0/${limit}`;

          const channel = await guild.channels.create({
            name: roomName,
            type: ChannelType.GuildVoice,
            parent: CATEGORY_ID,
            userLimit: limit,
          });

          try {
            await member.voice.setChannel(channel);
          } catch (err) {}

          const room = {
            channelId: channel.id,
            channel,
            ownerId: member.id,
            gameName,
            emoji: game.emoji,
            limit,
            locked: false,
            blacklist: new Set(),
            whitelist: new Set(),
            createdAt: Date.now(),
          };

          activeRooms.set(channel.id, room);

          // ✅ Send panel
          try {
            const panelChannel = await client.channels.fetch(PANEL_CHANNEL_ID);
            if (panelChannel) {
              const panel = buildRoomPanel(room);
              const msg = await panelChannel.send({
                content: `<@${member.id}> — your room is ready!`,
                components: [panel],
                flags: MessageFlags.IsComponentsV2,
              });
              room.panelMessageId = msg.id;
              room.panelChannelId = panelChannel.id;
            }
          } catch {}

          await interaction.editReply({
            content: `✅ Room created: <#${channel.id}>\n👥 Limit: **${limit}**`,
          });

          console.log(`🎮 ${member.user.username} created ${gameName} (${limit})`);
          return;
        }

        // ===== ROOM ACTIONS =====
        if (id.startsWith("room_")) {
          const parts = id.split("_");
          const action = parts[1];
          const channelId = parts[2];
          const room = activeRooms.get(channelId);

          if (!room) {
            return interaction.reply({ content: "❌ Room not found.", ephemeral: true });
          }

          if (interaction.user.id !== room.ownerId) {
            return interaction.reply({
              content: "❌ Only the **room owner** can use these buttons!",
              ephemeral: true,
            });
          }

          // KICK
          if (action === "kick") {
            const members = Array.from(room.channel.members.values())
              .filter(m => m.id !== room.ownerId);

            if (members.length === 0) {
              return interaction.reply({ content: "❌ No members to kick.", ephemeral: true });
            }

            const select = new StringSelectMenuBuilder()
              .setCustomId(`roomkick_select_${channelId}`)
              .setPlaceholder("Choose a member to kick")
              .addOptions(members.slice(0, 25).map(m =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(m.user.username)
                  .setValue(m.id)
              ));

            return interaction.reply({
              components: [new ActionRowBuilder().addComponents(select)],
              ephemeral: true,
            });
          }

          // BLACKLIST
          if (action === "blacklist") {
            const members = Array.from(room.channel.members.values())
              .filter(m => m.id !== room.ownerId);

            if (members.length === 0) {
              return interaction.reply({ content: "❌ No members.", ephemeral: true });
            }

            const select = new StringSelectMenuBuilder()
              .setCustomId(`roombl_select_${channelId}`)
              .setPlaceholder("Choose a member to blacklist")
              .addOptions(members.slice(0, 25).map(m =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(m.user.username)
                  .setValue(m.id)
              ));

            return interaction.reply({
              components: [new ActionRowBuilder().addComponents(select)],
              ephemeral: true,
            });
          }

          // WHITELIST
          if (action === "whitelist") {
            const members = Array.from(room.channel.members.values())
              .filter(m => m.id !== room.ownerId);

            if (members.length === 0) {
              return interaction.reply({ content: "❌ No members.", ephemeral: true });
            }

            const select = new StringSelectMenuBuilder()
              .setCustomId(`roomwl_select_${channelId}`)
              .setPlaceholder("Choose a member to whitelist")
              .addOptions(members.slice(0, 25).map(m =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(m.user.username)
                  .setValue(m.id)
              ));

            return interaction.reply({
              components: [new ActionRowBuilder().addComponents(select)],
              ephemeral: true,
            });
          }

          // LOCK
          if (action === "lock") {
            room.locked = true;
            await room.channel.permissionOverwrites.edit(interaction.guild.id, { Connect: false });
            await interaction.reply({ content: "🔒 Room locked!", ephemeral: true });
            await updateRoomPanel(client, room);
            return;
          }

          // UNLOCK
          if (action === "unlock") {
            room.locked = false;
            await room.channel.permissionOverwrites.edit(interaction.guild.id, { Connect: true });
            await interaction.reply({ content: "🔓 Room unlocked!", ephemeral: true });
            await updateRoomPanel(client, room);
            return;
          }

          // LIMIT
          if (action === "limit") {
            const container = buildLimitContainer(room.gameName, room.emoji);
            return interaction.reply({
              components: [container],
              flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
          }

          // RENAME
          if (action === "rename") {
            pendingCustom.set(interaction.user.id, {
              step: "rename",
              data: { channelId: room.channelId },
            });
            return interaction.reply({
              content: "✏️ **Type the new room name in chat** (within 30s):",
              ephemeral: true,
            });
          }

          // TRANSFER
          if (action === "transfer") {
            const members = Array.from(room.channel.members.values())
              .filter(m => m.id !== room.ownerId);

            if (members.length === 0) {
              return interaction.reply({ content: "❌ No members.", ephemeral: true });
            }

            const select = new StringSelectMenuBuilder()
              .setCustomId(`roomtr_select_${channelId}`)
              .setPlaceholder("Choose a new owner")
              .addOptions(members.slice(0, 25).map(m =>
                new StringSelectMenuOptionBuilder()
                  .setLabel(m.user.username)
                  .setValue(m.id)
              ));

            return interaction.reply({
              components: [new ActionRowBuilder().addComponents(select)],
              ephemeral: true,
            });
          }

          // DELETE
          if (action === "delete") {
            try {
              if (room.panelMessageId && room.panelChannelId) {
                const panelChannel = await client.channels.fetch(room.panelChannelId).catch(() => null);
                if (panelChannel) {
                  const msg = await panelChannel.messages.fetch(room.panelMessageId).catch(() => null);
                  if (msg) await msg.delete().catch(() => {});
                }
              }
            } catch {}

            await room.channel.delete().catch(() => {});
            activeRooms.delete(channelId);

            return interaction.reply({ content: "✅ Room deleted!", ephemeral: true });
          }
        }
      }

      // ============ SELECT MENUS ============
      if (interaction.isStringSelectMenu()) {
        const id = interaction.customId;
        const parts = id.split("_");
        const action = parts[0];
        const channelId = parts[2];
        const room = activeRooms.get(channelId);

        if (!room) {
          return interaction.reply({ content: "❌ Room not found.", ephemeral: true });
        }

        const targetId = interaction.values[0];

        if (action === "roomkick") {
          const target = room.channel.members.get(targetId);
          if (!target) {
            return interaction.reply({ content: "❌ Member not in room.", ephemeral: true });
          }

          try {
            await target.voice.disconnect();
            await interaction.reply({ content: `✅ Kicked <@${targetId}>`, ephemeral: true });
            await updateRoomPanel(client, room);
          } catch (err) {
            await interaction.reply({ content: `❌ ${err.message}`, ephemeral: true });
          }
          return;
        }

        if (action === "roombl") {
          room.blacklist.add(targetId);
          await room.channel.permissionOverwrites.edit(targetId, {
            Connect: false,
            ViewChannel: false,
          });

          const target = room.channel.members.get(targetId);
          if (target) await target.voice.disconnect().catch(() => {});

          await interaction.reply({ content: `📛 Blacklisted <@${targetId}>`, ephemeral: true });
          await updateRoomPanel(client, room);
          return;
        }

        if (action === "roomwl") {
          room.whitelist.add(targetId);
          await room.channel.permissionOverwrites.edit(targetId, {
            Connect: true,
            ViewChannel: true,
          });

          await interaction.reply({ content: `✅ Whitelisted <@${targetId}>`, ephemeral: true });
          await updateRoomPanel(client, room);
          return;
        }

        if (action === "roomtr") {
          room.ownerId = targetId;
          await interaction.reply({ content: `👑 Transferred to <@${targetId}>`, ephemeral: true });
          await updateRoomPanel(client, room);
          return;
        }
      }

    } catch (err) {
      console.error("❌ Error in gameRoom interactionCreate:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Error.", ephemeral: true });
        }
      } catch {}
    }
  });

  console.log("✅ Gaming Room module ready!");
}

// ============================================
//   🔄 UPDATE ROOM PANEL
// ============================================
async function updateRoomPanel(client, room) {
  try {
    if (!room.panelMessageId || !room.panelChannelId) return;

    const panelChannel = await client.channels.fetch(room.panelChannelId).catch(() => null);
    if (!panelChannel) return;

    const msg = await panelChannel.messages.fetch(room.panelMessageId).catch(() => null);
    if (!msg) return;

    try {
      await room.channel.setName(`${room.emoji} ${room.gameName} — ${room.channel.members.size}/${room.limit}`);
    } catch {}

    const panel = buildRoomPanel(room);
    await msg.edit({
      components: [panel],
      flags: MessageFlags.IsComponentsV2,
    });
  } catch (err) {
    console.error("❌ Error in updateRoomPanel:", err);
  }
}

module.exports = { init, buildGamingPanel, GAMES };
