/**
 * Обновляет статус питомца на основе прошедшего времени
 * @param {Object} pet - Объект питомца из базы данных
 * @returns {Object} - Обновленный объект питомца
 */
function updatePetStatus(pet) {
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
    
    return petCopy;
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
  function getPetNeedsMessage(pet) {
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
  function getNextEvolutionName(currentLevel) {
    switch (currentLevel) {
      case 1: return 'Малыш';
      case 2: return 'Подросток';
      case 3: return 'Взрослый';
      case 4: return 'Мудрец';
      default: return 'Суперформа';
    }
  }
 
