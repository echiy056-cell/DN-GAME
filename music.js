// ============================================
//   MUSIC MODULE — @distube/ytdl-core + Spotify + SoundCloud
//   DEATH NOTE GAME / DEV BY AFGHANI
// ============================================

const {
  EmbedBuilder,
} = require("discord.js");

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  StreamType,
} = require("@discordjs/voice");

const ytdl = require("@distube/ytdl-core");
const spotifyInfo = require("spotify-url-info");
const SoundCloud = require("soundcloud-scraper");
const scClient = new SoundCloud.Client();

// ============================================
//   CONFIG
// ============================================
const PREFIX = "?";
const SIGNATURE = "DEATH NOTE GAME / DEV BY AFGHANI";
const COLOR_PLAY = 0x5865F2;
const COLOR_WIN = 0x57F287;
const SEARCH_TIMEOUT = 15000;
const STREAM_TIMEOUT = 20000;

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

function cleanUrl(url) {
  url = url.split("&si=")[0];
  url = url.split("?si=")[0];
  return url;
}

function withTimeout(promise, ms, errorMsg = "Timeout") {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms)
    ),
  ]);
}

// ============================================
//   🔍 SEARCH FUNCTIONS
// ============================================

// ✅ YouTube Search (via ytdl-core)
async function searchYouTube(query) {
  try {
    // ytdl-core ما فيهش search، نستعملو YouTube Suggest API
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl);
    const html = await response.text();
    
    // Extract first video ID
    const videoIdMatch = html.match(/"videoId":"([^"]+)"/);
    if (!videoIdMatch) {
      throw new Error("No video found");
    }
    
    const videoId = videoIdMatch[1];
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const info = await ytdl.getInfo(videoUrl);
    
    return {
      title: info.videoDetails.title,
      url: videoUrl,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails[0]?.url,
    };
  } catch (err) {
    console.error("❌ YouTube search error:", err.message);
    throw err;
  }
}

// ✅ Get YouTube Info from URL
async function getYouTubeInfo(url) {
  try {
    const info = await withTimeout(
      ytdl.getInfo(url),
      SEARCH_TIMEOUT,
      "YouTube timeout"
    );
    
    return {
      title: info.videoDetails.title,
      url: url,
      duration: parseInt(info.videoDetails.lengthSeconds),
      thumbnail: info.videoDetails.thumbnails[0]?.url,
    };
  } catch (err) {
    console.error("❌ YouTube info error:", err.message);
    throw err;
  }
}

// ✅ SoundCloud Search
async function searchSoundCloud(query) {
  try {
    const results = await withTimeout(
      scClient.search(query, "track"),
      SEARCH_TIMEOUT,
      "SoundCloud timeout"
    );
    
    if (!results || results.length === 0) {
      throw new Error("No SoundCloud results");
    }
    
    const track = results[0];
    const song = await scClient.getSongInfo(track.url);
    
    return {
      title: song.title,
      url: song.url,
      duration: song.duration / 1000,
      thumbnail: song.thumbnail,
    };
  } catch (err) {
    console.error("❌ SoundCloud search error:", err.message);
    throw err;
  }
}

// ✅ SoundCloud Info from URL
async function getSoundCloudInfo(url) {
  try {
    const song = await withTimeout(
      scClient.getSongInfo(url),
      SEARCH_TIMEOUT,
      "SoundCloud timeout"
    );
    
    return {
      title: song.title,
      url: song.url,
      duration: song.duration / 1000,
      thumbnail: song.thumbnail,
    };
  } catch (err) {
    console.error("❌ SoundCloud info error:", err.message);
    throw err;
  }
}

// ✅ Spotify Info
async function getSpotifyInfo(url) {
  try {
    const data = await withTimeout(
      spotifyInfo.getTracks(url),
      SEARCH_TIMEOUT,
      "Spotify timeout"
    );
    
    if (!data || data.length === 0) {
      throw new Error("No Spotify data");
    }
    
    const track = data[0];
    return {
      title: `${track.name} - ${track.artists.join(", ")}`,
      searchQuery: `${track.name} ${track.artists.join(" ")}`,
      duration: Math.floor(track.duration / 1000),
      thumbnail: track.image,
    };
  } catch (err) {
    console.error("❌ Spotify error:", err.message);
    throw err;
  }
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
    console.log(`📻 Source: ${song.source || "unknown"}`);

    let stream;

    if (song.source === "soundcloud") {
      // ✅ SoundCloud stream
      stream = await withTimeout(
        scClient.getSongInfo(song.url).then(info => info.stream()),
        STREAM_TIMEOUT,
        "SoundCloud stream timeout"
      );
    } else {
      // ✅ YouTube stream
      const ytdlStream = ytdl(song.url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25,
      });

      stream = ytdlStream;
    }

    console.log(`✅ Stream obtained`);

    const resource = createAudioResource(stream, {
      inputType: song.source === "soundcloud" ? StreamType.Arbitrary : StreamType.Arbitrary,
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
          //   ✅ SOUNDCLOUD URL
          // ============================================
          if (query.includes("soundcloud.com")) {
            try {
              const data = await getSoundCloudInfo(query);
              song = {
                ...data,
                source: "soundcloud",
                requestedBy: message.author.username,
              };
            } catch (err) {
              return msg.edit("❌ SoundCloud error. Try again.");
            }
          }

          // ============================================
          //   ✅ SPOTIFY URL
          // ============================================
          else if (query.includes("spotify.com")) {
            try {
              const data = await getSpotifyInfo(query);
              // Spotify → YouTube search
              const ytData = await searchYouTube(data.searchQuery);
              song = {
                title: data.title,
                url: ytData.url,
                duration: data.duration,
                thumbnail: data.thumbnail || ytData.thumbnail,
                source: "youtube",
                requestedBy: message.author.username,
              };
            } catch (err) {
              return msg.edit("❌ Spotify error. Try again.");
            }
          }

          // ============================================
          //   ✅ YOUTUBE URL
          // ============================================
          else if (query.includes("youtube.com") || query.includes("youtu.be")) {
            try {
              const cleanQuery = cleanUrl(query);
              const data = await getYouTubeInfo(cleanQuery);
              song = {
                ...data,
                source: "youtube",
                requestedBy: message.author.username,
              };
            } catch (err) {
              return msg.edit(
                `❌ **YouTube error!**\n\n` +
                `Try:\n` +
                `• \`?play <song name>\`\n` +
                `• \`?play <soundcloud URL>\``
              );
            }
          }

          // ============================================
          //   ✅ SEARCH (SoundCloud first, YouTube fallback)
          // ============================================
          else {
            try {
              // ✅ SoundCloud search أولاً
              const data = await searchSoundCloud(query);
              song = {
                ...data,
                source: "soundcloud",
                requestedBy: message.author.username,
              };
            } catch (scErr) {
              // ✅ YouTube fallback
              try {
                const data = await searchYouTube(query);
                song = {
                  ...data,
                  source: "youtube",
                  requestedBy: message.author.username,
                };
              } catch (ytErr) {
                return msg.edit("❌ No results found!");
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
