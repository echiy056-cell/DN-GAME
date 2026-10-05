// ============================================
//   ai.js — AI CHAT MODULE
//   El bot yjawbo ki member ya3mlo mention
// ============================================

const fetch = require('node-fetch');

// ============================================
//   ⚙️ CONFIG
// ============================================
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a friendly Discord bot. 
Reply in the same language the user uses (Tunisian Arabic, French, or English).
Be helpful, concise, and friendly. Keep responses under 2000 characters.`;

// ============================================
//   🧠 Generate AI Response
// ============================================
async function generateResponse(userMessage) {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY machi mawjoud');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'Smahni, ma fhemtch.';
}

// ============================================
//   💬 Handle Message
// ============================================
async function handleMessage(message) {
  if (message.author.bot) return;

  // Yarja3 ghir ki ya3mlou mention
  if (!message.mentions.has(message.client.user)) return;

  // N7iyi el mention men el text
  const prompt = message.content
    .replace(/<@!?\d+>/g, '')
    .trim();

  if (!prompt) {
    return message.reply('Chnowa t7eb tes2elni? 😊');
  }

  try {
    await message.channel.sendTyping();

    const reply = await generateResponse(prompt);

    if (reply.length > 2000) {
      const chunks = reply.match(/.{1,1900}/gs) || [];
      for (const chunk of chunks) {
        await message.reply(chunk);
      }
    } else {
      await message.reply(reply);
    }
  } catch (err) {
    console.error('[ai] Error:', err.message);
    message.reply('❌ Fama mochkla, jarreb men ba3d.');
  }
}

// ============================================
//   INIT
// ============================================
function init(client) {
  client.on('messageCreate', handleMessage);
  console.log('🤖 [ai] AI module initialized');
}

module.exports = { init };
