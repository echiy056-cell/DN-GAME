// ============================================
//   bot.js — VC ROTATION MODULE + TEMP FIX
//   Works with index.js
// ============================================

const { ChannelType } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

// ============================================
//   ⚙️ CONFIG
// ============================================
const GUILD_ID = process.env.GUILD_ID || '821153079079469076';
const PREFIX = process.env.PREFIX || '.';
const INTERVAL_MS = parseInt(process.env.INTERVAL_MS) || 20000;
const PING_THRESHOLD = parseInt(process.env.PING_THRESHOLD) || 200;
const PING_CHECK_MS = parseInt(process.env.PING_CHECK_MS) || 5000;

const REGIONS = [
  'rotterdam', 'frankfurt', 'london', 'amsterdam', 'paris',
  'us-east', 'us-central', 'us-west', 'singapore', 'japan',
  'brazil', 'sydney',
];
// ============================================

let client;
let voiceChannelIds = [];
let queue = [];
let rotationTimer = null;
let pingTimer = null;
let currentRegionIndex = 0;
let lastRegionChange = 0;
let tempFixTimer = null;
let isTempFix = false;

// ============================================
//   🔍 Load all voice channels
// ============================================
function loadVoiceChannels() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.log('❌ [bot] Guild not found');
    return [];
  }

  voiceChannelIds = guild.channels.cache
    .filter(c => c.type === ChannelType.GuildVoice)
    .sort((a, b) => a.position - b.position)
    .map(c => c.id);

  console.log(`📡 [bot] Found ${voiceChannelIds.length} VC`);
  return voiceChannelIds;
}

// ============================================
//   🔊 Join a voice channel
// ============================================
function joinChannel(channelId) {
  const channel = client.channels.cache.get(channelId);
  if (!channel) return null;

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });
    console.log(`🔊 [bot] Joined: ${channel.name}`);
    return connection;
  } catch (err) {
    console.log(`❌ [bot] Failed to join ${channel.name}: ${err.message}`);
    return null;
  }
}

// ============================================
//   🔄 Rotation (Queue + Random)
// ============================================
function startRotation() {
  if (rotationTimer) return false;
  if (isTempFix) return false;
  if (voiceChannelIds.length === 0) loadVoiceChannels();
  if (voiceChannelIds.length === 0) return false;

  queue = [...voiceChannelIds];
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  joinChannel(queue.shift());

  rotationTimer = setInterval(() => {
    if (isTempFix) return;
    if (queue.length === 0) {
      queue = [...voiceChannelIds];
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    }
    joinChannel(queue.shift());
  }, INTERVAL_MS);

  startPingMonitor();
  return true;
}

function stopRotation() {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
  queue = [];
  stopPingMonitor();

  const connection = getVoiceConnection(GUILD_ID);
  if (connection) {
    connection.destroy();
    return true;
  }
  return false;
}

// ============================================
//   📡 Ping Monitor
// ============================================
function startPingMonitor() {
  if (pingTimer) return;

  pingTimer = setInterval(async () => {
    if (isTempFix) return;
    const connection = getVoiceConnection(GUILD_ID);
    if (!connection) return;

    const ping = client.ws.ping;
    const now = Date.now();

    if (ping > PING_THRESHOLD && (now - lastRegionChange) > 30000) {
      const channel = client.channels.cache.get(connection.joinConfig.channelId);
      if (!channel) return;

      currentRegionIndex = (currentRegionIndex + 1) % REGIONS.length;
      const newRegion = REGIONS[currentRegionIndex];

      try {
        await channel.setRTCRegion(newRegion);
        lastRegionChange = now;
        console.log(`⚠️ [bot] Ping ${ping}ms → region: ${newRegion}`);
      } catch (err) {
        console.log(`❌ [bot] Failed to change region: ${err.message}`);
      }
    }
  }, PING_CHECK_MS);
}

