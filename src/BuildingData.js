// data/BuildingData.js
// بيانات المباني — تعريفات، مستويات، تكلفة، إنتاج، سعة، وما يفتح كل مستوى.
// ملاحظة: بعض صور المستويات قد تعيد استخدام نفس الملف إذا لم تكن لديك صور لكل مستوى.
import { RESOURCE_TYPES } from "./ResourceConstants";
export const TOWN_HALL_ID = "Town_Hall";

// تعريف الموارد الأساسية في اللعبة
export const RESOURCES = {
  Cobalt: { name: "Cobalt", name_ar: "كوبالت", icon: "diamond-stone", color: "#007FFF" }, // أزرق/كوبالت
  Elixir: { name: "Elixir", name_ar: "إكسير", icon: "test-tube-empty", color: "#FF1493" }, // وردي/بنفسجي
  Crystal: { name: "Crystal", name_ar: "كريستال", icon: "cube-outline", color: "#A9A9A9" }, // رمادي/فضي (خاص بالبناة)
};

const makeLinearCosts = (baseAmount, factor = 1.9, levels = 10, type = "Cobalt") => {
  const out = {};
  for (let i = 1; i <= levels; i++) {
    out[i] = {
      cost: { type, amount: Math.round(baseAmount * Math.pow(factor, i - 1)) },
      buildTime: Math.round(10 * Math.pow(1.3, i - 1)), // seconds (пример)
    };
  }
  return out;
};

