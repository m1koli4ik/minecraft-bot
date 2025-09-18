const { Movements, GoalNear } = require('mineflayer-pathfinder');

// A simple queue to ensure tasks are executed one at a time.
let taskQueue = [];
let isExecuting = false;

/**
 * Executes a plan from the AI, which is a sequence of actions.
 * @param {object} bot The mineflayer bot instance.
 * @param {Array<object>} plan The array of actions from the AI.
 */
function executePlan(bot, plan) {
  if (!plan || plan.length === 0) {
    console.log("Executor: Received an empty or invalid plan.");
    return;
  }

  // Add new tasks to the queue
  taskQueue.push(...plan);

  // If not already executing, start processing the queue
  if (!isExecuting) {
    processNextTask(bot);
  }
}

/**
 * Processes the next task in the queue.
 * @param {object} bot The mineflayer bot instance.
 */
async function processNextTask(bot) {
  if (taskQueue.length === 0) {
    isExecuting = false;
    console.log("Executor: Task queue is empty. Awaiting new plans.");
    return;
  }

  isExecuting = true;
  const task = taskQueue.shift(); // Get the next task

  console.log(`Executor: Executing action: ${task.action}`, task.params);

  try {
    await performAction(bot, task);
  } catch (error) {
    console.error(`Executor: Error performing action "${task.action}":`, error.message);
    bot.chat(`I failed to perform the action: ${task.action}. Reason: ${error.message}`);
    // Optional: clear the queue on failure to prevent cascading errors
    // taskQueue = [];
  }

  // Process the next task
  processNextTask(bot);
}

/**
 * Performs a single action based on the task object.
 * @param {object} bot The mineflayer bot instance.
 * @param {object} task The task object { action, params }.
 */
async function performAction(bot, task) {
  const { action, params } = task;

  switch (action.toLowerCase()) {
    case 'say':
      bot.chat(params.message);
      break;

    case 'goto':
      await goTo(bot, params.x, params.y, params.z);
      break;

    case 'digblock':
      await digBlock(bot, params.x, params.y, params.z);
      break;

    case 'placeblock':
      await placeBlock(bot, params.itemName, params.x, params.y, params.z);
      break;

    case 'stop':
      taskQueue = []; // Clear the task queue
      bot.pathfinder.stop();
      bot.chat("I have stopped all my current tasks.");
      break;

    // Cases for collectItem and craftItem would be added here
    // case 'collectitem':
    //   ...
    //   break;
    // case 'craftitem':
    //   ...
    //   break;

    default:
      console.warn(`Executor: Unknown action "${action}". Skipping.`);
      bot.chat(`I don't know how to perform the action: "${action}".`);
  }
}

// --- Action Implementations ---

async function goTo(bot, x, y, z) {
  const defaultMove = new Movements(bot);
  bot.pathfinder.setMovements(defaultMove);
  await bot.pathfinder.goto(new GoalNear(x, y, z, 1)); // Goal is to be within 1 block
}

async function digBlock(bot, x, y, z) {
  const targetBlock = bot.blockAt(new bot.vec3(x, y, z));
  if (!targetBlock) {
    throw new Error(`No block found at ${x}, ${y}, ${z}.`);
  }
  await bot.dig(targetBlock);
}

async function placeBlock(bot, itemName, x, y, z) {
    const referenceBlock = bot.blockAt(new bot.vec3(x, y, z).offset(0, -1, 0));
    if (!referenceBlock) {
        throw new Error(`No reference block found to place on at ${x}, ${y}, ${z}.`);
    }

    const item = bot.inventory.items().find(i => i.name === itemName);
    if (!item) {
        throw new Error(`I don't have a '${itemName}' in my inventory.`);
    }

    await bot.equip(item, 'hand');
    await bot.placeBlock(referenceBlock, new bot.vec3(0, 1, 0));
}

module.exports = { executePlan };
