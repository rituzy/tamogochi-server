import {Server} from '@hapi/hapi';
import { bot } from '../bot.js';
import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { UserData } from '../types.js';

const CHAT_ID = process.env.CHAT_ID || 123;

export function registerUserRoutes(server: Server) {

    server.route({
        method: 'POST',
        path: '/login',
        handler: async (request, h) => {
            try {
                const user = request.payload as UserData;
                console.log("user: ");
                console.log(user);

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

                return h.response(
                    {
                        status: 'OK',
                        message: JSON.stringify(userData)
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200);
            } catch (e) {
                console.log("Error login: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during login: " + e);
                return {
                    status: 'error',
                    message: e?.toString()
                };
            }
        }
    });
}