// ============================================
//   MUSIC MODULE — Distube
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  EmbedBuilder,
} = require("discord.js");

const { DisTube } = require("distube");
const { SpotifyPlugin } = require("@distube/spotify");
const { SoundCloudPlugin } = require("@distube/soundcloud");
const { YtDlpPlugin } = require("@distube/yt-dlp");

// ============================================
//   CONFIG
// ============================================
const PREFIX = "?";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";
const COLOR_PLAY = 0x5865F2;
const COLOR_WIN = 0x57F287;

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎵 Initializing Music module (Distube)...");

  // ============================================
  //   DISTUBE SETUP
  // ============================================
  const distube = new DisTube(client, {
    emitNewSongOnly: true,
    emitAddSongWhenCreatingQueue: false,
    nsfw: false,
    plugins: [
      new SpotifyPlugin({
        emitEventsAfterFetching: true,
      }),
      new SoundCloudPlugin(),
      new YtDlpPlugin({
        update: false,
      }),
    ],
  });

  // ============================================
  //   DISTUBE EVENTS
  // ============================================
  distube
    .on("playSong", (queue, song) => {
      const embed = new EmbedBuilder()
        .setColor(COLOR_WIN)
        .setTitle("🎵 Now Playing")
        .setDescription(`**${song.name}**`)
        .addFields(
          { name: "⏱️ Duration", value: song.formattedDuration, inline: true },
          { name: "👤 Requested by", value: `${song.user}`, inline: true }
        )
        .setThumbnail(song.thumbnail || null)
        .setFooter({ text: SIGNATURE });

      queue.textChannel?.send({ embeds: [embed] });
    })
    .on("addSong", (queue, song) => {
      queue.textChannel?.send({
        content: `✅ Added to queue: **${song.name}** — \`${song.formattedDuration}\``,
      });
    })
    .on("addList", (queue, playlist) => {
      queue.textChannel?.send({
        content: `✅ Added playlist: **${playlist.name}** — \`${playlist.songs.length}\` songs`,
      });
    })
    .on("error", (channel, error) => {
      console.error("❌ Distube error:", error.message);
      if (channel) {
        channel.send(`❌ Error: ${error.message.slice(0, 100)}`).catch(() => {});
      }
    })
    .on("empty", (queue) => {
      queue.textChannel?.send("👋 Channel is empty. Leaving...");
    })
    .on("finish", (queue) => {
      queue.textChannel?.send("✅ Queue finished!");
    })
    .on("disconnect", (queue) => {
      queue.textChannel?.send("👋 Disconnected!");
    })
    .on("initQueue", (queue) => {
      queue.autoplay = false;
      queue.volume = 100;
    });

  // ============================================
  //   MESSAGE CREATE
  // ============================================
  client.on("messageCreate", async (message) => {
    try {
      if (message.author.bot) return;
      if (!message.content.startsWith(PREFIX)) return;

      const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
      const command = args.shift().toLowerCase();

      // ⚠️ ماشي أوامر الألعاب
      const gameCommands = ["roulette", "slots", "candy", "trivia", "crash", "xo", "mw", "mrwhite", "menu", "games", "help", "setup-games"];
      if (gameCommands.includes(command)) return;

      const voiceChannel = message.member?.voice?.channel;

      // ===== ?join =====
      if (command === "join" || command === "j") {
        if (!voiceChannel) {
          return message.reply("❌ You must be in a **voice channel** first!");
        }

        try {
          await distube.voices.join(voiceChannel);
          return message.reply(`✅ Joined **${voiceChannel.name}**!`);
        } catch (err) {
          console.error("❌ Join error:", err.message);
          return message.reply("❌ Can't join voice channel!");
        }
      }

      // ===== ?play =====
      if (command === "play" || command === "p") {
        if (!voiceChannel) {
          return message.reply("❌ You must be in a **voice channel** first!");
        }

        const query = args.join(" ");
        if (!query) {
          return message.reply("❌ Usage: `?play <song name or URL>`");
        }

        try {
          await distube.play(voiceChannel, query, {
            member: message.member,
            textChannel: message.channel,
            message,
          });
        } catch (err) {
          console.error("❌ Play error:", err.message);
          return message.reply(`❌ Error: ${err.message.slice(0, 100)}`);
        }
        return;
      }

      // ===== ?skip =====
      if (command === "skip" || command === "s") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        try {
          await queue.skip();
          return message.reply("⏭️ Skipped!");
        } catch (err) {
          return message.reply(`❌ ${err.message.slice(0, 100)}`);
        }
      }

      // ===== ?pause =====
      if (command === "pause") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        queue.pause();
        return message.reply("⏸️ Paused!");
      }

      // ===== ?resume =====
      if (command === "resume" || command === "r") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        queue.resume();
        return message.reply("▶️ Resumed!");
      }

      // ===== ?stop =====
      if (command === "stop") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        queue.stop();
        return message.reply("⏹️ Stopped!");
      }

      // ===== ?leave =====
      if (command === "leave" || command === "dc") {
        try {
          distube.voices.leave(message.guild.id);
          return message.reply("👋 Left voice channel!");
        } catch (err) {
          return message.reply("❌ Not in a voice channel!");
        }
      }

      // ===== ?queue =====
      if (command === "queue" || command === "q") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue || queue.songs.length === 0) {
          return message.reply("❌ Queue is empty!");
        }

        const embed = new EmbedBuilder()
          .setColor(COLOR_PLAY)
          .setTitle("🎵 Queue")
          .setDescription(
            queue.songs
              .slice(0, 10)
              .map((s, i) => `**${i + 1}.** ${s.name} — \`${s.formattedDuration}\``)
              .join("\n")
          )
          .setFooter({ text: `${queue.songs.length} songs • ${SIGNATURE}` });

        return message.reply({ embeds: [embed] });
      }

      // ===== ?nowplaying =====
      if (command === "nowplaying" || command === "np") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue || !queue.songs[0]) {
          return message.reply("❌ Nothing is playing!");
        }

        const song = queue.songs[0];

        const embed = new EmbedBuilder()
          .setColor(COLOR_WIN)
          .setTitle("🎵 Now Playing")
          .setDescription(`**${song.name}**`)
          .addFields(
            { name: "⏱️ Duration", value: song.formattedDuration, inline: true },
            { name: "👤 Requested by", value: `${song.user}`, inline: true }
          )
          .setThumbnail(song.thumbnail || null)
          .setFooter({ text: SIGNATURE });

        return message.reply({ embeds: [embed] });
      }

      // ===== ?volume =====
      if (command === "volume" || command === "vol") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        const vol = parseInt(args[0], 10);
        if (isNaN(vol) || vol < 1 || vol > 100) {
          return message.reply("❌ Usage: `?volume <1-100>`");
        }

        queue.setVolume(vol);
        return message.reply(`🔊 Volume set to **${vol}%**`);
      }

      // ===== ?loop =====
      if (command === "loop") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        const mode = args[0]?.toLowerCase();
        if (mode === "off") {
          queue.setRepeatMode(0);
          return message.reply("🔁 Loop: **OFF**");
        } else if (mode === "song") {
          queue.setRepeatMode(1);
          return message.reply("🔂 Loop: **SONG**");
        } else if (mode === "queue") {
          queue.setRepeatMode(2);
          return message.reply("🔁 Loop: **QUEUE**");
        } else {
          return message.reply("❌ Usage: `?loop <off|song|queue>`");
        }
      }

      // ===== ?shuffle =====
      if (command === "shuffle") {
        const queue = distube.getQueue(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        queue.shuffle();
        return message.reply("🔀 Queue shuffled!");
      }

      // ===== ?musichelp =====
      if (command === "musichelp" || command === "mh") {
        const embed = new EmbedBuilder()
          .setColor(COLOR_PLAY)
          .setTitle("🎵 Music Bot — Commands")
          .setDescription(
            "**`?join`** — Join voice channel\n" +
            "**`?play <query>`** — Play a song\n" +
            "**`?skip`** — Skip current\n" +
            "**`?pause`** — Pause\n" +
            "**`?resume`** — Resume\n" +
            "**`?stop`** — Stop\n" +
            "**`?leave`** — Leave VC\n" +
            "**`?queue`** — Show queue\n" +
            "**`?nowplaying`** — Current song\n" +
            "**`?volume <1-100>`** — Volume\n" +
            "**`?loop <off|song|queue>`** — Loop mode\n" +
            "**`?shuffle`** — Shuffle queue"
          )
          .setFooter({ text: SIGNATURE });

        return message.reply({ embeds: [embed] });
      }

    } catch (err) {
      console.error("❌ Error in music module:", err.message);
    }
  });

  console.log("✅ Music module ready!");
}

module.exports = { init };
