import { Server } from '@hapi/hapi';
import { prisma } from '../lib/prisma.js';
import { PetId} from '../types.js';
import { updatePetStatus, feed, play, sleep, educate, levelUp } from '../lib/petStatus.js'
import { strRepr } from '../lib/utils.js'
import { bot } from '../bot.js';
import 'dotenv/config';

const CHAT_ID = process.env.CHAT_ID || 123;

export function registerPetRoutes(server: Server) {
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
                return h.response(
                    {
                        status: 'OK',
                        message: petData
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200);
            } catch (e) {
                console.error("Error getting pets: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during getting pets from back: " + e);

                return h.response(
                    {
                        status: 'error',
                        message: e?.toString()
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(500);
            }
        }
    });

    server.route(commonPetRequest('/api/pets/state', (d) => d));

    server.route(commonPetRequest('/api/pets/feed', (d) => feed(d, prisma)));

    server.route(commonPetRequest('/api/pets/play', (d) => play(d, prisma)));

    server.route(commonPetRequest('/api/pets/sleep', (d) => sleep(d, prisma)));

    server.route(commonPetRequest('/api/pets/educate', (d) => educate(d, prisma)));
}

const updatePetDb = async (newPetData) => {
    const petDataUpdated = await prisma.pet.update({
        where: {
            id: newPetData.id,
        },
        data: {
            name: newPetData.name,
            level: newPetData.level,
            hunger: newPetData.hunger,
            happiness: newPetData.happiness,
            energy: newPetData.Energy,
            health: newPetData.health,
            knowledge: newPetData.knowledge,
            feedBonus: newPetData.feedBonus,
            happyBonus: newPetData.happyBonus,
            lastFeed: newPetData.LastFeed,
            lastPlay: newPetData.lastPlay,
            lastSleep: newPetData.lastSleep,
            lastEducate: newPetData.lastEducate,
            accessories: newPetData.accessories,
            owner: newPetData.owner,
            ownerId: newPetData.ownerId,
            createdAt: newPetData.createdAt,
            updatedAt: newPetData.updatedAt
        }
    });
}

const commonPetRequest = function (path, updater) {
    return {
        method: 'POST',
        path: path,
        handler: async (request, h) => {
            try {
                console.log("request: ");
                strRepr(request);
                const petReq = request.payload as PetId;
                console.log("petReq: ");
                strRepr(petReq);
                const petId = petReq.petId;
                console.log("petId: ");
                strRepr(petId);

                const petData = await prisma.pet.findUnique({
                    where: {
                        id: petId,
                    }
                });

                if (petData == undefined) {
                    return h.response(
                        {
                            status: 'error',
                            message: 'Could not find a pet with id ' + petId
                        })
                        .type('application/json')
                        .header('content-type', 'application/json')
                        .code(404);
                }

                const petUpdated = await updatePetStatus(petData, updater);
                const levelDetails = levelUp(petUpdated);
                petUpdated.level = levelDetails.newLevel;

                updatePetDb(petUpdated);

                return h.response(
                    {
                        status: 'OK',
                        message: levelDetails.levelUp ? 'Питомец повысил уровень!' : 'Питомец доволен',
                        "pet": petUpdated
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200);
            } catch (e) {
                console.error("Error processing the pet: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during get the pet from back: " + e);
                return h.response(
                    {
                        status: 'error',
                        message: e?.toString()
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(500);
            }
        }
    }
}
