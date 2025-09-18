# 🤖 Minecraft Gemini Bot

Welcome to the Minecraft Gemini Bot, an intelligent and powerful Minecraft companion powered by Google's Gemini AI. This bot can understand natural language commands, analyze its environment, and execute complex tasks within the game.

This project was created by **m1koli4ik + AI**.

---

## ✨ Features

- **Natural Language Understanding:** Give the bot commands in plain English, just like you would to a human player.
- **AI-Powered Planning:** The bot uses the Gemini AI to analyze your requests and create a step-by-step plan to accomplish them.
- **Environmental Awareness:** The bot can see and identify blocks, entities, and items in its vicinity to make informed decisions.
- **Extensible Action System:** The bot's capabilities can be expanded by adding new actions to its core logic.
- **Configurable:** Easily configure the bot to connect to your desired server and operate under your command.

---

## 🚀 Getting Started

Follow these instructions to get your own instance of the Gemini Bot up and running.

### 1. Prerequisites

- **Node.js:** You must have Node.js installed on your computer. You can download it from [nodejs.org](https://nodejs.org/).
- **Minecraft Account:** The bot needs its own Minecraft account to log into online-mode servers.

### 2. Installation

First, download or clone all the project files to a folder on your computer. Then, open a terminal or command prompt in that folder and run the following command to install the necessary libraries:

```bash
npm install
```

### 3. Configuration

The bot's settings are managed through an environment file.

1.  **Create a `.env` file:** In the project directory, make a copy of the `.env.example` file and rename it to `.env`.

2.  **Edit the `.env` file:** Open the new `.env` file in a text editor and fill in the following details:

| Variable             | Description                                                                                                                                                             | Example              |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `MINECRAFT_HOST`     | The IP address of the Minecraft server.                                                                                                                                 | `mc.hypixel.net`     |
| `MINECRAFT_PORT`     | The port of the server. The default is `25565`.                                                                                                                         | `25565`              |
| `MINECRAFT_VERSION`  | The version of the Minecraft server.                                                                                                                                    | `1.20.1`             |
| `MINECRAFT_USERNAME` | The username for the bot's Minecraft account.                                                                                                                           | `MyGeminiBot`        |
| `GEMINI_API_KEY`     | **Crucial.** Your API key for the Gemini AI. Get this from [Google AI Studio](https://aistudio.google.com/app/apikey).                                                     | `AIzaSy...`          |
| `MASTER_PLAYER_NAME` | **Crucial.** Your own Minecraft username. The bot will only listen to commands from this player.                                                                          | `Steve`              |

### 4. Running the Bot

Once you have configured your `.env` file, you can start the bot with the following command:

```bash
npm start
```

You should see log messages in your terminal indicating that the bot is starting and logging into the server.

---

## 🎮 How to Use

Once the bot has joined the Minecraft server, you can command it using the in-game chat.

1.  **Be the Master:** Make sure you are logged into the server with the Minecraft account you specified in `MASTER_PLAYER_NAME`.
2.  **Give Commands:** Simply type your commands into the chat.

### Example Commands:

-   `come to me` (Note: `come to me` is not implemented yet, but you can try to ask the AI to do it!)
-   `dig that tree over there`
-   `build a 3x3 wall of dirt in front of me`
-   `place a crafting table at 100, 64, -200`
-   `stop`

The bot will announce what it's thinking and then execute the plan.

---

## 📁 Project Structure

-   `index.js`: The main entry point of the application. It handles bot initialization, event listeners, and the main command loop.
-   `gemini-ai.js`: Contains all the logic for interacting with the Gemini AI, including the all-important system prompt that defines the bot's behavior.
-   `action-executor.js`: The "hands" of the bot. This module takes the plan from the AI and translates it into `mineflayer` actions.
-   `package.json`: Defines the project and its dependencies.
-   `.env.example`: An example configuration file.
-   `.gitignore`: Prevents the `node_modules` folder and `.env` file from being tracked by Git.
-   `README.md`: This file!