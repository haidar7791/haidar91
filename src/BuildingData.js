// src/BuildingData.js - التعديلات المطلوبة
import { RESOURCE_TYPES } from "./ResourceConstants";
export const TOWN_HALL_ID = "Town_Hall";

// ✅ تعريف الموارد الأساسية في اللعبة
export const RESOURCES = {
  Cobalt: { name: "Cobalt", name_ar: "كوبالت", icon: "diamond-stone", color: "#007FFF" },
  Elixir: { name: "Elixir", name_ar: "إكسير", icon: "test-tube-empty", color: "#FF1493" },
  Crystal: { name: "Crystal", name_ar: "كريستال", icon: "cube-outline", color: "#A9A9A9" },
};

export const BUILDINGS = {
  // -------------------------------------------------------------------
  // 1. Town Hall (القاعدة) - مفتاح فريد
  // -------------------------------------------------------------------
  [TOWN_HALL_ID]: {
    name: "Town Hall",
    name_ar: "مبنى القاعدة",
    maxCount: 1,
    size: 4, // ✅ موجود
    canBePlaced: false,
    image: require("../assets/images/Town_Hall.png"),
    levels: {
      1: {
        cost: { type: "Cobalt", amount: 0 },
        buildTime: 0,
        image: require("../assets/images/Town_Hall.png"),
        production: {},
        storage: { Cobalt: 500, Elixir: 500, Crystal: 50 },
        unlocks: ["Cobalt_Mine", "Elixir_Collector", "Builder_Hut"],
        maxBuildersUnlocked: 1,
      },
      // ... باقي المستويات
    },
  },

  // -------------------------------------------------------------------
  // 2. Resource Collectors
  // -------------------------------------------------------------------
  Cobalt_Mine: {
    name: "Cobalt Mine",
    name_ar: "منجم الكوبالت",
    maxCount: 1,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/Cobalt_Mine.png"),
    levels: {
      1: { 
        cost: { type: "Cobalt", amount: 50 }, 
        buildTime: 10, 
        image: require("../assets/images/Cobalt_Mine.png"), 
        production: { Cobalt: 2 }, 
        storage: {} 
      },
      // ... باقي المستويات
    },
  },

  Elixir_Collector: {
    name: "Elixir Collector",
    name_ar: "مجمع الإكسير",
    maxCount: 1,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/Elixir_Collector.png"),
    levels: {
      1: { 
        cost: { type: "Elixir", amount: 50 }, 
        buildTime: 10, 
        image: require("../assets/images/Elixir_Collector.png"), 
        production: { Elixir: 2 } 
      },
      // ... باقي المستويات
    },
  },

  // -------------------------------------------------------------------
  // 3. Storage
  // -------------------------------------------------------------------
  Cobalt_Warehouse: {
    name: "Cobalt Warehouse",
    name_ar: "مخزن الكوبالت",
    maxCount: 1,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/Cobalt_warehouse.png"),
    levels: {
      1: { 
        cost: { type: "Cobalt", amount: 100 }, 
        buildTime: 20, 
        image: require("../assets/images/Cobalt_warehouse.png"), 
        storage: { Cobalt: 2000 } 
      },
      // ... باقي المستويات
    },
  },

  Elixir_Storehouse: {
    name: "Elixir Storehouse",
    name_ar: "مخزن الإكسير",
    maxCount: 1,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/Elixir_storehouse.png"),
    levels: {
      1: { 
        cost: { type: "Elixir", amount: 100 }, 
        buildTime: 20, 
        image: require("../assets/images/Elixir_storehouse.png"), 
        storage: { Elixir: 2000 } 
      },
      // ... باقي المستويات
    },
  },

  // -------------------------------------------------------------------
  // 4. Defensive Buildings
  // -------------------------------------------------------------------
  Cannon: {
    name: "Cannon",
    name_ar: "مدفع",
    maxCount: 3,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/cannon.png"),
    levels: {
      1: { 
        cost: { type: "Cobalt", amount: 80 }, 
        buildTime: 20, 
        image: require("../assets/images/cannon.png") 
      },
      // ... باقي المستويات
    },
  },

  Laser_Tower: {
    name: "Laser Tower",
    name_ar: "برج الليزر",
    maxCount: 1,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/Laser_Tower.png"),
    levels: {
      1: { 
        cost: { type: "Elixir", amount: 80 }, 
        buildTime: 35, 
        image: require("../assets/images/Laser_Tower.png") 
      },
      // ... باقي المستويات
    },
  },

  // -------------------------------------------------------------------
  // 5. Builder Hut
  // -------------------------------------------------------------------
  Builder_Hut: {
    name: "Builder_Hut",
    name_ar: "كوخ البناء",
    maxCount: 1,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/Builder_Hut.png"),
    levels: {
      1: { 
        cost: { type: "Crystal", amount: 0 }, 
        buildTime: 0, 
        image: require("../assets/images/Builder_Hut.png"), 
        addsBuilder: 1 
      },
      // ... باقي المستويات
    },
    additionalCosts: [ 
      { type: "Crystal", amount: 50 }, 
      { type: "Crystal", amount: 100 }, 
      { type: "Crystal", amount: 200 }, 
      { type: "Crystal", amount: 500 } 
    ],
  },

  // -------------------------------------------------------------------
  // 6. Forces Camp
  // -------------------------------------------------------------------
  Forces_Camp: {
    name: "Forces Camp",
    name_ar: "معسكر القوات",
    maxCount: 1,
    size: 6, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/Forces_camp.png"),
    levels: {
      1: { 
        cost: { type: "Cobalt", amount: 200 }, 
        buildTime: 60, 
        image: require("../assets/images/Forces_camp.png"), 
        troopCapacity: 10 
      },
      2: { 
        cost: { type: "Cobalt", amount: 800 }, 
        buildTime: 180, 
        image: require("../assets/images/Forces_camp_2.png"), 
        troopCapacity: 25 
      },
    },
  },

  // -------------------------------------------------------------------
  // 7. Barracks
  // -------------------------------------------------------------------
  Barracks: {
    name: "Barracks",
    name_ar: "الثكنة",
    maxCount: 1,
    size: 3, // ✅ موجود
    canBePlaced: true,
    image: require("../assets/images/barracks.png"),
    levels: {
      1: { 
        cost: { type: "Cobalt", amount: 300 }, 
        buildTime: 60, 
        image: require("../assets/images/barracks.png"), 
        unlocksTroops: ["MeleeSoldier"] 
      },
      2: { 
        cost: { type: "Cobalt", amount: 900 }, 
        buildTime: 180, 
        image: require("../assets/images/barracks_2.png"), 
        unlocksTroops: ["MeleeSoldier", "LaserTrooper"] 
      },
      3: { 
        cost: { type: "Cobalt", amount: 2500 }, 
        buildTime: 480, 
        image: require("../assets/images/barracks_3.png"), 
        unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank"] 
      },
    },
  },
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

// ✅ المباني المتاحة للشراء في المتجر (يجب أن تكون قابلة للوضع canBePlaced: true)
export const SHOP_ITEMS = Object.keys(BUILDINGS).filter(key => BUILDINGS[key].canBePlaced);

export default BUILDINGS;
