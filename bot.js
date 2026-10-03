// ============================================
//   bot.js — VC ROTATION MODULE
//   يخدم مع index.js
// ============================================

const { ChannelType } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

// ============================================
//   ⚙️ الإعدادات
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

// ============================================
//   🔍 نجيبو الـ VC
// ============================================
function loadVoiceChannels() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) {
    console.log('❌ [bot] ما لقيتش السيرفر');
    return [];
  }

  voiceChannelIds = guild.channels.cache
    .filter(c => c.type === ChannelType.GuildVoice)
    .sort((a, b) => a.position - b.position)
    .map(c => c.id);

  console.log(`📡 [bot] لقيت ${voiceChannelIds.length} VC`);
  return voiceChannelIds;
}

// ============================================
//   🔊 الدخول لـ VC
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
    console.log(`🔊 [bot] دخل لـ: ${channel.name}`);
    return connection;
  } catch (err) {
    console.log(`❌ [bot] فشل يدخل لـ ${channel.name}: ${err.message}`);
    return null;
  }
}

// ============================================
//   🔄 دوران (Queue + Random)
// ============================================
function startRotation() {
  if (rotationTimer) return false;
  if (voiceChannelIds.length === 0) loadVoiceChannels();
  if (voiceChannelIds.length === 0) return false;

  queue = [...voiceChannelIds];
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }

  joinChannel(queue.shift());

  rotationTimer = setInterval(() => {
    if (queue.length === 0) {
      queue = [...voiceChannelIds];
      for (let i = queue.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [queue[i], queue[j]] = [queue[j], queue[i]];
      }
    }
    const nextId = queue.shift();
    joinChannel(nextId);
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
//   📡 مراقبة الـ Ping
// ============================================
function startPingMonitor() {
  if (pingTimer) return;

  pingTimer = setInterval(async () => {
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
        console.log(`❌ [bot] فشل يبدّل region: ${err.message}`);
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
//   🎮 الأوامر
// ============================================
async function handleMessage(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'vcstart') {
    const started = startRotation();
    message.reply(started
      ? `✅ بدا يدور على **${voiceChannelIds.length}** VC كل ${INTERVAL_MS / 1000} ثانية`
      : (rotationTimer ? '⚠️ مازال يدور' : '❌ ما فماش VC'));
  }

  else if (command === 'vcstop') {
    const stopped = stopRotation();
    message.reply(stopped ? '🛑 توقّف وخرج' : '⚠️ ماشي في VC');
  }

  else if (command === 'vcstats') {
    const connection = getVoiceConnection(GUILD_ID);
    const isRunning = rotationTimer !== null;
    const ping = client.ws.ping;

    let currentVC = 'ماشي في VC';
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
    }).join('\n') || 'ما فماش';

    const embed = {
      color: isRunning ? (ping > PING_THRESHOLD ? 0xffa500 : 0x00ff00) : 0xff0000,
      title: '📊 حالة بوت الـ VC',
      fields: [
        { name: 'الحالة', value: isRunning ? '🟢 يخدم' : '🔴 واقف', inline: true },
        { name: 'الـ VC', value: currentVC, inline: true },
        { name: 'Region', value: currentRegion, inline: true },
        { name: 'Ping', value: `${ping}ms`, inline: true },
        { name: 'عدد VC', value: `${voiceChannelIds.length}`, inline: true },
        { name: 'الطابور', value: `${queue.length}`, inline: true },
        { name: '📋 القائمة', value: vcList.slice(0, 1024) },
      ],
      timestamp: new Date(),
    };

    message.reply({ embeds: [embed] });
  }

  else if (command === 'vcreload') {
    loadVoiceChannels();
    message.reply(`🔄 تعاود تحميل: **${voiceChannelIds.length}** VC`);
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