function stopPingMonitor() {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

// ============================================
//   🔧 TEMP FIX — Join your VC, measure, fix
// ============================================
async function tempFix(message) {
  const member = message.member;
  if (!member || !member.voice.channel) {
    return message.reply('❌ You must be in a voice channel');
  }

  const targetChannel = member.voice.channel;

  // Pause rotation
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
    console.log('⏸️ [bot] Rotation paused');
  }

  // Join your VC
  joinChannel(targetChannel.id);
  isTempFix = true;

  await message.reply(`🔧 Joined your VC: **${targetChannel.name}**\n📡 Measuring ping...`);

  let attempts = 0;
  const maxAttempts = 5;

  const fixInterval = setInterval(async () => {
    attempts++;
    const currentPing = client.ws.ping;
    console.log(`📡 [bot] Measure ${attempts}/${maxAttempts}: ${currentPing}ms`);

    if (currentPing > PING_THRESHOLD) {
      currentRegionIndex = (currentRegionIndex + 1) % REGIONS.length;
      const newRegion = REGIONS[currentRegionIndex];
      try {
        await targetChannel.setRTCRegion(newRegion);
        console.log(`⚠️ [bot] ${currentPing}ms → region: ${newRegion}`);
      } catch (err) {
        console.log(`❌ [bot] Failed: ${err.message}`);
      }
    }

    if (attempts >= maxAttempts) {
      clearInterval(fixInterval);
      const finalPing = client.ws.ping;
      const status = finalPing <= PING_THRESHOLD ? '✅' : '⚠️';

      message.channel.send(
        `${status} **Done:**\n• Ping: \`${finalPing}ms\`\n• Region: \`${targetChannel.rtcRegion || 'auto'}\`\n⏱️ Waiting 25s, then resuming rotation...`
      );

      // Wait 25 seconds
      tempFixTimer = setTimeout(() => {
        isTempFix = false;
        message.channel.send('🔄 Resuming rotation...');
        if (!rotationTimer) startRotation();
      }, 25000);
    }
  }, 3000);
}

// ============================================
//   🎮 Commands
// ============================================
async function handleMessage(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ---------- .vcstart ----------
  if (command === 'vcstart') {
    const started = startRotation();
    message.reply(started
      ? `✅ Started rotating over **${voiceChannelIds.length}** VC every ${INTERVAL_MS / 1000}s`
      : (rotationTimer ? '⚠️ Already running' : '❌ No VC found'));
  }

  // ---------- .vcstop ----------
  else if (command === 'vcstop') {
    const stopped = stopRotation();
    message.reply(stopped ? '🛑 Stopped and disconnected' : '⚠️ Not in any VC');
  }

  // ---------- .vcfix ----------
  else if (command === 'vcfix') {
    tempFix(message);
  }

  // ---------- .vcstats ----------
  else if (command === 'vcstats') {
    const connection = getVoiceConnection(GUILD_ID);
    const isRunning = rotationTimer !== null;
    const ping = client.ws.ping;

    let currentVC = 'Not in VC';
    let currentRegion = '—';
    if (connection) {
      const ch = client.channels.cache.get(connection.joinConfig.channelId);
      currentVC = ch ? ch.name : '—';
      currentRegion = ch ? (ch.rtcRegion || 'auto') : '—';
    }

    const guild = client.guilds.cache.get(GUILD_ID);
    const vcList = voiceChannelIds.map(id => {
      const ch = guild.channels.cache.get(id);
      const mark = (connection && connection.joinConfig.channelId === id) ? ' 👈' : '';
      return `• ${ch ? ch.name : id}${mark}`;
    }).join('\n') || 'None';

    const embed = {
      color: isRunning ? (ping > PING_THRESHOLD ? 0xffa500 : 0x00ff00) : 0xff0000,
      title: '📊 VC Bot Status',
      fields: [
        { name: 'Status', value: isTempFix ? '🔧 Temp Fix' : (isRunning ? '🟢 Running' : '🔴 Stopped'), inline: true },
        { name: 'Current VC', value: currentVC, inline: true },
        { name: 'Region', value: currentRegion, inline: true },
        { name: 'Ping', value: `${ping}ms`, inline: true },
        { name: 'VC Count', value: `${voiceChannelIds.length}`, inline: true },
        { name: 'Queue', value: `${queue.length}`, inline: true },
        { name: '📋 VC List', value: vcList.slice(0, 1024) },
      ],
      timestamp: new Date(),
    };

    message.reply({ embeds: [embed] });
  }

  // ---------- .vcreload ----------
  else if (command === 'vcreload') {
    loadVoiceChannels();
    message.reply(`🔄 Reloaded: **${voiceChannelIds.length}** VC`);
  }
}

// ============================================
//   INIT
// ============================================
function init(mainClient) {
  client = mainClient;

  client.once('clientReady', () => {
    console.log('📡 [bot] Module initialized');
    loadVoiceChannels();
  });

  client.on('messageCreate', handleMessage);
}

module.exports = { init };