export const BUILDINGS = {
  // -------------------------------------------------------------------
  // 1. Town Hall (القاعدة) - مفتاح فريد
  // -------------------------------------------------------------------
  [TOWN_HALL_ID]: {
    name: "Town Hall",
    name_ar: "مبنى القاعدة",
    maxCount: 1,
    size: 4,
    canBePlaced: false,
    // فتح مباني جديدة كل ترقية وتوفير سعة تخزين أساسية (قاعدة)
    image: require("../assets/images/Town_Hall.png"),
    levels: {
      1: {
        cost: { type: "Cobalt", amount: 0 },
        buildTime: 0,
        // تم استبدال المسارات الوهمية بمساراتك الحقيقية
        image: require("../assets/images/Town_Hall.png"),
        production: {},
        storage: { Cobalt: 500, Elixir: 500, Crystal: 50 },
        unlocks: ["Cobalt_Mine", "Elixir_Collector", "Building_Hut",], //
        maxBuildersUnlocked: 1,
      },
      2: {
        cost: { type: "Cobalt", amount: 150 },
        buildTime: 60,
        image: require("../assets/images/Town_Hall_2.png"),
        production: {},
        storage: { Cobalt: 800, Elixir: 800, Crystal: 80 },
        unlocks: ["Barracks"],
        maxBuildersUnlocked: 1,
      },
      3: {
        cost: { type: "Cobalt", amount: 400 },
        buildTime: 120,
        image: require("../assets/images/Town_Hall_3.png"),
        production: {},
        storage: { Cobalt: 1200, Elixir: 1200, Crystal: 120 },
        unlocks: ["Laser_Tower"],
        maxBuildersUnlocked: 2,
      },
      4: {
        cost: { type: "Cobalt", amount: 900 },
        buildTime: 240,
        image: require("../assets/images/Town_Hall_4.png"),
        production: {},
        storage: { Cobalt: 2000, Elixir: 2000, Crystal: 200 },
        unlocks: [],
        maxBuildersUnlocked: 2,
      },
      5: {
        cost: { type: "Cobalt", amount: 2000 },
        buildTime: 480,
        image: require("../assets/images/Town_Hall_5.png"),
        production: {},
        storage: { Cobalt: 4000, Elixir: 4000, Crystal: 400 },
        unlocks: ["Forces_Camp"],
        maxBuildersUnlocked: 3,
      },
      // مستويات إضافية حتى 10 (تدرج سعة وتكاليف)
      6: { cost: { type: "Cobalt", amount: 4000 }, buildTime: 900, image: require("../assets/images/Town_Hall_5.png"), production: {}, storage: { Cobalt: 8000, Elixir: 8000, Crystal: 800 }, unlocks: [], maxBuildersUnlocked: 3 },
      7: { cost: { type: "Cobalt", amount: 8000 }, buildTime: 1800, image: require("../assets/images/Town_Hall_5.png"), production: {}, storage: { Cobalt: 16000, Elixir: 16000, Crystal: 1200 }, unlocks: [], maxBuildersUnlocked: 4 },
      8: { cost: { type: "Cobalt", amount: 16000 }, buildTime: 3600, image: require("../assets/images/Town_Hall_5.png"), production: {}, storage: { Cobalt: 32000, Elixir: 32000, Crystal: 1600 }, unlocks: [], maxBuildersUnlocked: 4 },
      9: { cost: { type: "Cobalt", amount: 32000 }, buildTime: 7200, image: require("../assets/images/Town_Hall_5.png"), production: {}, storage: { Cobalt: 64000, Elixir: 64000, Crystal: 2000 }, unlocks: [], maxBuildersUnlocked: 5 },
      10:{ cost: { type: "Cobalt", amount: 64000 }, buildTime: 14400, image: require("../assets/images/Town_Hall_5.png"), production: {}, storage: { Cobalt: 100000, Elixir: 100000, Crystal: 5000 }, unlocks: [], maxBuildersUnlocked: 6 },
    },
  },

  // -------------------------------------------------------------------
  // 2. Resource Collectors (منجم كوبالت و مستخرج إكسير)
  // -------------------------------------------------------------------
  Cobalt_Mine: {
    name: "Cobalt Mine",
    name_ar: "منجم الكوبالت",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Cobalt_Mine.png"),
    levels: {
      1: { cost: { type: "Cobalt", amount: 50 }, buildTime: 10, image: require("../assets/images/Cobalt_Mine.png"), production: { Cobalt: 2 }, storage: {} },
      2: { cost: { type: "Cobalt", amount: 100 }, buildTime: 15, image: require("../assets/images/Cobalt_Mine_2.png"), production: { Cobalt: 5 } },
      3: { cost: { type: "Cobalt", amount: 220 }, buildTime: 20, image: require("../assets/images/Cobalt_Mine_3.png"), production: { Cobalt: 12 } },
      4: { cost: { type: "Cobalt", amount: 480 }, buildTime: 30, image: require("../assets/images/Cobalt_Mine_4.png"), production: { Cobalt: 25 } },
      5: { cost: { type: "Cobalt", amount: 1000 }, buildTime: 60, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 60 } },
      6: { cost: { type: "Cobalt", amount: 2200 }, buildTime: 120, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 140 } },
      7: { cost: { type: "Cobalt", amount: 4800 }, buildTime: 240, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 320 } },
      8: { cost: { type: "Cobalt", amount: 10000 }, buildTime: 480, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 700 } },
      9: { cost: { type: "Cobalt", amount: 22000 }, buildTime: 900, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 1600 } },
      10:{ cost: { type: "Cobalt", amount: 48000 }, buildTime: 1800, image: require("../assets/images/Cobalt_Mine_5.png"), production: { Cobalt: 3600 } },
    },
  },

  Elixir_Collector: {
    name: "Elixir Collector",
    name_ar: "مجمع الإكسير",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Elixir_Collector.png"),
    levels: {
      1: { cost: { type: "Elixir", amount: 50 }, buildTime: 10, image: require("../assets/images/Elixir_Collector.png"), production: { Elixir: 2 } },
      2: { cost: { type: "Elixir", amount: 120 }, buildTime: 15, image: require("../assets/images/Elixir_Collector_2.png"), production: { Elixir: 6 } },
      3: { cost: { type: "Elixir", amount: 300 }, buildTime: 20, image: require("../assets/images/Elixir_Collector_3.png"), production: { Elixir: 14 } },
      4: { cost: { type: "Elixir", amount: 680 }, buildTime: 30, image: require("../assets/images/Elixir_Collector_4.png"), production: { Elixir: 32 } },
      5: { cost: { type: "Elixir", amount: 1500 }, buildTime: 60, image: require("../assets/images/Elixir_Collector_5.png"), production: { Elixir: 80 } },
      6: { cost: { type: "Elixir", amount: 3300 }, buildTime: 120, image: require("../assets/images/Elixir_Collector_5.png"), production: { Elixir: 180 } },
      7: { cost: { type: "Elixir", amount: 7200 }, buildTime: 240, image: require("../assets/images/Elixir_Collector_5.png"), production: { Elixir: 420 } },
      8: { cost: { type: "Elixir", amount: 16000 }, buildTime: 480, image: require("../assets/images/Elixir_Collector_5.png"), production: { Elixir: 1000 } },
      9: { cost: { type: "Elixir", amount: 36000 }, buildTime: 900, image: require("../assets/images/Elixir_Collector_5.png"), production: { Elixir: 2300 } },
      10:{ cost: { type: "Elixir", amount: 80000 }, buildTime: 1800, image: require("../assets/images/Elixir_Collector_5.png"), production: { Elixir: 5000 } },
    },
  },

  // -------------------------------------------------------------------
  // 3. Storage (مخازن) — تُمكن زيادة السعة
  // -------------------------------------------------------------------
  Cobalt_Warehouse: {
    name: "Cobalt Warehouse",
    name_ar: "مخزن الكوبالت",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Cobalt_warehouse.png"),
    levels: {
      1: { cost: { type: "Cobalt", amount: 100 }, buildTime: 20, image: require("../assets/images/Cobalt_warehouse.png"), storage: { Cobalt: 2000 } },
      2: { cost: { type: "Cobalt", amount: 300 }, buildTime: 40, image: require("../assets/images/Cobalt_warehouse_2.png"), storage: { Cobalt: 5000 } },
      3: { cost: { type: "Cobalt", amount: 800 }, buildTime: 80, image: require("../assets/images/Cobalt_warehouse_3.png"), storage: { Cobalt: 12000 } },
      4: { cost: { type: "Cobalt", amount: 2000 }, buildTime: 160, image: require("../assets/images/Cobalt_warehouse_4.png"), storage: { Cobalt: 30000 } },
      5: { cost: { type: "Cobalt", amount: 4800 }, buildTime: 320, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 80000 } },
      6: { cost: { type: "Cobalt", amount: 10000 }, buildTime: 640, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 160000 } },
      7: { cost: { type: "Cobalt", amount: 22000 }, buildTime: 1200, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 320000 } },
      8: { cost: { type: "Cobalt", amount: 48000 }, buildTime: 2400, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 640000 } },
      9: { cost: { type: "Cobalt", amount: 100000 }, buildTime: 4800, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 1000000 } },
      10:{ cost: { type: "Cobalt", amount: 220000 }, buildTime: 9600, image: require("../assets/images/Cobalt_warehouse_5.png"), storage: { Cobalt: 2000000 } },
    },
  },

  Elixir_Storehouse: {
    name: "Elixir Storehouse",
    name_ar: "مخزن الإكسير",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Elixir_storehouse.png"),
    levels: {
      1: { cost: { type: "Elixir", amount: 100 }, buildTime: 20, image: require("../assets/images/Elixir_storehouse.png"), storage: { Elixir: 2000 } },
      2: { cost: { type: "Elixir", amount: 300 }, buildTime: 40, image: require("../assets/images/Elixir_storehouse_2.png"), storage: { Elixir: 5000 } },
      3: { cost: { type: "Elixir", amount: 800 }, buildTime: 80, image: require("../assets/images/Elixir_storehouse_3.png"), storage: { Elixir: 12000 } },
      4: { cost: { type: "Elixir", amount: 2000 }, buildTime: 160, image: require("../assets/images/Elixir_storehouse_4.png"), storage: { Elixir: 30000 } },
      5: { cost: { type: "Elixir", amount: 4800 }, buildTime: 320, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 80000 } },
      6: { cost: { type: "Elixir", amount: 10000 }, buildTime: 640, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 160000 } },
      7: { cost: { type: "Elixir", amount: 22000 }, buildTime: 1200, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 320000 } },
      8: { cost: { type: "Elixir", amount: 48000 }, buildTime: 2400, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 640000 } },
      9: { cost: { type: "Elixir", amount: 100000 }, buildTime: 4800, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 1000000 } },
      10:{ cost: { type: "Elixir", amount: 220000 }, buildTime: 9600, image: require("../assets/images/Elixir_storehouse_5.png"), storage: { Elixir: 2000000 } },
    },
  },

  // -------------------------------------------------------------------
  // 4. Defensive Buildings (مدافع، أبراج)
  // -------------------------------------------------------------------
  Cannon: {
    name: "Cannon",
    name_ar: "مدفع",
    maxCount: 3,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/cannon.png"),
    levels: {
      1: { cost: { type: "Cobalt", amount: 80 }, buildTime: 20, image: require("../assets/images/cannon.png") },
      2: { cost: { type: "Cobalt", amount: 200 }, buildTime: 40, image: require("../assets/images/cannon_2.png") },
      3: { cost: { type: "Cobalt", amount: 500 }, buildTime: 80, image: require("../assets/images/cannon_3.png") },
      4: { cost: { type: "Cobalt", amount: 1200 }, buildTime: 160, image: require("../assets/images/cannon_3.png") },
      5: { cost: { type: "Cobalt", amount: 3000 }, buildTime: 320, image: require("../assets/images/cannon_3.png") },
      6: { cost: { type: "Cobalt", amount: 7000 }, buildTime: 640, image: require("../assets/images/cannon_3.png") },
      7: { cost: { type: "Cobalt", amount: 16000 }, buildTime: 1200, image: require("../assets/images/cannon_3.png") },
      8: { cost: { type: "Cobalt", amount: 36000 }, buildTime: 2400, image: require("../assets/images/cannon_3.png") },
      9: { cost: { type: "Cobalt", amount: 80000 }, buildTime: 4800, image: require("../assets/images/cannon_3.png") },
      10:{ cost: { type: "Cobalt", amount: 180000 }, buildTime: 9600, image: require("../assets/images/cannon_3.png") },
    },
  },

  Laser_Tower: {
    name: "Laser Tower",
    name_ar: "برج الليزر",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Laser_Tower.png"),
    levels: {
      1: { cost: { type: "Elixir", amount: 80 }, buildTime: 35, image: require("../assets/images/Laser_Tower.png") },
      2: { cost: { type: "Elixir", amount: 200 }, buildTime: 70, image: require("../assets/images/Laser_Tower_2.png") },
      3: { cost: { type: "Elixir", amount: 500 }, buildTime: 120, image: require("../assets/images/Laser_Tower_3.png") },
      4: { cost: { type: "Elixir", amount: 1200 }, buildTime: 240, image: require("../assets/images/Laser_Tower_3.png") },
      5: { cost: { type: "Elixir", amount: 3000 }, buildTime: 480, image: require("../assets/images/Laser_Tower_3.png") },
      6: { cost: { type: "Elixir", amount: 7000 }, buildTime: 960, image: require("../assets/images/Laser_Tower_3.png") },
      7: { cost: { type: "Elixir", amount: 16000 }, buildTime: 1920, image: require("../assets/images/Laser_Tower_3.png") },
      8: { cost: { type: "Elixir", amount: 36000 }, buildTime: 3840, image: require("../assets/images/Laser_Tower_3.png") },
      9: { cost: { type: "Elixir", amount: 80000 }, buildTime: 7680, image: require("../assets/images/Laser_Tower_3.png") },
      10:{ cost: { type: "Elixir", amount: 180000 }, buildTime: 15360, image: require("../assets/images/Laser_Tower_3.png") },
    },
  },

  // -------------------------------------------------------------------
  // 5. Builder Hut (كوخ البناء) — يوجد 4 أكواخ كطلبك
  // -------------------------------------------------------------------
  Builder_Hut: {
    name: "Builder_Hut",
    name_ar: "كوخ البناء",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/Builder_Hut.png"),
    levels: {
      1: { cost: { type: "Crystal", amount: 0 }, buildTime: 0, image: require("../assets/images/Builder_Hut.png"), addsBuilder: 1 },
      2: { cost: { type: "Crystal", amount: 50 }, buildTime: 30, image: require("../assets/images/Builder_Hut.png"), addsBuilder: 1 },
      3: { cost: { type: "Crystal", amount: 120 }, buildTime: 60, image: require("../assets/images/Builder_Hut.png"), addsBuilder: 1 },
      4: { cost: { type: "Crystal", amount: 300 }, buildTime: 120, image: require("../assets/images/Builder_Hut.png"), addsBuilder: 1 },
    },
    // هذا لا يبدو منطقياً كـ `additionalCosts`، يجب أن يمثل تكلفة بناء كوخ جديد
    // سنستخدم هذه التكاليف كحد أقصى لعدد الأكواخ التي يمكن بناؤها (على افتراض أن maxCount هو إجمالي الأكواخ المتاحة)
    // إذا كان القصد هو تكلفة شراء كوخ جديد وليس ترقية، سنعدل الاستخدام لاحقاً.
    additionalCosts: [ { type: "Crystal", amount: 50 }, { type: "Crystal", amount: 100 }, { type: "Crystal", amount: 200 }, { type: "Crystal", amount: 500 } ],
  },

  // -------------------------------------------------------------------
  // 6. Forces Camp (معسكر القوات) — مستويين كما طلبت
  // -------------------------------------------------------------------
  Forces_Camp: {
    name: "Forces Camp",
    name_ar: "معسكر القوات",
    maxCount: 1,
    size: 6,
    canBePlaced: true,
    image: require("../assets/images/Forces_camp.png"),
    levels: {
      1: { cost: { type: "Cobalt", amount: 200 }, buildTime: 60, image: require("../assets/images/Forces_camp.png"), troopCapacity: 10 },
      2: { cost: { type: "Cobalt", amount: 800 }, buildTime: 180, image: require("../assets/images/Forces_camp_2.png"), troopCapacity: 25 },
    },
  },

  // -------------------------------------------------------------------
  // 7. Barracks (الثكنة) — 3 مستويات، كل مستوى يفتح وحدات جديدة
  // -------------------------------------------------------------------
  Barracks: {
    name: "Barracks",
    name_ar: "الثكنة",
    maxCount: 1,
    size: 3,
    canBePlaced: true,
    image: require("../assets/images/barracks.png"),
    levels: {
      1: { cost: { type: "Cobalt", amount: 300 }, buildTime: 60, image: require("../assets/images/barracks.png"), unlocksTroops: ["MeleeSoldier"] },
      2: { cost: { type: "Cobalt", amount: 900 }, buildTime: 180, image: require("../assets/images/barracks_2.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper"] },
      3: { cost: { type: "Cobalt", amount: 2500 }, buildTime: 480, image: require("../assets/images/barracks_3.png"), unlocksTroops: ["MeleeSoldier", "LaserTrooper", "RoboTank"] },
    },
  },

  // -------------------------------------------------------------------
  // 8. Troop Training / Other
  // -------------------------------------------------------------------
  // (إذا رغبت يمكن إضافة مباني تدريب إضافية لاحقاً)
};

// المباني المتاحة للشراء في المتجر (يجب أن تكون قابلة للوضع canBePlaced: true)
export const SHOP_ITEMS = Object.keys(BUILDINGS).filter(key => BUILDINGS[key].canBePlaced);


export default BUILDINGS;
// تم إضافة تصدير RESOURCES و SHOP_ITEMS للوصول إليها بسهولة
