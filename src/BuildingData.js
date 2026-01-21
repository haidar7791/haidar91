// src/BuildingData.js - النسخة النهائية
import { RESOURCE_TYPES } from "./ResourceConstants";
export const TOWN_HALL_ID = "Town_Hall";

// ✅ تعريف الموارد الأساسية في اللعبة
export const RESOURCES = {
  Cobalt: { name: "Cobalt", name_ar: "كوبالت", icon: "diamond-stone", color: "#007FFF" },
  Elixir: { name: "Elixir", name_ar: "إكسير", icon: "test-tube-empty", color: "#FF1493" },
  Crystal: { name: "Crystal", name_ar: "كريستال", icon: "cube-outline", color: "#A9A9A9" },
};

// ✅ دالة لإنشاء تكاليف متدرجة
const makeLevels = (baseCost, costMultiplier, buildTimeBase, timeMultiplier, levels = 8) => {
  const result = {};
  for (let i = 1; i <= levels; i++) {
    result[i] = {
      cost: Math.round(baseCost * Math.pow(costMultiplier, i - 1)),
      buildTime: Math.round(buildTimeBase * Math.pow(timeMultiplier, i - 1))
    };
  }
  return result;
};

export const BUILDINGS = {
  // -------------------------------------------------------------------
  // 1. Town Hall (القلعة) - 8 مستويات
  // -------------------------------------------------------------------
  [TOWN_HALL_ID]: {
    name: "Castle",
    name_ar: "القلعة",
    maxCount: 1,
    size: 4,
    canBePlaced: false,
    image: require("../assets/images/Town_Hall.png"),
    maxLevel: 8,
    levels: {
      1: {
        cost: { Cobalt: 0 },
        buildTime: 0,
        image: require("../assets/images/Town_Hall.png"),
        production: {},
        storage: { Cobalt: 500, Elixir: 500, Crystal: 50 },
        unlocks: ["Cobalt_Mine", "Elixir_Collector", "Cobalt_Warehouse", "Elixir_Storehouse"],
        maxBuildersUnlocked: 1,
      },
      2: {
        cost: { Cobalt: 150 },
        buildTime: 60,
        image: require("../assets/images/Town_Hall_2.png"),
        production: {},
        storage: { Cobalt: 1000, Elixir: 1000, Crystal: 100 },
        unlocks: ["Barracks", "Cannon"],
        maxBuildersUnlocked: 1,
      },
      3: {
        cost: { Cobalt: 400 },
        buildTime: 120,
        image: require("../assets/images/Town_Hall_3.png"),
        production: {},
        storage: { Cobalt: 2000, Elixir: 2000, Crystal: 200 },
        unlocks: ["Laser_Tower", "Forces_Camp"],
        maxBuildersUnlocked: 2,
      },
      4: {
        cost: { Cobalt: 900 },
        buildTime: 240,
        image: require("../assets/images/Town_Hall_4.png"),
        production: {},
        storage: { Cobalt: 4000, Elixir: 4000, Crystal: 400 },
        unlocks: ["Crystal_Mine"],
        maxBuildersUnlocked: 2,
      },
      5: {
        cost: { Cobalt: 2000 },
        buildTime: 480,
        image: require("../assets/images/Town_Hall_5.png"),
        production: {},
        storage: { Cobalt: 8000, Elixir: 8000, Crystal: 800 },
        unlocks: ["Forces_Camp"],
        maxBuildersUnlocked: 3,
      },
      6: {
        cost: { Cobalt: 4000 },
        buildTime: 900,
        image: require("../assets/images/Town_Hall_6.png"),
        production: {},
        storage: { Cobalt: 16000, Elixir: 16000, Crystal: 1200 },
        unlocks: [],
        maxBuildersUnlocked: 3,
      },
      7: {
        cost: { Cobalt: 8000 },
        buildTime: 1800,
        image: require("../assets/images/Town_Hall_7.png"),
        production: {},
        storage: { Cobalt: 32000, Elixir: 32000, Crystal: 1600 },
        unlocks: [],
        maxBuildersUnlocked: 4,
      },
      8: {
        cost: { Cobalt: 16000 },
        buildTime: 3600,
        image: require("../assets/images/Town_Hall_8.png"),
        production: {},
        storage: { Cobalt: 64000, Elixir: 64000, Crystal: 2000 },
        unlocks: [],
        maxBuildersUnlocked: 4,
      },
    },
  },

  // -------------------------------------------------------------------
  // 2. Cobalt Mine (منجم الكوبالت) - 8 مستويات
  // -------------------------------------------------------------------
  Cobalt_Mine: {
    name: "Cobalt Mine",
    name_ar: "منجم الكوبالت",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Cobalt_Mine.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Cobalt: 50 }, buildTime: 10, image: require("../assets/images/Cobalt_Mine.png"), production: { Cobalt: 2 }, storage: {} },
      2: { cost: { Cobalt: 100 }, buildTime: 15, image: require("../assets/images/Cobalt_Mine_2.png"), production: { Cobalt: 5 }, requiresTownHall: 2 },
      3: { cost: { Cobalt: 220 }, buildTime: 20, image: require("../assets/images/Cobalt_Mine_3.png"), production: { Cobalt: 12 }, requiresTownHall: 3 },
      4: { cost: { Cobalt: 480 }, buildTime: 30, image: require("../assets/images/Cobalt_Mine_4.png"), production: { Cobalt: 25 }, requiresTownHall: 4 },
      5: { cost: { Cobalt: 1000 }, buildTime: 60, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 60 }, requiresTownHall: 5 },
      6: { cost: { Cobalt: 2200 }, buildTime: 120, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 140 }, requiresTownHall: 6 },
      7: { cost: { Cobalt: 4800 }, buildTime: 240, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 320 }, requiresTownHall: 7 },
      8: { cost: { Cobalt: 10000 }, buildTime: 480, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 700 }, requiresTownHall: 8 },
    },
  },

  // -------------------------------------------------------------------
  // 3. Elixir Collector (مجمع الإكسير) - 8 مستويات
  // -------------------------------------------------------------------
  Elixir_Collector: {
    name: "Elixir Collector",
    name_ar: "مجمع الإكسير",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Elixir_Collector.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Elixir: 50 }, buildTime: 10, image: require("../assets/images/Elixir_Collector.png"), production: { Elixir: 2 } },
      2: { cost: { Elixir: 120 }, buildTime: 15, image: require("../assets/images/Elixir_Collector_2.png"), production: { Elixir: 6 }, requiresTownHall: 2 },
      3: { cost: { Elixir: 300 }, buildTime: 20, image: require("../assets/images/Elixir_Collector_3.png"), production: { Elixir: 14 }, requiresTownHall: 3 },
      4: { cost: { Elixir: 680 }, buildTime: 30, image: require("../assets/images/Elixir_Collector_4.png"), production: { Elixir: 32 }, requiresTownHall: 4 },
      5: { cost: { Elixir: 1500 }, buildTime: 60, image: require("../assets/images/Elixir_Collector_5.png"), production: { Elixir: 80 }, requiresTownHall: 5 },
      6: { cost: { Elixir: 3300 }, buildTime: 120, image: require("../assets/images/Elixir_Collector_6.png"), production: { Elixir: 180 }, requiresTownHall: 6 },
      7: { cost: { Elixir: 7200 }, buildTime: 240, image: require("../assets/images/Elixir_Collector_7.png"), production: { Elixir: 420 }, requiresTownHall: 7 },
      8: { cost: { Elixir: 16000 }, buildTime: 480, image: require("../assets/images/Elixir_Collector_8.png"), production: { Elixir: 1000 }, requiresTownHall: 8 },
    },
  },

  // -------------------------------------------------------------------
  // 4. Crystal Mine (منجم الكريستال) - 3 مستويات فقط  ✅
  // -------------------------------------------------------------------
  Crystal_Mine: {
    name: "Crystal Mine",
    name_ar: "منجم الكريستال",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Crystal_Mine_1.png"),
    maxLevel: 3,
    levels: {
      1: {
        cost: { Crystal: 100 },
        buildTime: 30,
        image: require("../assets/images/Crystal_Mine_1.png"),
        production: { Crystal: 1 },
        requiresTownHall: 4
      },
      2: {
        cost: { Crystal: 300 },
        buildTime: 120,
        image: require("../assets/images/Crystal_Mine_1.png"),
        production: { Crystal: 3 },
        requiresTownHall: 6
      },
      3: {
        cost: { Crystal: 800 },
        buildTime: 360,
        image: require("../assets/images/Crystal_Mine_1.png"),
        production: { Crystal: 8 },
        requiresTownHall: 8
      },
    },
  },

  // -------------------------------------------------------------------
  // 5. Cobalt Warehouse (مخزن الكوبالت) - 8 مستويات
  // -------------------------------------------------------------------
  Cobalt_Warehouse: {
    name: "Cobalt Warehouse",
    name_ar: "مخزن الكوبالت",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Cobalt_warehouse.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Cobalt: 100 }, buildTime: 20, image: require("../assets/images/Cobalt_warehouse.png"), storage: { Cobalt: 2000 }, requiresTownHall: 1 },
      2: { cost: { Cobalt: 300 }, buildTime: 40, image: require("../assets/images/Cobalt_warehouse_2.png"), storage: { Cobalt: 5000 }, requiresTownHall: 2 },
      3: { cost: { Cobalt: 800 }, buildTime: 80, image: require("../assets/images/Cobalt_warehouse_3.png"), storage: { Cobalt: 12000 }, requiresTownHall: 3 },
      4: { cost: { Cobalt: 2000 }, buildTime: 160, image: require("../assets/images/Cobalt_warehouse_4.png"), storage: { Cobalt: 30000 }, requiresTownHall: 4 },
      5: { cost: { Cobalt: 4800 }, buildTime: 320, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 80000 }, requiresTownHall: 5 },
      6: { cost: { Cobalt: 10000 }, buildTime: 640, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 160000 }, requiresTownHall: 6 },
      7: { cost: { Cobalt: 22000 }, buildTime: 1200, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 320000 }, requiresTownHall: 7 },
      8: { cost: { Cobalt: 48000 }, buildTime: 2400, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 640000 }, requiresTownHall: 8 },
    },
    requiresTownHall: 1,
  },

  // -------------------------------------------------------------------
  // 6. Elixir Storehouse (مخزن الإكسير) - 8 مستويات
  // -------------------------------------------------------------------
  Elixir_Storehouse: {
    name: "Elixir Storehouse",
    name_ar: "مخزن الإكسير",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Elixir_storehouse.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Elixir: 100 }, buildTime: 20, image: require("../assets/images/Elixir_storehouse.png"), storage: { Elixir: 2000 }, requiresTownHall: 1 },
      2: { cost: { Elixir: 300 }, buildTime: 40, image: require("../assets/images/Elixir_storehouse_2.png"), storage: { Elixir: 5000 }, requiresTownHall: 2 },
      3: { cost: { Elixir: 800 }, buildTime: 80, image: require("../assets/images/Elixir_storehouse_3.png"), storage: { Elixir: 12000 }, requiresTownHall: 3 },
      4: { cost: { Elixir: 2000 }, buildTime: 160, image: require("../assets/images/Elixir_storehouse_4.png"), storage: { Elixir: 30000 }, requiresTownHall: 4 },
      5: { cost: { Elixir: 4800 }, buildTime: 320, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 80000 }, requiresTownHall: 5 },
      6: { cost: { Elixir: 10000 }, buildTime: 640, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 160000 }, requiresTownHall: 6 },
      7: { cost: { Elixir: 22000 }, buildTime: 1200, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 320000 }, requiresTownHall: 7 },
      8: { cost: { Elixir: 48000 }, buildTime: 2400, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 640000 }, requiresTownHall: 8 },
    },
    requiresTownHall: 1,
  },

  // -------------------------------------------------------------------
  // 7. Cannon (مدفع) - 8 مستويات
  // -------------------------------------------------------------------
  Cannon: {
    name: "Cannon",
    name_ar: "مدفع",
    maxCount: 3,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/cannon.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Cobalt: 80 }, buildTime: 20, image: require("../assets/images/cannon.png"), requiresTownHall: 2 },
      2: { cost: { Cobalt: 200 }, buildTime: 40, image: require("../assets/images/cannon_2.png"), requiresTownHall: 2 },
      3: { cost: { Cobalt: 500 }, buildTime: 80, image: require("../assets/images/cannon_3.png"), requiresTownHall: 3 },
      4: { cost: { Cobalt: 1200 }, buildTime: 160, image: require("../assets/images/cannon_3.png"), requiresTownHall: 4 },
      5: { cost: { Cobalt: 3000 }, buildTime: 320, image: require("../assets/images/cannon_3.png"), requiresTownHall: 5 },
      6: { cost: { Cobalt: 7000 }, buildTime: 640, image: require("../assets/images/cannon_3.png"), requiresTownHall: 6 },
      7: { cost: { Cobalt: 16000 }, buildTime: 1200, image: require("../assets/images/cannon_3.png"), requiresTownHall: 7 },
      8: { cost: { Cobalt: 36000 }, buildTime: 2400, image: require("../assets/images/cannon_3.png"), requiresTownHall: 8 },
    },
    requiresTownHall: 2,
  },

  // -------------------------------------------------------------------
  // 8. Laser Tower (برج الليزر) - 8 مستويات
  // -------------------------------------------------------------------
  Laser_Tower: {
    name: "Laser Tower",
    name_ar: "برج الليزر",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Laser_Tower.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Elixir: 80 }, buildTime: 35, image: require("../assets/images/Laser_Tower.png"), requiresTownHall: 3 },
      2: { cost: { Elixir: 200 }, buildTime: 70, image: require("../assets/images/Laser_Tower_2.png"), requiresTownHall: 3 },
      3: { cost: { Elixir: 500 }, buildTime: 120, image: require("../assets/images/Laser_Tower_3.png"), requiresTownHall: 4 },
      4: { cost: { Elixir: 1200 }, buildTime: 240, image: require("../assets/images/Laser_Tower_3.png"), requiresTownHall: 5 },
      5: { cost: { Elixir: 3000 }, buildTime: 480, image: require("../assets/images/Laser_Tower_3.png"), requiresTownHall: 6 },
      6: { cost: { Elixir: 7000 }, buildTime: 960, image: require("../assets/images/Laser_Tower_3.png"), requiresTownHall: 7 },
      7: { cost: { Elixir: 16000 }, buildTime: 1920, image: require("../assets/images/Laser_Tower_3.png"), requiresTownHall: 8 },
      8: { cost: { Elixir: 36000 }, buildTime: 3840, image: require("../assets/images/Laser_Tower_3.png"), requiresTownHall: 8 },
    },
    requiresTownHall: 3,
  },

  // -------------------------------------------------------------------
  // 9. Builder_Hut (كوخ البناء) - 4 مستويات فقط ✅
  // -------------------------------------------------------------------
  Builder_Hut: {
    name: "Builder_Hut",
    name_ar: "كوخ البناء",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Builder_Hut.png"),
    maxLevel: 4,
    levels: {
      1: {
        cost: { Crystal: 0 },
        buildTime: 0,
        image: require("../assets/images/Builder_Hut.png"),
        addsBuilder: 1
      },
      2: {
        cost: { Crystal: 50 },
        buildTime: 30,
        image: require("../assets/images/Builder_Hut.png"),
        addsBuilder: 1
      },
      3: {
        cost: { Crystal: 120 },
        buildTime: 60,
        image: require("../assets/images/Builder_Hut.png"),
        addsBuilder: 1
      },
      4: {
        cost: { Crystal: 300 },
        buildTime: 120,
        image: require("../assets/images/Builder_Hut.png"),
        addsBuilder: 1
      },
    },
  },

  // -------------------------------------------------------------------
  // 10. Forces Camp (معسكر القوات) - 8 مستويات
  // -------------------------------------------------------------------
  Forces_Camp: {
    name: "Forces Camp",
    name_ar: "معسكر القوات",
    maxCount: 1,
    size: 6,
    canBePlaced: true,
    image: require("../assets/images/Forces_camp.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Cobalt: 200 }, buildTime: 60, image: require("../assets/images/Forces_camp.png"), troopCapacity: 10, requiresTownHall: 3 },
      2: { cost: { Cobalt: 800 }, buildTime: 180, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 25, requiresTownHall: 4 },
      3: { cost: { Cobalt: 2500 }, buildTime: 360, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 50, requiresTownHall: 5 },
      4: { cost: { Cobalt: 6000 }, buildTime: 720, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 100, requiresTownHall: 6 },
      5: { cost: { Cobalt: 15000 }, buildTime: 1440, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 200, requiresTownHall: 7 },
      6: { cost: { Cobalt: 35000 }, buildTime: 2880, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 400, requiresTownHall: 8 },
      7: { cost: { Cobalt: 80000 }, buildTime: 5760, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 800, requiresTownHall: 8 },
      8: { cost: { Cobalt: 180000 }, buildTime: 11520, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 1500, requiresTownHall: 8 },
    },
    requiresTownHall: 3,
  },

  // -------------------------------------------------------------------
  // 11. Barracks (الثكنة) - 8 مستويات
  // -------------------------------------------------------------------
  Barracks: {
    name: "Barracks",
    name_ar: "الثكنة",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/barracks.png"),
    maxLevel: 8,
    levels: {
      1: { cost: { Cobalt: 300 }, buildTime: 60, image: require("../assets/images/barracks.png"), unlocksTroops: ["MeleeSoldier"], requiresTownHall: 2 },
      2: { cost: { Cobalt: 900 }, buildTime: 180, image: require("../assets/images/barracks_2.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper"], requiresTownHall: 3 },
      3: { cost: { Cobalt: 2500 }, buildTime: 480, image: require("../assets/images/barracks_3.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank"], requiresTownHall: 4 },
      4: { cost: { Cobalt: 6000 }, buildTime: 960, image: require("../assets/images/barracks_3.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank", "AirDrone"], requiresTownHall: 5 },
      5: { cost: { Cobalt: 15000 }, buildTime: 1920, image: require("../assets/images/barracks_3.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank", "AirDrone", "HeavyMech"], requiresTownHall: 6 },
      6: { cost: { Cobalt: 35000 }, buildTime: 3840, image: require("../assets/images/barracks_3.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank", "AirDrone", "HeavyMech", "StealthAssassin"], requiresTownHall: 7 },
      7: { cost: { Cobalt: 80000 }, buildTime: 7680, image: require("../assets/images/barracks_3.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank", "AirDrone", "HeavyMech", "StealthAssassin", "SiegeGolem"], requiresTownHall: 8 },
      8: { cost: { Cobalt: 180000 }, buildTime: 15360, image: require("../assets/images/barracks_3.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank", "AirDrone", "HeavyMech", "StealthAssassin", "SiegeGolem", "DragonRider"], requiresTownHall: 8 },
    },
    requiresTownHall: 2,
  },
};

