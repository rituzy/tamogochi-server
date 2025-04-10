import { Server } from '@hapi/hapi';
import { bot } from '../bot.js';
import 'dotenv/config';

const CHAT_ID = process.env.CHAT_ID || 123;

export function registerRoutes(server: Server) {
    server.route({
        method: 'POST',
        path: '/auth/login',
        handler: async (request, h) => {
            try {
                const data = request.payload;
                console.log("Received login request: ", data);

                return h.response({ "message": "Login successful" }).code(200);
            } catch (e) {
                console.log("Error getting pets: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during getting pets from back: " + e);

                return h.response(
                    {
                        status: 'error',
                        message: e?.toString()
                    })
                    .type('application/json')
                    .header('content-type', 'application/json');

            }
        }
    });

}