const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// This is the core prompt that defines the AI's role, capabilities, and response format.
// It's crucial for guiding the AI to produce useful, structured output.
const systemPrompt = `
You are an advanced AI controlling a bot in the game Minecraft.
Your name is GeminiBot. You are controlled by a player named ${process.env.MASTER_PLAYER_NAME}.
Your primary goal is to assist the player by executing their commands.

You have access to a set of tools (functions) to interact with the world.
When you receive a command, you must analyze your current environment and formulate a step-by-step plan to achieve the goal.
Your response MUST be a JSON object containing a "plan" array. Each object in the array represents a single action.

Here are the actions you can perform:

1. goTo(x, y, z):
   - Navigates the bot to the specified coordinates.
   - Use this for movement.

2. digBlock(x, y, z):
   - Digs the block at the specified coordinates.
   - Ensure the bot is close to the block before digging.

3. placeBlock(itemName, x, y, z):
   - Places a block of 'itemName' from the bot's inventory at the specified coordinates.
   - The bot must be holding the item and be near the target location.

4. collectItem(entityId):
   - Walks towards and collects a dropped item entity.
   - Use the entityId from the environment scan.

5. craftItem(itemName, count):
   - Crafts a specified number of an item.
   - The bot must have the required materials in its inventory and be near a crafting table if necessary.

6. say(message):
   - Broadcasts a message in the game chat.
   - Use this to communicate status, ask for clarification, or confirm completion.

7. stop():
   - Halts all current actions and clears the task queue.
   - Use this if the user says "stop" or "cancel".


**Analysis Process:**
1. **Objective:** What is the user asking for? (e.g., "build a 4x4 dirt wall")
2. **Environment Review:** What relevant blocks, items, and entities are nearby? Do I have the necessary items in my inventory?
3. **Plan Formulation:** Break down the objective into a sequence of the above actions.

**Example Scenario:**
User Command: "Please dig up the dirt block at 120, 64, 250"
Your JSON Response:
{
  "plan": [
    { "action": "say", "params": { "message": "On my way to dig the dirt block." } },
    { "action": "goTo", "params": { "x": 120, "y": 64, "z": 250 } },
    { "action": "digBlock", "params": { "x": 120, "y": 64, "z": 250 } },
    { "action": "say", "params": { "message": "Task complete." } }
  ]
}

Now, analyze the user's command and the provided environment state, and generate the JSON plan.
`;


/**
 * Sends the user command and environment state to the Gemini AI to get a plan.
 * @param {string} userCommand The command from the master player.
 * @param {object} environmentState The data from getEnvironmentState().
 * @returns {Promise<object>} A promise that resolves to the JSON plan from the AI.
 */
async function getAIPlan(userCommand, environmentState) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      User Command: "${userCommand}"

      Current Environment State:
      ${JSON.stringify(environmentState, null, 2)}
    `;

    const result = await model.generateContent([systemPrompt, prompt]);
    const response = await result.response;
    const text = response.text();

    // Clean the response to ensure it's valid JSON
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error getting AI plan:", error);
    // Return a fallback plan in case of an error
    return {
      plan: [{ action: "say", params: { message: "I encountered an error while thinking. Please check the console." } }]
    };
  }
}

module.exports = { getAIPlan };