// ✅ دالة مساعدة: التحقق من مستوى القلعة المطلوب
export const getRequiredTownHallLevel = (buildingType, level) => {
  const building = BUILDINGS[buildingType];
  if (!building || !building.levels[level]) return 1;

  // إذا كان المبنى يتطلب مستوى محدد صراحة (مثل منجم الكريستال)
  if (building.levels[level].requiresTownHall) {
    return building.levels[level].requiresTownHall;
  }

  // ✅ استثناء كوخ البناء من متطلبات القلعة
  if (buildingType === "Builder_Hut") {
    return 1;
  }

  // قاعدة عامة: لا يمكن ترقية أي مبنى لمستوى أعلى من مستوى القلعة
  return level;
};

// ✅ دالة مساعدة: الحصول على مستوى القلعة الحالي مباشرة من قائمة المباني
export const getActualTownHallLevel = (buildings) => {
  const townHall = buildings.find(b => b.type === TOWN_HALL_ID);
  return townHall ? townHall.level : 1;
};

// ✅ دالة مساعدة: التحقق إذا كان يمكن ترقية المبنى بناءً على مستوى القلعة الفعلي
export const canUpgradeBuilding = (buildingType, nextLevel, buildings) => {
  const townHallLevel = getActualTownHallLevel(buildings);

  // ✅ استثناء مبنى القلعة وكوخ البناء من شرط مستوى القلعة للترقية
  if (buildingType === TOWN_HALL_ID || buildingType === "Builder_Hut") {
    return true;
  }
  return nextLevel <= townHallLevel;
};

