// ============================================
//   MUSIC MODULE
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  EmbedBuilder,
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");

const playdl = require("play-dl");

// ============================================
//   CONFIG
// ============================================
const PREFIX = "?";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";
const COLOR_PLAY = 0x5865F2;
const COLOR_WIN = 0x57F287;
const SEARCH_TIMEOUT = 15000;   // 15s
const STREAM_TIMEOUT = 20000;   // 20s

// ============================================
//   STORAGE
// ============================================
const queues = new Map();

// ============================================
//   HELPERS
// ============================================
function createQueue(guildId) {
  return {
    songs: [],
    player: createAudioPlayer(),
    connection: null,
    voiceChannel: null,
    playing: false,
    current: null,
    volume: 100,
  };
}

function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, createQueue(guildId));
  }
  return queues.get(guildId);
}

// ✅ Clean YouTube URL
function cleanUrl(url) {
  url = url.split("&si=")[0];
  url = url.split("?si=")[0];
  if (url.includes("&t=")) {
    const parts = url.split("&t=");
    url = parts[0] + "&t=" + parts[1].split("&")[0];
  }
  return url;
}

// ✅ Timeout wrapper
function withTimeout(promise, ms, errorMsg = "Timeout") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms)
    ),
  ]);
}

// ============================================
//   🎵 PLAY SONG
// ============================================
async function playSong(guild, song) {
  const queue = getQueue(guild.id);

  if (!song) {
    queue.playing = false;
    queue.current = null;
    setTimeout(() => {
      if (queue.connection) queue.connection.destroy();
      queues.delete(guild.id);
    }, 30 * 1000);
    return;
  }

  try {
    console.log(`🎵 Getting stream for: ${song.url}`);

    const stream = await withTimeout(
      playdl.stream(song.url, { quality: 2 }),
      STREAM_TIMEOUT,
      "Stream timeout"
    );

    console.log(`✅ Stream obtained`);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true,
    });

    resource.volume.setVolume(queue.volume / 100);

    queue.player.play(resource);
    queue.playing = true;
    queue.current = song;

    console.log(`🎵 Playing: ${song.title}`);
  } catch (err) {
    console.error("❌ Error playing:", err.message);
    queue.songs.shift();
    if (queue.songs.length > 0) {
      playSong(guild, queue.songs[0]);
    } else {
      queue.playing = false;
      queue.current = null;
    }
  }
}

