// src/store/gameState.js

// الموارد الابتدائية عند بدء اللعبة
export const initialResources = {
  cobalt: 1000,      // كمية الكوبالت الابتدائية
  mercury: 500,      // كمية الزئبق الابتدائية
  gold: 1000,        // كمية الذهب الابتدائية
  elixir: 300        // كمية الإكسير الابتدائية
};

// قائمة المباني التي يمتلكها اللاعب عند بدء اللعبة
export const initialBuildings = [
  {
    id: 1,
    type: "Town Hall_1",
    level: 1,
    x: 50,        // موقع المبنى على الخريطة
    y: 50,
    isUpgrading: false,
    upgradeEndTime: null
  },
  {
    id: 2,
    type: "Cobalt_1",
    level: 1,
    x: 150,
    y: 60,
    isUpgrading: false,
    upgradeEndTime: null
  },
  {
    id: 3,
    type: "Mercury elixir_1",
    level: 1,
    x: 100,
    y: 200,
    isUpgrading: false,
    upgradeEndTime: null
  },
  {
    id: 4,
    type: "barracks_1",
    level: 1,
    x: 200,
    y: 150,
    isUpgrading: false,
    upgradeEndTime: null
  }
  // يمكن إضافة المزيد من المباني حسب الخريطة والتصميم
];

// الحالة الابتدائية الكاملة للعبة
export const initialGameState = {
  resources: initialResources,
  buildings: initialBuildings,
  lastUpdateTime: Date.now() // لتتبع الوقت بين جلسات اللعب
};
