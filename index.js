// ============================================
//   DISCORD BOT — DEATH NOTE GAME
//   DEV BY AFGHANI
// ============================================

console.log("🚀 [1] Starting bot...");

const { Client, GatewayIntentBits, Partials } = require("discord.js");

const xo = require("./xo");
const mrwhite = require("./mrwhite");
const crash = require("./crash");
const trivia = require("./trivia");
const menu = require("./menu");

console.log("🚀 [2] Modules loaded OK");

const TOKEN = process.env.TOKEN;

if (!TOKEN) {
  console.error("❌ TOKEN is not set!");
  process.exit(1);
}

console.log("🚀 [3] TOKEN loaded, length:", TOKEN.length);

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

xo.init(client);
mrwhite.init(client);
crash.init(client);
trivia.init(client);
menu.init(client);

console.log("🚀 [5] Modules initialized");

client.once("clientReady", () => {
  console.log("========================================");
  console.log(`✅ Bot ready: ${client.user.tag}`);
  console.log(`DEATH NOTE GAME / DEV BY AFGHANI`);
  console.log("========================================");

  // 🎥 Streaming Mode
  client.user.setActivity("𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐅𝐆𝐇𝐀𝐍𝐈🎴", {
    type: 1,
    url: "https://twitch.tv/afghani",
  });
});

console.log("🚀 [6] Logging in...");

client.login(TOKEN)
  .then(() => console.log("✅ [7] Login success!"))
  .catch((err) => {
    console.error("❌ [7] LOGIN ERROR:", err.message);
    process.exit(1);
  });