// ✅ دالة مساعدة للحصول على حجم المبنى
export const getBuildingSize = (buildingType) => {
  const building = BUILDINGS[buildingType];
  return building ? building.size : 1;
};

// ✅ دالة مساعدة للحصول على تكلفة المبنى
export const getBuildingCost = (buildingType, level = 1) => {
  const building = BUILDINGS[buildingType];
  if (!building || !building.levels[level]) return null;
  return building.levels[level].cost;
};

// ✅ دالة مساعدة للحصول على وقت بناء المبنى
export const getBuildingTime = (buildingType, level = 1) => {
  const building = BUILDINGS[buildingType];
  if (!building || !building.levels[level]) return 30;
  return building.levels[level].buildTime;
};

// ✅ دالة مساعدة للحصول على أقصى مستوى للمبنى
export const getBuildingMaxLevel = (buildingType) => {
  const building = BUILDINGS[buildingType];
  return building ? building.maxLevel : 1;
};

// ✅ دالة مساعدة: الحصول على مباني متاحة بناءً على مستوى القلعة
export const getAvailableBuildings = (townHallLevel) => {
  const available = [];

  for (const [key, building] of Object.entries(BUILDINGS)) {
    if (building.canBePlaced) {
      // تحقق إذا كان المبنى مفتوحاً في هذا المستوى
      let isUnlocked = false;

      for (let level = 1; level <= townHallLevel; level++) {
        const townHall = BUILDINGS[TOWN_HALL_ID].levels[level];
        if (townHall && townHall.unlocks && townHall.unlocks.includes(key)) {
          isUnlocked = true;
          break;
        }
      }

      if (isUnlocked) {
        available.push(key);
      }
    }
  }

  return available;
};

