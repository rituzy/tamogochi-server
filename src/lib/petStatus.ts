import {LevelDetails} from '../types.js'
/**
 * Обновляет статус питомца на основе прошедшего времени
 * @param {Object} pet - Объект питомца из базы данных
 * @returns {Object} - Обновленный объект питомца
 */
export async function updatePetStatus(pet, updater) {
    const now = new Date();
    const petCopy = { ...pet };
    
    // Обновление голода
    if (pet.lastFeed) {
      const hoursSinceLastFeed = (now - new Date(pet.lastFeed)) / (1000 * 60 * 60);
      if (hoursSinceLastFeed >= 1) {
        const hungerDecrease = Math.floor(hoursSinceLastFeed * 5);
        petCopy.hunger = Math.max(0, pet.hunger - hungerDecrease);
      }
    }
    
    // Обновление счастья
    if (pet.lastPlay) {
      const hoursSinceLastPlay = (now - new Date(pet.lastPlay)) / (1000 * 60 * 60);
      if (hoursSinceLastPlay >= 1) {
        const happinessDecrease = Math.floor(hoursSinceLastPlay * 3);
        petCopy.happiness = Math.max(0, pet.happiness - happinessDecrease);
      }
    }
    
    // Обновление энергии
    if (pet.lastSleep) {
      const hoursSinceLastSleep = (now - new Date(pet.lastSleep)) / (1000 * 60 * 60);
      if (hoursSinceLastSleep >= 1) {
        const energyDecrease = Math.floor(hoursSinceLastSleep * 2);
        petCopy.energy = Math.max(0, pet.energy - energyDecrease);
      }
    }
    
    // Обновление знаний
    if (pet.lastEducate) {
      const hoursSinceLastEducate = (now - new Date(pet.lastEducate)) / (1000 * 60 * 60);
      if (hoursSinceLastEducate >= 1) {
        const knowledgeDecrease = Math.floor(hoursSinceLastEducate * 1);
        petCopy.knowledge = Math.max(0, pet.knowledge - knowledgeDecrease);
      }
    }
    
    // Обновление здоровья на основе других показателей
    const averageStats = (petCopy.hunger + petCopy.happiness + petCopy.energy) / 3;
    petCopy.health = Math.min(100, averageStats);
    
    return updater(petCopy);
  }
  
  /**
   * Получение текущего состояния питомца (настроение)
   * @param {Object} pet - Объект питомца
   * @returns {string} - Состояние питомца (happy, normal, sad)
   */
  function getPetMood(pet) {
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
export  function getPetNeedsMessage(pet) {
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
  
  /**
   * Возвращает название следующей эволюции питомца
   * @param {number} currentLevel - Текущий уровень питомца
   * @returns {string} - Название следующей эволюции
   */
export function getNextEvolutionName(currentLevel) {
    switch (currentLevel) {
      case 1: return 'Малыш';
      case 2: return 'Подросток';
      case 3: return 'Взрослый';
      case 4: return 'Мудрец';
      default: return 'Суперформа';
    }
  }

  export async function feed(petData, prisma) {
        const newHunger = Math.min(100, petData.hunger + 20 + petData.feedBonus);
        const newEnergy = Math.min(100, petData.energy + 5);
        const newLastFeed = new Date();
        const petId = petData.id;
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

        return petDataFed;
  }

  export async function play(petData, prisma) {

    const newHappiness = Math.min(100, petData.happiness + 20 + petData.happyBonus);
    const newKnowledge = Math.min(petData.knowledge + 5);
    const newHunger = Math.max(petData.hunger - 10, 0);
    const newEnergy = Math.max(petData.energy - 20, 0);
    const newLastPlay = new Date();
    const petId = petData.id;
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

    return petDataPlay;
}

export async function sleep(petData, prisma) {
  const newHunger = Math.max(petData.hunger - 5, 0);
  const newEnergy = 100;
  const newLastSleep = new Date();
  const petId = petData.id;
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

  return petDataSleep;
}

export async function educate(petData, prisma) {
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
  const petId = petData.id;
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

  return petDataEdu;
}

export function levelUp(petData) {
  const newKnowledge = petData.knowledge;
  let newLevel = petData.level;
  let levelUp = false;
  if (petData.knowledge > 95) {
      if (newLevel < 10) {
          newLevel++;
          levelUp = true;
      }
  }
  const result = {newLevel, levelUp} as LevelDetails;
  return result;
}
 
