const { Telegraf } = require('telegraf');
const axios = require('axios');
const express = require('express');

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ توکن ربات را در Secrets وارد کنید!');
  process.exit(1);
}

const bot = new Telegraf(token);

console.log('✅ ربات شروع به کار کرد!');

// دستور start
bot.start((ctx) => {
  ctx.reply(
    '👋 سلام!\n\n' +
    '📎 لینک دانلود فایل را بفرستید\n' +
    'من آن را دانلود و آپلود می‌کنم'
  );
});

// دریافت پیام
bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  if (!text.startsWith('http://') && !text.startsWith('https://')) {
    return ctx.reply('⚠️ لطفاً یک لینک معتبر ارسال کنید');
  }

  try {
    await ctx.reply('⏳ در حال دانلود...');

    const fileName = text.split('/').pop().split('?')[0] || 'file.mkv';
    
    console.log(`📥 دانلود شروع شد: ${fileName}`);

    // دانلود فایل
    const response = await axios({
      method: 'GET',
      url: text,
      responseType: 'stream',
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log(`📤 آپلود به تلگرام...`);

    // آپلود به تلگرام
    await ctx.replyWithDocument(
      {
        source: response.data,
        filename: fileName
      },
      {
        caption: `✅ ${fileName}`
      }
    );

    await ctx.reply('✅ آپلود موفق!');
    console.log(`✅ تمام شد: ${fileName}`);

  } catch (error) {
    console.error('❌ خطا:', error.message);
    
    let msg = '❌ خطا در پردازش!';
    
    if (error.response?.status === 404) {
      msg = '❌ فایل پیدا نشد!';
    } else if (error.code === 'ENOTFOUND') {
      msg = '❌ لینک نامعتبر است!';
    } else if (error.message.includes('too large')) {
      msg = '❌ فایل خیلی بزرگه!';
    }
    
    await ctx.reply(msg);
  }
});

// راه‌اندازی ربات
bot.launch();

// Keep-alive
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 ربات فعال است!');
});

app.listen(PORT, () => {
  console.log(`🌐 سرور روی پورت ${PORT} اجرا شد`);
});

// مدیریت خاموش شدن
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
