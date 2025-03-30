import 'dotenv/config';
import Hapi from '@hapi/hapi';
import TelegramBot from 'node-telegram-bot-api';
import { PrismaClient, User } from '@prisma/client';

const prisma = new PrismaClient();

// Проверка наличия токена
if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN не установлен в .env файле');
  process.exit(1);
}

// Инициализация Telegram бота в режиме long polling
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Обработчик сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  console.log('Получено сообщение:', text);
  await bot.sendMessage(chatId, `Эхо: ${text}`);
});

// Создание Hapi сервера
const server = Hapi.server({
  port: process.env.PORT || 3000,
  host: 'localhost',
  routes: {
    cors: {
      origin: ['*'],
      credentials: true,
      additionalExposedHeaders: ['content-encoding'],
      exposedHeaders: ['content-encoding'],
      additionalHeaders: ['telegram-data']
    }
  }
});

// Базовый маршрут
server.route({
  method: 'GET',
  path: '/',
  handler: (request, h) => {
    return '<h1>Добро пожаловать на наш сервер!</h1>';
  }
});

// Healthcheck
server.route({
  method: 'GET',
  path: '/health',
  handler: (request, h) => {
    return { 
      status: 'ok',
      message: 'Сервер работает корректно '
    };
  }
});

// Запуск сервера
const init = async () => {
  try {
    await server.start();
    console.log('Сервер запущен на %s', server.info.uri);
  } catch (err) {
    console.error('Ошибка при запуске/работе сервера:', err);
    process.exit(1);
  }
};

server.route({
  method: 'POST',
  path: '/api/pets/my',
  handler: async (request, h) => {
    try {
    const ownerId = request.payload.toString();
    const pet = await prisma.pet.findFirst({
         where: {
            ownerId: ownerId
         }
     });
    return { 
      status: 'OK',
      message: JSON.stringify(pet)
    };
  } catch(e) {
    return { 
      status: 'error',
      message: e?.toString()
    };
  }
  }
});

server.route({
  method: 'POST',
  path: '/login',
  handler: async (request, h) => {
    try {
      let { user } = request.payload;
  
      const userData = await prisma.user.upsert({
          where: {
              telegramId: user.id.toString(),
          },
          update: {
            lastActive: new Date(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            photoUrl: user.photo_url,
            language: user.language || 'ru',
            isPremium: user.is_premium,
          },
          create: {
            telegramId: user.telegramId.toString(),
            lastActive: new Date(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            photoUrl: user.photo_url,
            language: user.language || 'ru',
            isPremium: user.is_premium,
          }
      });
      return { 
        status: 'OK',
        message: JSON.stringify(userData)
      };
      return {}
  } catch(e) {
    return { 
      status: 'error',
      message: e?.toString()
    };
  }
  }
});

init(); 