// ============================================
//   DISCORD BOT — DEATH NOTE GAME
//   DEV BY AFGHANI
// ============================================

console.log("🚀 [1] Starting bot...");

const { Client, GatewayIntentBits, Partials } = require("discord.js");

const invest = require("./invest");
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

console.log("🚀 [2] Modules loaded OK");

// ============================================
//   ✅ TOKEN من Railway Variables
// ============================================
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ TOKEN is not set! Add TOKEN to Railway Variables.");
  process.exit(1);
}

console.log("🚀 [3] TOKEN loaded, length:", TOKEN.length);

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

console.log("🚀 [4] Client created");

// ============================================
//   START BOT
// ============================================
async function startBot() {
  try {
    console.log("🚀 [5] Initializing modules...");
    invest.init(client);
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

    console.log("✅ [6] Modules initialized");

    console.log("🚀 [7] Logging in...");
    await client.login(TOKEN);
    console.log("✅ [8] Login success!");
  } catch (err) {
    console.error("❌ [ERROR] Failed to start bot:", err);
    process.exit(1);
  }
}

client.once("clientReady", () => {
  console.log("========================================");
  console.log(`✅ Bot ready: ${client.user.tag}`);
  console.log(`DEATH NOTE GAME / DEV BY AFGHANI`);
  console.log("========================================");

  client.user.setActivity("💼 .invest | 🎮 .games", {
    type: 2,
    url: "https://twitch.tv/afghani",
  });
});

// ✅ Start
startBot();
