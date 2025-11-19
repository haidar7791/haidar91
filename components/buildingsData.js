/**
 * buildingsData.js
 * خريطة المباني، المستويات، التكاليف، الوقت، ومسارات الصور.
 * تأكد أن كل الملفات المطلوبة موجودة بالمسار: assets/images/<filename>
 */

const buildingsData = {
  // مبنى القاعدة / Town Hall (levels 1-5)
  castle: {
    key: "castle",
    name: "القاعدة",
    resource: "cobalt",
    maxLevel: 5,
    levels: {
      1: { cost: 100, time: 1, image: require("../assets/images/Town Hall_1.png") },
      2: { cost: 200, time: 120, image: require("../assets/images/Town Hall_2.png") },
      3: { cost: 1000, time: 240, image: require("../assets/images/Town Hall_3.png") },
      4: { cost: 2000, time: 400, image: require("../assets/images/Town Hall_4.png") },
      5: { cost: 5000, time: 800, image: require("../assets/images/Town Hall_5.png") }
    }
  },

  // منجم الكوبالت / Cobalt mine (levels 1-5) - صور إنجليزية: Cobalt_1..Cobalt_5.png
  cobalt_mine: {
    key: "cobalt_mine",
    name: "منجم الكوبالت",
    resource: "cobalt",
    maxLevel: 5,
    levels: {
      1: { cost: 40, time: 5, image: require("../assets/images/Cobalt_1.png") },
      2: { cost: 80, time: 7, image: require("../assets/images/Cobalt_2.png") },
      3: { cost: 140, time: 10, image: require("../assets/images/Cobalt_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/Cobalt_4.png") },
      5: { cost: 340, time: 15, image: require("../assets/images/Cobalt_5.png") }
    }
  },

  // مخزن الكوبالت / Cobalt warehouse (levels 1-5) - ملفات: Cobalt warehouse_1..5.png
  cobalt_storage: {
    key: "cobalt_storage",
    name: "مخزن الكوبالت",
    resource: "cobalt",
    maxLevel: 5,
    levels: {
      1: { cost: 50, time: 5, image: require("../assets/images/Cobalt warehouse_1.png") },
      2: { cost: 120, time: 8, image: require("../assets/images/Cobalt warehouse_2.png") },
      3: { cost: 200, time: 10, image: require("../assets/images/Cobalt warehouse_3.png") },
      4: { cost: 320, time: 12, image: require("../assets/images/Cobalt warehouse_4.png") },
      5: { cost: 480, time: 15, image: require("../assets/images/Cobalt warehouse_5.png") }
    }
  },

  // برج الليزر / Laser Tower (levels 1-5) - files: Laser Tower_1..5.png
  laser_tower: {
    key: "laser_tower",
    name: "برج الليزر",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 80, time: 8, image: require("../assets/images/Laser Tower_1.png") },
      2: { cost: 160, time: 12, image: require("../assets/images/Laser Tower_2.png") },
      3: { cost: 300, time: 15, image: require("../assets/images/Laser Tower_3.png") },
      4: { cost: 520, time: 18, image: require("../assets/images/Laser Tower_4.png") },
      5: { cost: 900, time: 22, image: require("../assets/images/Laser Tower_5.png") }
    }
  },

  // المدفع / Cannon (levels 1-3) - cannon_1..cannon_3.png
  cannon: {
    key: "cannon",
    name: "مدفع",
    resource: "mercury",
    maxLevel: 3,
    levels: {
      1: { cost: 70, time: 8, image: require("../assets/images/cannon_1.png") },
      2: { cost: 140, time: 12, image: require("../assets/images/cannon_2.png") },
      3: { cost: 260, time: 16, image: require("../assets/images/cannon_3.png") }
    }
  },

  // مستخرج الزئبق / Mercury extractor (levels 1-6) - Arabic files: مستخرج الزئبق 1..6.png
  mercury_extractor: {
    key: "mercury_extractor",
    name: "مستخرج الزئبق",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 30, time: 5, image: require("../assets/images/مستخرج الزئبق 1.png") },
      2: { cost: 70, time: 7, image: require("../assets/images/مستخرج الزئبق 2.png") },
      3: { cost: 130, time: 9, image: require("../assets/images/مستخرج الزئبق 3.png") },
      4: { cost: 220, time: 11, image: require("../assets/images/مستخرج الزئبق 4.png") },
      5: { cost: 360, time: 14, image: require("../assets/images/مستخرج الزئبق 5.png") },
    }
  },

  // مخزن الزئبق / Mercury storage (levels 1-5) - Arabic files: مخزن الزئبق 1..5.png
  mercury_storage: {
    key: "mercury_storage",
    name: "مخزن الزئبق",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 60, time: 6, image: require("../assets/images/مخزن الزئبق 1.png") },
      2: { cost: 130, time: 9, image: require("../assets/images/مخزن الزئبق 2.png") },
      3: { cost: 240, time: 12, image: require("../assets/images/مخزن الزئبق 3.png") },
      4: { cost: 420, time: 15, image: require("../assets/images/مخزن الزئبق 4.png") },
      5: { cost: 700, time: 18, image: require("../assets/images/مخزن الزئبق 5.png") }
    }
  },

  // مخزن الزئبق بالانجليزية (Elixir Storehouse) إن وجد - English filenames present too
  elixir_storehouse: {
    key: "elixir_storehouse",
    name: "Elixir Storehouse",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 60, time: 6, image: require("../assets/images/Elixir storehouse_1.png") },
      2: { cost: 130, time: 9, image: require("../assets/images/Elixir storehouse_2.png") },
      3: { cost: 240, time: 12, image: require("../assets/images/Elixir storehouse_3.png") },
      4: { cost: 420, time: 15, image: require("../assets/images/Elixir storehouse_4.png") },
      5: { cost: 700, time: 18, image: require("../assets/images/Elixir storehouse_5.png") }
    }
  },

  // معسكر القوات / Forces camp (levels 1-2) - Forces camp_1.png, Forces camp_2.png
  forces_camp: {
    key: "forces_camp",
    name: "معسكر القوات",
    resource: null,
    maxLevel: 2,
    levels: {
      1: { cost: 100, time: 100, image: require("../assets/images/Forces camp_1.png") },
      2: { cost: 300, time: 200, image: require("../assets/images/Forces camp_2.png") }
    }
  },

  // ثكنة / Barracks (levels 1-3) - barracks_1..3.png
  barracks: {
    key: "barracks",
    name: "ثكنة عسكرية",
    resource: null,
    maxLevel: 3,
    levels: {
      1: { cost: 100, time: 100, image: require("../assets/images/barracks_1.png") },
      2: { cost: 200, time: 300, image: require("../assets/images/barracks_2.png") },
      3: { cost: 300, time: 500, image: require("../assets/images/barracks_3.png") }
    }
  },

  // كوخ البناء / Building hut (no levels, up to 4 huts; first free) - file: building hut.png
  building_hut: {
    key: "building_hut",
    name: "كوخ البناء",
    resource: "crystals",
    maxCount: 4,
    image: require("../assets/images/building hut.png")
  },

  // أرضية اللعبة / Game floor
  game_floor: {
    key: "game_floor",
    name: "أرضية اللعبة",
    image: require("../assets/images/Game floor.jpg")
  },

  // أيقونة التطبيق / Game icon
  game_icon: {
    key: "game_icon",
    name: "Game Icon",
    image: require("../assets/images/Game icon.png")
  }
};

export default buildingsData;
