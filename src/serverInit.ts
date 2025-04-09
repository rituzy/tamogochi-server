import 'dotenv/config';
import Hapi from '@hapi/hapi';
import { bot } from './bot.js'
import { HookResponse } from './types.js'
import { registerUserRoutes } from './routes/user.js'
import { registerPetRoutes } from './routes/pet.js'

const WEB_HOOKURL = process.env.WEBHOOK_URL + "/webhook";
const CHAT_ID = process.env.CHAT_ID || 123;

async function ensureWebhook() {
    try {
        const response = await fetch("https://api.telegram.org/bot" + process.env.TELEGRAM_BOT_TOKEN + "/getWebhookInfo");
        const data = response as HookResponse;
        // const data = await response.json();
        console.log(data);
        if (data.url !== WEB_HOOKURL) {
            console.log("Webhook не установлен. Устанавливаю...");
            await bot.setWebHook(WEB_HOOKURL);
        } else {
            console.log("Webhook уже устанолвен по адресу: ", data.url);
        }
    } catch (error) {
        console.error("Ошибка при установке вебхука", error);
    }
}

await ensureWebhook();

export const createServer = async () => {

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
        handler: async (request, h) => {
            await bot.sendMessage(CHAT_ID, 'Сервер работает корректно ');
            return {
                status: 'ok',
                message: 'Сервер работает корректно '
            };
        }
    });

    server.route({
        method: 'POST',
        path: '/webhook',
        handler: async (request, h) => {
            const data = request.payload;
            console.log('Получено сообщение', data);
            await bot.processUpdate(data as any);
            return h.response({ success: true }).code(200);
        }
    });

    registerUserRoutes(server);

    registerPetRoutes(server);

    await server.initialize();

    return server;
}