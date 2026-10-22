// ============================================
//   🛑 BAD WORDS SYSTEM (ADDED)
// ============================================
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const { AttachmentBuilder } = require('discord.js');

// ============================================
//   DISCORD BOT — DEATH NOTE GAME
//   DEV BY AFGHANI
//   index.js — Main entry (links modules only)
// ============================================

console.log("🚀 [1] Starting bot...");

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const db = require("./database");

// ============================================
//   📦 Modules
// ============================================
const xo = require("./xo");
const mrwhite = require("./mrwhite");
const crash = require("./crash");
const trivia = require("./trivia");
const candy = require("./candy");
const slots = require("./slots");
const roulette = require("./roulette");
const gameRoom = require("./gameRoom");
const joinlog = require("./joinlog");
const menu = require("./menu");
const vcBot = require("./bot");

console.log("🚀 [2] Modules loaded OK");

// ============================================
//   ✅ TOKEN
// ============================================
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ TOKEN is not set! Add TOKEN to Railway Variables.");
  process.exit(1);
}

console.log("🚀 [3] TOKEN loaded, length:", TOKEN.length);

// ============================================
//   🤖 Client
// ============================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.User],
});

client.setMaxListeners(20);

console.log("🚀 [4] Client created");

// ============================================
//   🛑 BAD WORDS SYSTEM (ADDED HERE)
// ============================================

// ===== Log channel ID =====
const LOG_CHANNEL_ID = '1562928073257656361';

// ===== WHITELIST =====
const whitelistUsers = [
    '825331937756315649',  // Rio
    '1035011002623852655', // Snake
    '804523410343591957',  // Manga
];

const whitelistRoles = [
    '893961008014569472',  // Developer
    '919222169681166336',  // Higher Staff
    '1237029723071315978', // GS
    '1459962579056201963', // 9aleb
];

function isWhitelisted(member) {
    if (!member) return false;
    if (whitelistUsers.includes(member.id)) return true;
    if (member.roles && member.roles.cache) {
        for (const roleId of whitelistRoles) {
            if (member.roles.cache.has(roleId)) return true;
        }
    }
    return false;
}

// ===== Counter file =====
const COUNTER_FILE = path.join(__dirname, 'badword-counts.json');

function loadCounts() {
    try {
        if (fs.existsSync(COUNTER_FILE)) {
            return JSON.parse(fs.readFileSync(COUNTER_FILE, 'utf8'));
        }
    } catch (e) {
        console.error('Failed to load counts:', e);
    }
    return {};
}

function saveCounts(counts) {
    try {
        fs.writeFileSync(COUNTER_FILE, JSON.stringify(counts, null, 2));
    } catch (e) {
        console.error('Failed to save counts:', e);
    }
}

function incrementCount(userId) {
    const counts = loadCounts();
    counts[userId] = (counts[userId] || 0) + 1;
    saveCounts(counts);
    return counts[userId];
}

// ===== Banned words (Latin) =====
const bannedWordsLatin = [
    'naiek', 'zbi', 'nayek', 'zeby', 'zbby', 'zbii',
    'rbbk', 'rbk', 'rabk', 'rabek', 'rbbbk', 'rbmk',
    '3sba', 'asba', 'aasba', 'l3sba', 'l3asba', 'laasba',
    'nik', 'zok', 'sorm', 'nikomk', 'niik', 'niko',
    '97ba', '9hba', '9a7ba', '9ahba', '9hbaa',
    'zabb', 'zab', 'zbb',
    'miboun', 'mibouna', 'mibon',
    'mnayek', 'mnaik', 'mnayk',
    'niii', 'nii', 'niiii', 'niiiikom',
    'Rbm3dnos', 'naandinraab', 'Rbayeeb',
    '3asba', 'Bachola', 'Zbayeb', 'Zboba', 'Nika', 'Zeb',
    'Nam', 'Omk', 'Nikeh', '97iba', '9a7boba', '97ibiba',
    'Zokomek', 'Zokek', 'Sormomek', 'Omek', 'Nikek',
    'Sormi', 'Nami', 'Namouma', 'Fsormi',
    'Rbayba', 'Rboba', 'Rabrob', 'Rabreb',
    'Zibi', '3asebti', '3asbat', 'N3aseblk', 'Nba3bsek',
    'Tba3bis', 'Nona', 'Nountek', 'Mimtek'
];

// ===== Banned words (Arabic) =====
const bannedWordsArabic = [
    'زبي', 'زب', 'ربي', 'رب',
    'عصبة', 'عصيبة', 'عصبوبة', 'عصبيبة',
    'نونة', 'نونا', 'نونه', 'نونتي',
    'نام', 'نم', 'نيك', 'نيكه', 'نيكة',
    'امك', 'امي', 'ميمتي', 'ميمتك',
    'بشولة', 'بشيشلة',
    'تبعبيص', 'بعبوصة', 'نبعبصك',
    'صرمك', 'ميبون'
];

// ===== Banned phrases =====
const bannedWordsPhrase = [
    'niiik omk', 'nik omk', 'niik omk', 'niiiik omk',
    'Nandiirr r1bk', 'Nandirr illehek', 'Nandinn roubaybek',
    'nik omek', 'nik omok', 'zbi omk'
];

// ===== Strict normalization =====
function normalize(text) {
    let t = text.toLowerCase();
    t = t.replace(/[^\p{L}\p{N}]+/gu, '');
    t = t.replace(/(.)\1+/g, '$1');
    t = t
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/7/g, 't')
        .replace(/9/g, 'g')
        .replace(/5/g, 's');
    t = t
        .replace(/[أإآ]/g, 'ا')
        .replace(/ة/g, 'ه')
        .replace(/ى/g, 'ي')
        .replace(/ؤ/g, 'و')
        .replace(/ئ/g, 'ي');
    return t;
}

