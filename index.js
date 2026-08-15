import { Bot } from 'grammy';
import express from 'express';
import https from 'https';
import http from 'http';

const token = process.env.BOT_TOKEN;

if (!token) {
  console.error('❌ لطفاً BOT_TOKEN را در Secrets تنظیم کنید!');
  process.exit(1);
}

const bot = new Bot(token);

console.log('✅ ربات راه‌اندازی شد!');

// دستور start
bot.command('start', (ctx) => {
  ctx.reply(
    '👋 سلام!\n\n' +
    '📎 لینک دانلود فایل را ارسال کنید\n' +
    'من آن را دانلود و برایتان آپلود می‌کنم'
  );
});

// دریافت لینک
bot.on('message:text', async (ctx) => {
  const text = ctx.message.text;

  if (!text.startsWith('http://') && !text.startsWith('https://')) {
    return ctx.reply('⚠️ لطفاً یک لینک معتبر ارسال کنید');
  }

  try {
    await ctx.reply('⏳ در حال دانلود فایل...');

    const fileName = text.split('/').pop().split('?')[0] || 'file.mkv';
    
    console.log(`📥 دانلود: ${fileName}`);

    // دانلود فایل
    const fileStream = await downloadFile(text);

    console.log(`📤 آپلود به تلگرام...`);

    // ارسال به تلگرام
    await ctx.replyWithDocument({
      url: text,
      filename: fileName
    }, {
      caption: `✅ ${fileName}`
    });

    await ctx.reply('✅ فایل با موفقیت آپلود شد!');
    console.log(`✅ موفق: ${fileName}`);

  } catch (error) {
    console.error('❌ خطا:', error);
    
    let errorMsg = '❌ خطا در پردازش!';
    
    if (error.message.includes('file is too big')) {
      errorMsg = '❌ فایل خیلی بزرگه! (حداکثر 2GB)';
    } else if (error.message.includes('not found')) {
      errorMsg = '❌ فایل پیدا نشد!';
    }
    
    await ctx.reply(errorMsg);
  }
});

// تابع کمکی دانلود
function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 200) {
        resolve(response);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// شروع ربات
bot.start();

// Keep-alive سرور
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Bot is running!');
});

app.listen(PORT, () => {
  console.log(`🌐 Server on port ${PORT}`);
});
