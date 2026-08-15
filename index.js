const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const stream = require('stream');

const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('Bot started...');

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || (!text.startsWith('http://') && !text.startsWith('https://'))) {
    return bot.sendMessage(chatId, '📎 لطفاً لینک دانلود فایل را ارسال کنید.');
  }

  try {
    await bot.sendMessage(chatId, '⏳ در حال دانلود و آپلود...');
    
    // دریافت نام فایل
    const fileName = text.split('/').pop().split('?')[0] || 'file.mkv';
    
    // دانلود فایل به صورت استریم
    const response = await axios({
      method: 'GET',
      url: text,
      responseType: 'stream',
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    // ارسال به تلگرام
    await bot.sendDocument(chatId, response.data, {
      caption: `📥 ${fileName}`
    }, {
      filename: fileName,
      contentType: 'video/x-matroska'
    });

    await bot.sendMessage(chatId, '✅ فایل با موفقیت آپلود شد!');

  } catch (error) {
    console.error(error);
    await bot.sendMessage(chatId, `❌ خطا: ${error.message}`);
  }
});

// Keep alive
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Bot is running!');
});
server.listen(process.env.PORT || 3000);
