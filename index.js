// Import necessary libraries
const mineflayer = require('mineflayer');
const { pathfinder } = require('mineflayer-pathfinder');
require('dotenv').config();
const { getAIPlan } = require('./gemini-ai.js');
const { executePlan } = require('./action-executor.js');

// --- CONFIGURATION ---
const botOptions = {
  host: process.env.MINECRAFT_HOST || 'localhost',
  port: parseInt(process.env.MINECRAFT_PORT, 10) || 25565,
  username: process.env.MINECRAFT_USERNAME || 'GeminiBot',
  version: process.env.MINECRAFT_VERSION || '1.20.1',
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MASTER_PLAYER_NAME = process.env.MASTER_PLAYER_NAME;

// --- BOT INITIALIZATION ---
const bot = mineflayer.createBot(botOptions);

// --- LOAD PLUGINS ---
bot.loadPlugin(pathfinder);

// --- BOT SENSES (ENVIRONMENT SCANNING) ---
function getEnvironmentState() {
  const state = {};
  state.health = bot.health;
  state.food = bot.food;
  state.position = bot.entity.position;
  state.inventory = bot.inventory.items().map(item => ({ name: item.name, count: item.count }));
  const blockRadius = 16;
  state.nearbyBlocks = bot.findBlocks({
    matching: () => true,
    maxDistance: blockRadius,
    count: 500
  }).map(p => {
    const block = bot.blockAt(p);
    return { name: block.name, position: block.position };
  });
  state.nearbyEntities = [];
  for (const id in bot.entities) {
    const entity = bot.entities[id];
    if (entity === bot.entity) continue;
    const distance = bot.entity.position.distanceTo(entity.position);
    if (distance > 32) continue;
    state.nearbyEntities.push({
      type: entity.type,
      name: entity.username || entity.name,
      position: entity.position
    });
  }
  return state;
}

// --- BASIC EVENT HANDLERS ---
bot.on('login', () => console.log(`Logged in as ${bot.username}`));
bot.on('spawn', () => {
  console.log('Bot has spawned and is ready.');
  bot.chat("Hello, world! I am the Gemini-powered bot, ready for your commands.");
});
bot.on('kicked', (reason) => console.error('Kicked from server:', reason));
bot.on('end', (reason) => console.log('Disconnected from server:', reason));
bot.on('error', (err) => console.error('Bot encountered an error:', err));


// --- MAIN LOGIC & COMMAND HANDLING ---
bot.on('chat', async (username, message) => {
  if (username !== MASTER_PLAYER_NAME) return;

  if (message.toLowerCase() === 'scan') {
    console.log('Scanning environment...');
    const environment = getEnvironmentState();
    console.log(JSON.stringify(environment, null, 2));
    bot.chat("Scan complete. Check the console.");
    return;
  }

  try {
    bot.chat(`Thinking about your command: "${message}"`);
    console.log(`Received command: "${message}"`);

    const environment = getEnvironmentState();
    const aiResponse = await getAIPlan(message, environment);

    console.log('--- AI Plan Received ---');
    console.log(JSON.stringify(aiResponse, null, 2));
    console.log('------------------------');

    if (aiResponse && aiResponse.plan) {
      // Pass the bot instance and the plan to the executor
      executePlan(bot, aiResponse.plan);
    } else {
      bot.chat("I'm not sure what to do. I couldn't form a plan.");
    }

  } catch (error) {
    console.error("Error during AI command processing:", error);
    bot.chat("I ran into an error while processing your command.");
  }
});


console.log('Bot is starting...');

if (!GEMINI_API_KEY || !MASTER_PLAYER_NAME) {
  console.error('FATAL: GEMINI_API_KEY and MASTER_PLAYER_NAME must be set in your .env file.');
  process.exit(1);
}