// ✅ دالة مساعدة: التحقق إذا كان يمكن إضافة مبنى جديد
export const canAddBuilding = (buildingKey, existingBuildings) => {
  const building = BUILDINGS[buildingKey];
  if (!building) return false;

  // استثناء مبنى القاعدة - يمكن ترقيته فقط
  if (buildingKey === TOWN_HALL_ID) {
    return false;
  }

  // استثناء كوخ البناء - يظهر في البداية فقط
  if (buildingKey === "Builder_Hut") {
    const currentCount = existingBuildings.filter(b => b.type === buildingKey).length;
    return currentCount < 1; // يمكن أن يكون هناك واحد فقط
  }

  // إذا كان للمبنى حد أقصى محدد (maxCount)
  if (building.maxCount !== undefined) {
    const buildingCount = existingBuildings.filter(b => b.type === buildingKey).length;
    return buildingCount < building.maxCount;
  }

  // إذا لم يكن هناك maxCount محدد، نعود بـ true (يمكن إضافة واحد على الأقل)
  return true;
};

// ✅ المباني المتاحة للشراء في المتجر
export const SHOP_ITEMS = Object.keys(BUILDINGS)
  .filter(key => BUILDINGS[key].canBePlaced && key !== TOWN_HALL_ID && key !== "Builder_Hut");

export default BUILDINGS;
