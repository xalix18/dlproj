const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || (!text.startsWith('http://') && !text.startsWith('https://'))) {
    return bot.sendMessage(chatId, '📎 لینک فایل را ارسال کنید');
  }

  try {
    await bot.sendMessage(chatId, '⏳ شروع دانلود...');
    
    const fileName = text.split('/').pop().split('?')[0];
    
    const response = await axios({
      url: text,
      method: 'GET',
      responseType: 'stream',
      timeout: 0,
      maxContentLength: Infinity
    });

    await bot.sendDocument(chatId, response.data, {}, {
      filename: fileName,
      contentType: 'application/octet-stream'
    });

    await bot.sendMessage(chatId, '✅ فایل آپلود شد!');
  } catch (err) {
    await bot.sendMessage(chatId, `❌ خطا: ${err.message}`);
  }
});

// Keep alive
const app = express();
app.get('/', (req, res) => res.send('Running'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));

console.log('Bot is running...');
