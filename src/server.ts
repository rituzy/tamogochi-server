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

type UserData = {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    username: string;
    language_code: string;
    photo_url: string;
    is_premium: boolean;
  }
};

server.route({
  method: 'POST',
  path: '/login',
  handler: async (request, h) => {
    try {
      const u = request.payload as UserData;
      const user = u.user;
      
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
            language: user.language_code || 'ru',
            isPremium: user.is_premium || false,
          },
          create: {
            telegramId: user.id.toString(),
            lastActive: new Date(),
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
            photoUrl: user.photo_url,
            language: user.language_code || 'ru',
            isPremium: user.is_premium || false,
          }
      });
      
      return { 
        status: 'OK',
        message: userData
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
  method: 'GET',
  path: '/api/pets/my',
  handler: async (request, h) => {
    try {
      const userId = request.query.userId as string;
      console.log(userId);
      const petData = await prisma.pet.upsert({
          where: {
            ownerId: userId,
          },
          update: {
            ownerId: userId
          },
          create: {
            ownerId: userId
          }
      });
      
      return { 
        status: 'OK',
        message: petData
      };

    } catch(e) {
      return { 
        status: 'error',
        message: e?.toString()
      };
    }
  }
});

type PetId = {
  petId: string;
};

server.route({
  method: 'POST',
  path: '/api/pets/feed',
  handler: async (request, h) => {
    try {
      const petReq = request.payload as PetId;
      const petId = petReq.petId;
      console.log(petId);

      const petData = await prisma.pet.findUnique({
          where: {
            id: petId,
          }
      });
      
      if (petData == undefined) {
        return { 
          status: 'error',
          message: 'Could not find a pet with id ' + petId
        }; 
      }

      updatePetStatus(petData);

      const newHunger = Math.min(100, petData.hunger + 20 + petData.feedBonus);
      const newEnergy = Math.min(100, petData.energy + 5);
      const newLastFeed = new Date();

      const petDataFed = await prisma.pet.update({
        where: {
          id: petId,
        },
        data: {
          hunger: newHunger,
          energy: newEnergy,
          lastFeed: newLastFeed
        }
    });

      return { 
        status: 'OK',
        message: 'Питомец покормлен',
        "pet": {
          "id": petId,
          "hunger": newHunger,
          "energy": newEnergy,
        }
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
  path: '/api/pets/play',
  handler: async (request, h) => {
    try {
      const petReq = request.payload as PetId;
      const petId = petReq.petId;

      const petData = await prisma.pet.findUnique({
          where: {
            id: petId,
          }
      });
      
      if (petData == undefined) {
        return { 
          status: 'error',
          message: 'Could not find a pet with id ' + petId
        }; 
      }

      updatePetStatus(petData);

      const newHappiness = Math.min(100, petData.happiness + 20 + petData.happyBonus);
      const newKnowledge = Math.min(petData.knowledge + 5);
      const newHunger = Math.max(petData.hunger - 10, 0);
      const newEnergy = Math.max(petData.energy - 20, 0);
      const newLastPlay = new Date();

      const petDataPlay = await prisma.pet.update({
        where: {
          id: petId,
        },
        data: {
          happiness: newHappiness,
          knowledge: newKnowledge,
          hunger: newHunger,
          energy: newEnergy,
          lastPlay: newLastPlay
        }
    });

      return { 
        status: 'OK',
        message: 'Вы поиграли с питомцем',
        "pet": {
          "happiness": newHappiness,
          "knowledge": newKnowledge,
        }
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
  path: '/api/pets/sleep',
  handler: async (request, h) => {
    try {
      const petReq = request.payload as PetId;
      const petId = petReq.petId;

      const petData = await prisma.pet.findUnique({
          where: {
            id: petId,
          }
      });
      
      if (petData == undefined) {
        return { 
          status: 'error',
          message: 'Could not find a pet with id ' + petId
        }; 
      }

      updatePetStatus(petData);

      const newHunger = Math.max(petData.hunger - 5, 0);
      const newEnergy = 100;
      const newLastSleep = new Date();

      const petDataSleep = await prisma.pet.update({
        where: {
          id: petId,
        },
        data: {
          hunger: newHunger,
          energy: newEnergy,
          lastSleep: newLastSleep
        }
    });

      return { 
        status: 'OK',
        message: 'Питомец поспал',
        "pet": {
          "energy": newEnergy,
          "hunger": newHunger,
        }
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
  path: '/api/pets/educate',
  handler: async (request, h) => {
    try {
      const petReq = request.payload as PetId;
      const petId = petReq.petId;

      const petData = await prisma.pet.findUnique({
          where: {
            id: petId,
          }
      });
      
      if (petData == undefined) {
        return { 
          status: 'error',
          message: 'Could not find a pet with id ' + petId
        }; 
      }

      updatePetStatus(petData);

      const newKnowledge = Math.min(100, petData.knowledge + 15);
      let newLevel = petData.level;
      let levelUp = false;
      if (newKnowledge > 95) {
        if (newLevel < 10) {
          newLevel++;
          levelUp = true;
        }
      
      }
      const newHappiness = Math.max(petData.happiness - 5, 0);
      const newEnergy = Math.max(petData.energy - 10, 0);
      const newLastEducate = new Date();

      const petDataEdu = await prisma.pet.update({
        where: {
          id: petId,
        },
        data: {
          knowledge: newKnowledge,
          level: newLevel,
          happiness: newHappiness,
          energy: newEnergy,
          lastEducate: newLastEducate
        }
    });

      return { 
        status: 'OK',
        message: levelUp ? 'Питомец повысил уровень!' : 'Питомец поупражнялся',
        "pet": {
          "level": newLevel,
          "knowledge": newKnowledge,
        }
      };

    } catch(e) {
      return { 
        status: 'error',
        message: e?.toString()
      };
    }
  }
});

init(); 

/**
 * Обновляет статус питомца на основе прошедшего времени
 * @param {Object} pet - Объект питомца из базы данных
 * @returns {Object} - Обновленный объект питомца
 */
function updatePetStatus(pet: { id: string; name: string; level: number; hunger: number; happiness: number; energy: number; health: number; knowledge: number; feedBonus: number; happyBonus: number; lastFeed: Date | null; lastPlay: Date | null; lastSleep: Date | null; lastEducate: Date | null; accessories: string | null; ownerId: string; createdAt: Date; updatedAt: Date; }) {
  const now = new Date();
  const petCopy = { ...pet };
  
  // Обновление голода
  if (pet.lastFeed) {
    const hoursSinceLastFeed = (now.getTime() - new Date(pet.lastFeed).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastFeed >= 1) {
      const hungerDecrease = Math.floor(hoursSinceLastFeed * 5);
      petCopy.hunger = Math.max(0, pet.hunger - hungerDecrease);
    }
  }
  
  // Обновление счастья
  if (pet.lastPlay) {
    const hoursSinceLastPlay = (now.getTime() - new Date(pet.lastPlay).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastPlay >= 1) {
      const happinessDecrease = Math.floor(hoursSinceLastPlay * 3);
      petCopy.happiness = Math.max(0, pet.happiness - happinessDecrease);
    }
  }
  
  // Обновление энергии
  if (pet.lastSleep) {
    const hoursSinceLastSleep = (now.getTime() - new Date(pet.lastSleep).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastSleep >= 1) {
      const energyDecrease = Math.floor(hoursSinceLastSleep * 2);
      petCopy.energy = Math.max(0, pet.energy - energyDecrease);
    }
  }
  
  // Обновление знаний
  if (pet.lastEducate) {
    const hoursSinceLastEducate = (now.getTime() - new Date(pet.lastEducate).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastEducate >= 1) {
      const knowledgeDecrease = Math.floor(hoursSinceLastEducate * 1);
      petCopy.knowledge = Math.max(0, pet.knowledge - knowledgeDecrease);
    }
  }
  
  // Обновление здоровья на основе других показателей
  const averageStats = (petCopy.hunger + petCopy.happiness + petCopy.energy) / 3;
  petCopy.health = Math.min(100, averageStats);
  
  return petCopy;
}

/**
 * Получение текущего состояния питомца (настроение)
 * @param {Object} pet - Объект питомца
 * @returns {string} - Состояние питомца (happy, normal, sad)
 */
function getPetMood(pet: { id: string; name: string; level: number; hunger: number; happiness: number; energy: number; health: number; knowledge: number; feedBonus: number; happyBonus: number; lastFeed: Date | null; lastPlay: Date | null; lastSleep: Date | null; lastEducate: Date | null; accessories: string | null; ownerId: string; createdAt: Date; updatedAt: Date; }) {
  const average = (pet.hunger + pet.happiness + pet.energy + pet.health) / 4;
  
  if (average > 70) return 'happy';
  if (average > 40) return 'normal';
  return 'sad';
}

/**
 * Генерирует сообщение о том, что нужно питомцу
 * @param {Object} pet - Объект питомца
 * @returns {string|null} - Сообщение или null, если всё в порядке
 */
function getPetNeedsMessage(pet: { id: string; name: string; level: number; hunger: number; happiness: number; energy: number; health: number; knowledge: number; feedBonus: number; happyBonus: number; lastFeed: Date | null; lastPlay: Date | null; lastSleep: Date | null; lastEducate: Date | null; accessories: string | null; ownerId: string; createdAt: Date; updatedAt: Date; }) {
  if (pet.hunger < 20) {
    return 'Питомец голоден! Покормите его.';
  }
  
  if (pet.happiness < 20) {
    return 'Питомец грустит! Поиграйте с ним.';
  }
  
  if (pet.energy < 20) {
    return 'Питомец устал! Пусть отдохнет.';
  }
  
  if (pet.health < 30) {
    return 'Питомец плохо себя чувствует! Позаботьтесь о нем.';
  }
  
  return null;
}