// ============================================
//   INIT
// ============================================
function init(client) {
  console.log("🎵 Initializing Music module...");

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

        const queue = getQueue(message.guild.id);

        if (queue.connection) {
          return message.reply("✅ I'm already in a voice channel!");
        }

        try {
          queue.connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
          });
          queue.voiceChannel = voiceChannel;
          queue.connection.subscribe(queue.player);

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

        const queue = getQueue(message.guild.id);

        if (!queue.connection) {
          try {
            queue.connection = joinVoiceChannel({
              channelId: voiceChannel.id,
              guildId: message.guild.id,
              adapterCreator: message.guild.voiceAdapterCreator,
            });
            queue.voiceChannel = voiceChannel;
            queue.connection.subscribe(queue.player);
          } catch (err) {
            console.error("❌ Join error:", err.message);
            return message.reply("❌ Can't join voice channel!");
          }
        }

        const msg = await message.reply("🔍 Searching...");

        try {
          let song;

          // ============================================
          //   ✅ SPOTIFY
          // ============================================
          if (query.includes("spotify.com")) {
            try {
              const data = await withTimeout(
                playdl.spotify(query),
                SEARCH_TIMEOUT,
                "Spotify timeout"
              );

              if (data.type === "track") {
                song = {
                  title: data.name,
                  url: `${data.name} ${data.artists[0].name}`,
                  duration: data.durationInSec,
                  thumbnail: data.thumbnail?.url,
                  requestedBy: message.author.username,
                };
              } else {
                return msg.edit("❌ Only **tracks** supported (not playlists)");
              }
            } catch (err) {
              console.error("❌ Spotify error:", err.message);
              return msg.edit("❌ Spotify timeout. Try again.");
            }
          }

          // ============================================
          //   ✅ SOUNDCLOUD
          // ============================================
          else if (query.includes("soundcloud.com")) {
            try {
              const results = await withTimeout(
                playdl.soundcloud(query),
                SEARCH_TIMEOUT,
                "SoundCloud timeout"
              );

              if (!results || results.length === 0) {
                return msg.edit("❌ No SoundCloud results!");
              }

              const track = results[0];
              song = {
                title: track.name,
                url: track.url,
                duration: track.durationInSec,
                thumbnail: track.thumbnail,
                requestedBy: message.author.username,
              };
            } catch (err) {
              console.error("❌ SoundCloud error:", err.message);
              return msg.edit("❌ SoundCloud timeout. Try again.");
            }
          }

          // ============================================
          //   ✅ YOUTUBE
          // ============================================
          else {
            const cleanQuery = cleanUrl(query);
            const validation = playdl.yt_validate(cleanQuery);

            if (validation === "video") {
              // ✅ رابط YouTube
              try {
                const videoInfo = await withTimeout(
                  playdl.video_info(cleanQuery),
                  SEARCH_TIMEOUT,
                  "YouTube timeout"
                );

                const details = videoInfo.video_details;
                song = {
                  title: details.title,
                  url: details.url || cleanQuery,
                  duration: details.durationInSec,
                  thumbnail: details.thumbnails?.[0]?.url || details.thumbnail?.url,
                  requestedBy: message.author.username,
                };
              } catch (err) {
                console.error("❌ YouTube video error:", err.message);
                return msg.edit(
                  `❌ **YouTube not responding!**\n\n` +
                  `Try:\n` +
                  `• \`?play <song name>\` (search)\n` +
                  `• \`?play <soundcloud URL>\``
                );
              }
            } else if (validation === "playlist") {
              return msg.edit("❌ Playlists not supported yet");
            } else {
              // ✅ Search عادي
              try {
                const results = await withTimeout(
                  playdl.search(cleanQuery, { limit: 1 }),
                  SEARCH_TIMEOUT,
                  "Search timeout"
                );

                if (!results || results.length === 0) {
                  return msg.edit("❌ No results found!");
                }

                const video = results[0];
                song = {
                  title: video.title,
                  url: video.url,
                  duration: video.durationInSec,
                  thumbnail: video.thumbnails?.[0]?.url || video.thumbnail?.url,
                  requestedBy: message.author.username,
                };
              } catch (err) {
                console.error("❌ YouTube search error:", err.message);
                return msg.edit("❌ YouTube not responding. Try again later.");
              }
            }
          }

          // ============================================
          //   ✅ CHECK + QUEUE
          // ============================================
          if (!song || !song.url) {
            return msg.edit("❌ Invalid song data!");
          }

          queue.songs.push(song);

          await msg.edit({
            content: `✅ Added to queue: **${song.title}**`,
          });

          if (!queue.playing) {
            playSong(message.guild, queue.songs[0]);
          }
        } catch (err) {
          console.error("❌ Search error:", err.message);
          msg.edit("❌ Error searching for song!");
        }
        return;
      }

      // ===== ?skip =====
      if (command === "skip" || command === "s") {
        const queue = queues.get(message.guild.id);
        if (!queue || queue.songs.length === 0) {
          return message.reply("❌ Nothing is playing!");
        }

        queue.player.stop();
        queue.songs.shift();

        if (queue.songs.length > 0) {
          playSong(message.guild, queue.songs[0]);
          return message.reply(`⏭️ Skipped! Now: **${queue.songs[0].title}**`);
        } else {
          return message.reply("⏭️ Queue is empty!");
        }
      }

      // ===== ?pause =====
      if (command === "pause") {
        const queue = queues.get(message.guild.id);
        if (!queue || !queue.playing) {
          return message.reply("❌ Nothing is playing!");
        }
        queue.player.pause();
        return message.reply("⏸️ Paused!");
      }

      // ===== ?resume =====
      if (command === "resume" || command === "r") {
        const queue = queues.get(message.guild.id);
        if (!queue || !queue.playing) {
          return message.reply("❌ Nothing is playing!");
        }
        queue.player.unpause();
        return message.reply("▶️ Resumed!");
      }

      // ===== ?stop =====
      if (command === "stop") {
        const queue = queues.get(message.guild.id);
        if (!queue) {
          return message.reply("❌ Nothing is playing!");
        }

        queue.songs = [];
        queue.player.stop();
        if (queue.connection) queue.connection.destroy();
        queues.delete(message.guild.id);

        return message.reply("⏹️ Stopped and left!");
      }

      // ===== ?leave =====
      if (command === "leave" || command === "dc") {
        const queue = queues.get(message.guild.id);
        if (!queue || !queue.connection) {
          return message.reply("❌ Not in a voice channel!");
        }

        queue.songs = [];
        queue.player.stop();
        queue.connection.destroy();
        queues.delete(message.guild.id);

        return message.reply("👋 Left voice channel!");
      }

      // ===== ?queue =====
      if (command === "queue" || command === "q") {
        const queue = queues.get(message.guild.id);
        if (!queue || queue.songs.length === 0) {
          return message.reply("❌ Queue is empty!");
        }

        const embed = new EmbedBuilder()
          .setColor(COLOR_PLAY)
          .setTitle("🎵 Queue")
          .setDescription(
            queue.songs
              .slice(0, 10)
              .map((s, i) => `**${i + 1}.** ${s.title} — \`${s.requestedBy}\``)
              .join("\n")
          )
          .setFooter({ text: `${queue.songs.length} songs • ${SIGNATURE}` });

        return message.reply({ embeds: [embed] });
      }

      // ===== ?nowplaying =====
      if (command === "nowplaying" || command === "np") {
        const queue = queues.get(message.guild.id);
        if (!queue || !queue.current) {
          return message.reply("❌ Nothing is playing!");
        }

        const embed = new EmbedBuilder()
          .setColor(COLOR_WIN)
          .setTitle("🎵 Now Playing")
          .setDescription(`**${queue.current.title}**`)
          .setThumbnail(queue.current.thumbnail || null)
          .setFooter({ text: `Requested by ${queue.current.requestedBy} • ${SIGNATURE}` });

        return message.reply({ embeds: [embed] });
      }

      // ===== ?volume =====
      if (command === "volume" || command === "vol") {
        const queue = queues.get(message.guild.id);
        if (!queue || !queue.current) {
          return message.reply("❌ Nothing is playing!");
        }

        const vol = parseInt(args[0], 10);
        if (isNaN(vol) || vol < 1 || vol > 100) {
          return message.reply("❌ Usage: `?volume <1-100>`");
        }

        queue.volume = vol;
        try {
          const resource = queue.player.state.resource;
          if (resource && resource.volume) {
            resource.volume.setVolume(vol / 100);
          }
        } catch {}

        return message.reply(`🔊 Volume set to **${vol}%**`);
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
            "**`?stop`** — Stop + Leave\n" +
            "**`?leave`** — Leave VC\n" +
            "**`?queue`** — Show queue\n" +
            "**`?nowplaying`** — Current song\n" +
            "**`?volume <1-100>`** — Volume"
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
