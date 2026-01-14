const TelegramBot = require('node-telegram-bot-api');
const { getDevices } = require('./devices');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

function deviceKeyboard() {
  const buttons = getDevices().map(d => ([
    { text: `${d.online ? '🟢' : '🔴'} ${d.name}`, callback_data: `device_${d.id}` }
  ]));

  buttons.push([{ text: '⬅ Back', callback_data: 'back' }]);

  return { reply_markup: { inline_keyboard: buttons } };
}

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '📱 Device Status', deviceKeyboard());
});

bot.on('callback_query', async (q) => {
  const chatId = q.message.chat.id;
  const data = q.data;

  if (data === 'back') {
    return bot.sendMessage(chatId, '📱 Device Status', deviceKeyboard());
  }

  if (data.startsWith('device_')) {
    const deviceId = data.split('_')[1];

    return bot.sendMessage(chatId, 'Choose Action', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔗 Open Link', callback_data: `open_${deviceId}` }],
          [{ text: '📸 Screenshot (Demo)', callback_data: `shot_${deviceId}` }],
          [{ text: '⬅ Back', callback_data: 'back' }]
        ]
      }
    });
  }

  if (data.startsWith('open_')) {
    bot.sendMessage(chatId, '🔗 Send URL now');
    bot.once('message', (m) => {
      bot.sendMessage(chatId, `✅ URL received:\n${m.text}`);
    });
  }

  if (data.startsWith('shot_')) {
    bot.sendMessage(chatId, '📸 Screenshot demo (no real capture)', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '5 sec', callback_data: 'mock' }],
          [{ text: '10 sec', callback_data: 'mock' }],
          [{ text: 'Stop', callback_data: 'back' }]
        ]
      }
    });
  }
});

module.exports = bot;
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