const allSingle = [...bannedWordsLatin, ...bannedWordsArabic];
const allPhrases = [...bannedWordsPhrase];
const normalizedSingles = [...new Set(allSingle.map(normalize))].filter(Boolean);
const normalizedPhrases = [...new Set(allPhrases.map(normalize))].filter(Boolean);

const LONG_WORDS = normalizedSingles.filter(w => w.length >= 3);
const SHORT_WORDS = normalizedSingles.filter(w => w.length < 3);

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const shortWordRegex = SHORT_WORDS.length > 0
    ? new RegExp(`(?<![\\p{L}\\p{N}])(${SHORT_WORDS.map(escapeRegex).join('|')})(?![\\p{L}\\p{N}])`, 'giu')
    : null;

function containsBadWord(content) {
    const normalizedContent = normalize(content);
    for (const word of LONG_WORDS) {
        if (normalizedContent.includes(word)) return true;
    }
    if (shortWordRegex && shortWordRegex.test(normalizedContent)) return true;
    for (const phrase of normalizedPhrases) {
        if (phrase.length >= 3 && normalizedContent.includes(phrase)) return true;
    }
    return false;
}

async function generateBadWordImage(author, channelName, badContent, count) {
    const width = 800;
    const height = 400;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#8B0000');
    gradient.addColorStop(0.5, '#4a0000');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(255, 0, 0, 0.05)';
    ctx.beginPath();
    ctx.arc(650, 100, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(100, 350, 150, 0, Math.PI * 2);
    ctx.fill();

    try {
        const avatarURL = author.displayAvatarURL({ extension: 'png', size: 256 });
        const avatar = await loadImage(avatarURL);
        ctx.save();
        ctx.beginPath();
        ctx.arc(100, 100, 60, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(avatar, 40, 40, 120, 120);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(100, 100, 60, 0, Math.PI * 2);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.stroke();
    } catch (e) {
        console.error('Avatar load failed:', e);
    }

    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(`User: ${author.username}`, 180, 70);

    ctx.font = '22px Arial';
    ctx.fillStyle = '#FFAAAA';
    ctx.fillText(`Room: #${channelName}`, 180, 110);

    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 170);
    ctx.lineTo(width - 50, 170);
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('Message:', 50, 200);

    ctx.font = '24px Arial';
    ctx.fillStyle = '#FF5555';
    const displayContent = badContent.length > 50 ? badContent.slice(0, 47) + '...' : badContent;
    ctx.fillText(displayContent, 50, 240);

    ctx.font = 'bold 18px Arial';
    ctx.fillStyle = '#FFAAAA';
    ctx.fillText('Bad Words Count:', 50, 300);

    ctx.font = 'bold 56px Arial';
    ctx.fillStyle = '#FF3333';
    ctx.fillText(`${count}`, 50, 345);

    const bigNumberWidth = ctx.measureText(`${count}`).width;
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFAAAA';
    ctx.fillText('times', 50 + bigNumberWidth + 10, 355);

    ctx.save();
    ctx.font = 'bold 60px Arial';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.textAlign = 'right';
    ctx.fillText('BAD WORD', width - 30, height - 40);
    ctx.restore();

    return canvas.toBuffer();
}

// ===== Event: new message =====
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.system) return;

    if (isWhitelisted(message.member)) return;

    if (containsBadWord(message.content)) {
        try {
            const deletedContent = message.content;
            const author = message.author;
            const channelName = message.channel.name;

            await message.delete();
            const count = incrementCount(author.id);

            const imageBuffer = await generateBadWordImage(author, channelName, deletedContent, count);
            const attachment = new AttachmentBuilder(imageBuffer, { name: 'bad-word-log.png' });

            try {
                const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);
                if (logChannel && logChannel.isTextBased()) {
                    await logChannel.send({ files: [attachment] });
                }
            } catch (logError) {
                console.error('Error sending log image:', logError);
            }

        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    }
});
// ============================================
//   🛑 END OF BAD WORDS SYSTEM
// ============================================


// ============================================
//   ▶️ Start
// ============================================
async function startBot() {
  try {
    console.log("🚀 [5] Initializing database...");
    await db.initDatabase();
    console.log("✅ [5.1] Database initialized");

    console.log("🚀 [6] Initializing modules...");
    xo.init(client);
    mrwhite.init(client);
    crash.init(client);
    trivia.init(client);
    candy.init(client);
    slots.init(client);
    roulette.init(client);
    gameRoom.init(client);
    joinlog.init(client);
    menu.init(client);
    vcBot.init(client);

    console.log("✅ [7] Modules initialized");

    console.log("🚀 [8] Logging in...");
    await client.login(TOKEN);
    console.log("✅ [9] Login success!");
  } catch (err) {
    console.error("❌ [ERROR] Failed to start bot:", err);
    process.exit(1);
  }
}

// ============================================
//   ✅ Ready
// ============================================
client.once("clientReady", () => {
  console.log("========================================");
  console.log(`✅ Bot ready: ${client.user.tag}`);
  console.log("DEATH NOTE GAME / DEV BY AFGHANI");
  console.log("========================================");

  client.user.setActivity("💬 Mention me! | 🎮 .games", {
    type: 2,
    url: "https://twitch.tv/afghani",
  });
});

// ✅ Start
startBot();
