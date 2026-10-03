// ============================================
//   music.js — MUSIC MODULE
//   Commands: .join / .leave / .play / .pause / .resume / .stop
// ============================================

const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    NoSubscriberBehavior
} = require("@discordjs/voice");

// ============================================
//   ⚙️ CONFIG
// ============================================
const PREFIX = process.env.PREFIX || '.';
// ============================================

let client;
const players = new Map();

// ============================================
//   🎵 Handle Message
// ============================================
async function handleMessage(message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const guildId = message.guild.id;

    // ---------- .join ----------
    if (command === 'join') {
        const member = message.member;
        const channel = member.voice.channel;

        if (!channel) {
            return message.reply("❌ You must be inside a voice channel.");
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: guildId,
            adapterCreator: channel.guild.voiceAdapterCreator
        });

        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Pause
            }
        });

        connection.subscribe(player);

        players.set(guildId, {
            connection,
            player
        });

        await message.reply("✅ Joined your voice channel!");
    }

    // ---------- .leave ----------
    else if (command === 'leave') {
        const data = players.get(guildId);

        if (!data) {
            return message.reply("❌ I'm not in a voice channel.");
        }

        data.player.stop();
        data.connection.destroy();
        players.delete(guildId);

        await message.reply("👋 Left the voice channel.");
    }

    // ---------- .play <url> ----------
    else if (command === 'play') {
        const data = players.get(guildId);

        if (!data) {
            return message.reply("❌ Use `.join` first.");
        }

        const url = args[0];

        if (!url) {
            return message.reply("❌ Usage: `.play <url>`");
        }

        try {
            const resource = createAudioResource(url);
            data.player.play(resource);
            await message.reply(`▶️ Playing: ${url}`);
        } catch (error) {
            console.error(error);
            await message.reply(
                "❌ I couldn't play that URL. It must be a direct audio stream."
            );
        }
    }

    // ---------- .pause ----------
    else if (command === 'pause') {
        const data = players.get(guildId);

        if (!data) {
            return message.reply("❌ I'm not connected.");
        }

        data.player.pause();
        await message.reply("⏸️ Paused.");
    }

    // ---------- .resume ----------
    else if (command === 'resume') {
        const data = players.get(guildId);

        if (!data) {
            return message.reply("❌ I'm not connected.");
        }

        data.player.unpause();
        await message.reply("▶️ Resumed.");
    }

    // ---------- .stop ----------
    else if (command === 'stop') {
        const data = players.get(guildId);

        if (!data) {
            return message.reply("❌ I'm not connected.");
        }

        data.player.stop();
        await message.reply("⏹️ Stopped.");
    }
}

// ============================================
//   INIT
// ============================================
function init(mainClient) {
    client = mainClient;

    client.once('ready', () => {
        console.log('🎵 [music] Module initialized');
    });

    client.on('messageCreate', handleMessage);
}

module.exports = { init };
