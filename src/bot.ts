import 'dotenv/config';
import TelegramBot from 'node-telegram-bot-api';
// Проверка наличия токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN не установлен в .env файле');
  process.exit(1);
}

// Инициализация Telegram бота в режиме long polling
export const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { webHook: true });

// Обработчик сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  console.log('Получено сообщение:', text);
  await bot.sendMessage(chatId, `Эхо: ${text}`);
});
