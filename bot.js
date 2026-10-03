// ============================================
//   bot.js — VC ROTATION MODULE + TEMP FIX
// ============================================

const { ChannelType } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");

// ====== الإعدادات ======
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
// =======================

let client;
let voiceChannelIds = [];
let queue = [];
let rotationTimer = null;
let pingTimer = null;
let currentRegionIndex = 0;
let lastRegionChange = 0;
let tempFixTimer = null;
let isTempFix = false;

// ====== نجيبو الـ VC ======
function loadVoiceChannels() {
  const guild = client.guilds.cache.get(GUILD_ID);
  if (!guild) return [];
  voiceChannelIds = guild.channels.cache
    .filter(c => c.type === ChannelType.GuildVoice)
    .sort((a, b) => a.position - b.position)
    .map(c => c.id);
  console.log(`📡 [bot] لقيت ${voiceChannelIds.length} VC`);
  return voiceChannelIds;
}

// ====== دخول VC ======
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
    console.log(`❌ [bot] فشل: ${err.message}`);
    return null;
  }
}

// ====== الدوران ======
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

// ====== Ping Monitor ======
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
      try {
        await channel.setRTCRegion(REGIONS[currentRegionIndex]);
        lastRegionChange = now;
        console.log(`⚠️ [bot] Ping ${ping}ms → ${REGIONS[currentRegionIndex]}`);
      } catch (err) {}
    }
  }, PING_CHECK_MS);
}

function stopPingMonitor() {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
  }
}

// ====== 🔧 TEMP FIX ======
async function tempFix(message) {
  const member = message.member;
  if (!member || !member.voice.channel) {
    return message.reply('❌ لازم تكون في VC باش نعاونك');
  }

  const targetChannel = member.voice.channel;

  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }

  joinChannel(targetChannel.id);
  isTempFix = true;

  await message.reply(`🔧 جيت للـ VC: **${targetChannel.name}**\n📡 نقيس...`);

  let attempts = 0;
  const maxAttempts = 5;

  const fixInterval = setInterval(async () => {
    attempts++;
    const currentPing = client.ws.ping;
    console.log(`📡 [bot] قياس ${attempts}/${maxAttempts}: ${currentPing}ms`);

    if (currentPing > PING_THRESHOLD) {
      currentRegionIndex = (currentRegionIndex + 1) % REGIONS.length;
      const newRegion = REGIONS[currentRegionIndex];
      try {
        await targetChannel.setRTCRegion(newRegion);
        console.log(`⚠️ [bot] ${currentPing}ms → ${newRegion}`);
      } catch (err) {}
    }

    if (attempts >= maxAttempts) {
      clearInterval(fixInterval);
      const finalPing = client.ws.ping;
      const status = finalPing <= PING_THRESHOLD ? '✅' : '⚠️';
      message.channel.send(`${status} **خلص:**\n• Ping: \`${finalPing}ms\`\n• Region: \`${targetChannel.rtcRegion || 'auto'}\`\n⏱️ 25 ثانية...`);

      tempFixTimer = setTimeout(() => {
        isTempFix = false;
        message.channel.send('🔄 رجعت للدوران...');
        if (!rotationTimer) startRotation();
      }, 25000);
    }
  }, 3000);
}

// ====== الأوامر ======
async function handleMessage(message) {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'vcstart') {
    const started = startRotation();
    message.reply(started
      ? `✅ بدا يدور على **${voiceChannelIds.length}** VC`
      : (rotationTimer ? '⚠️ مازال يدور' : '❌ ما فماش VC'));
  }

  else if (command === 'vcstop') {
    const stopped = stopRotation();
    message.reply(stopped ? '🛑 توقّف' : '⚠️ ماشي في VC');
  }

  else if (command === 'vcfix') {
    tempFix(message);
  }

  else if (command === 'vcstats') {
    const connection = getVoiceConnection(GUILD_ID);
    const isRunning = rotationTimer !== null;
    const ping = client.ws.ping;
    let currentVC = 'ماشي';
    let currentRegion = '—';
    if (connection) {
      const ch = client.channels.cache.get(connection.joinConfig.channelId);
      currentVC = ch ? ch.name : '—';
      currentRegion = ch ? (ch.rtcRegion || 'auto') : '—';
    }
    message.reply({ embeds: [{
      color: isRunning ? 0x00ff00 : 0xff0000,
      title: '📊 حالة البوت',
      fields: [
        { name: 'الحالة', value: isTempFix ? '🔧 Temp Fix' : (isRunning ? '🟢 يخدم' : '🔴 واقف'), inline: true },
        { name: 'VC', value: currentVC, inline: true },
        { name: 'Region', value: currentRegion, inline: true },
        { name: 'Ping', value: `${ping}ms`, inline: true },
        { name: 'عدد VC', value: `${voiceChannelIds.length}`, inline: true },
      ],
      timestamp: new Date(),
    }]});
  }

  else if (command === 'vcreload') {
    loadVoiceChannels();
    message.reply(`🔄 تعاود: **${voiceChannelIds.length}** VC`);
  }
}

// ====== INIT ======
function init(mainClient) {
  client = mainClient;
  client.once('clientReady', () => {
    console.log('📡 [bot] Module initialized');
    loadVoiceChannels();
  });
  client.on('messageCreate', handleMessage);
}

module.exports = { init };
