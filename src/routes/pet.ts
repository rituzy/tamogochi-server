import { Server } from '@hapi/hapi';
import { prisma } from '../lib/prisma.js';
import { PetId } from '../types.js';
import { updatePetStatus } from '../lib/petStatus.js'
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
                console.log("Error getting pets: ", e);
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
                    return h.response(
                        {
                            status: 'error',
                            message: 'Could not find a pet with id ' + petId
                        })
                        .type('application/json')
                        .header('content-type', 'application/json')
                        .code(404);
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
                return h.response(
                    {
                        status: 'OK',
                        message: 'Питомец покормлен',
                        "pet": {
                            "id": petId,
                            "hunger": newHunger,
                            "energy": newEnergy,
                        }
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200);

            } catch (e) {
                console.log("Error feeding the pet: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during feeding the pet from back: " + e);
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
                    return h.response(
                        {
                            status: 'error',
                            message: 'Could not find a pet with id ' + petId
                        })
                        .type('application/json')
                        .header('content-type', 'application/json')
                        .code(404);
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

                return h.response(
                    {
                        status: 'OK',
                        message: 'Вы поиграли с питомцем',
                        "pet": {
                            "happiness": newHappiness,
                            "knowledge": newKnowledge,
                        }
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200);
            } catch (e) {
                console.log("Error playing the pet: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during playing the pet from back: " + e);
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
                    return h.response(
                        {
                            status: 'error',
                            message: 'Could not find a pet with id ' + petId
                        })
                        .type('application/json')
                        .header('content-type', 'application/json')
                        .code(404);
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

                return h.response(
                    {
                        status: 'OK',
                        message: 'Питомец поспал',
                        "pet": {
                            "energy": newEnergy,
                            "hunger": newHunger,
                        }
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200);
            } catch (e) {
                console.log("Error sleeping the pet: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during sleeping the pet from back: " + e);
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
                    return h.response(
                        {
                            status: 'error',
                            message: 'Could not find a pet with id ' + petId
                        })
                        .type('application/json')
                        .header('content-type', 'application/json')
                        .code(404);
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

                return h.response(
                    {
                        status: 'OK',
                        message: levelUp ? 'Питомец повысил уровень!' : 'Питомец поупражнялся',
                        "pet": {
                            "level": newLevel,
                            "knowledge": newKnowledge,
                        }
                    })
                    .type('application/json')
                    .header('content-type', 'application/json')
                    .code(200);

            } catch (e) {
                console.log("Error educating the pet: ", e);
                bot.sendMessage(CHAT_ID, "Error occured during educating the pet from back: " + e);
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

}