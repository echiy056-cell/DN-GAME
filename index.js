// ============================================
//   DISCORD XO BOT — DEATH NOTE GAME
//   DEV BY AFGHANI
//   Main entry file — connects everything
// ============================================

console.log("🚀 [1] Starting bot...");

const { Client, GatewayIntentBits, Partials } = require("discord.js");
const xo = require("./xo");

console.log("🚀 [2] xo.js loaded OK");

// ============ TOKEN ============
const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ TOKEN is not set in Environment Variables!");
  process.exit(1);
}

console.log("🚀 [3] TOKEN loaded, length:", TOKEN.length);

// ============ CLIENT ============
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.User],
});

console.log("🚀 [4] Client created");

// ============ INIT XO MODULE ============
xo.init(client);

console.log("🚀 [5] XO module initialized");

// ============ READY ============
client.once("clientReady", () => {
  console.log("========================================");
  console.log(`✅ Bot ready: ${client.user.tag}`);
  console.log(`🖋️  DEATH NOTE GAME / DEV BY AFGHANI`);
  console.log("========================================");
  client.user.setActivity(".xo help", { type: 3 });
});

// ============ LOGIN ============
console.log("🚀 [6] Logging in...");

client.login(TOKEN)
  .then(() => console.log("✅ [7] Login success!"))
  .catch((err) => {
    console.error("❌ [7] LOGIN ERROR:", err.message);
    process.exit(1);
  });
