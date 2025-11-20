// src/data/BuildingData.js

export const BUILDINGS = {
  castle: {
    name: "قاعدة القلعة",
    resource: "cobalt",
    maxLevel: 5,
    levels: {
      1: { cost: 100, time: 10, image: require("../assets/images/castle_1.png") },
      2: { cost: 200, time: 15, image: require("../assets/images/castle_2.png") },
      3: { cost: 350, time: 20, image: require("../assets/images/castle_3.png") },
      4: { cost: 600, time: 25, image: require("../assets/images/castle_4.png") },
      5: { cost: 900, time: 30, image: require("../assets/images/castle_5.png") },
    },
  },

  laserTower: {
    name: "برج الليزر",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 80, time: 5, image: require("../assets/images/laser_1.png") },
      2: { cost: 120, time: 7, image: require("../assets/images/laser_2.png") },
      3: { cost: 160, time: 9, image: require("../assets/images/laser_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/laser_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/laser_5.png") },
    },
  },

  cannon: {
    name: "المدفع",
    resource: "mercury",
    maxLevel: 3,
    levels: {
      1: { cost: 50, time: 5, image: require("../assets/images/cannon_1.png") },
      2: { cost: 90, time: 8, image: require("../assets/images/cannon_2.png") },
      3: { cost: 140, time: 10, image: require("../assets/images/cannon_3.png") },
    },
  },

  cobaltMine: {
    name: "منجم الكوبالت",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 40, time: 5, image: require("../assets/images/cobaltMine_1.png") },
      2: { cost: 80, time: 7, image: require("../assets/images/cobaltMine_2.png") },
      3: { cost: 140, time: 10, image: require("../assets/images/cobaltMine_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/cobaltMine_4.png") },
      5: { cost: 350, time: 15, image: require("../assets/images/cobaltMine_5.png") },
    },
  },

  mercuryExtractor: {
    name: "مستخرج الزئبق",
    resource: "mercury",
    maxLevel: 6,
    levels: {
      1: { cost: 30, time: 5, image: require("../assets/images/mercury_1.png") },
      2: { cost: 70, time: 7, image: require("../assets/images/mercury_2.png") },
      3: { cost: 120, time: 9, image: require("../assets/images/mercury_3.png") },
      4: { cost: 200, time: 12, image: require("../assets/images/mercury_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/mercury_5.png") },
      6: { cost: 450, time: 18, image: require("../assets/images/mercury_6.png") },
    },
  },

  mercuryStorage: {
    name: "مخزن الزئبق",
    resource: "mercury",
    maxLevel: 6,
    levels: {
      1: { cost: 60, time: 5, image: require("../assets/images/mStorage_1.png") },
      2: { cost: 100, time: 7, image: require("../assets/images/mStorage_2.png") },
      3: { cost: 150, time: 9, image: require("../assets/images/mStorage_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/mStorage_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/mStorage_5.png") },
      6: { cost: 400, time: 18, image: require("../assets/images/mStorage_6.png") },
    },
  },

  cobaltStorage: {
    name: "مخزن الكوبالت",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 50, time: 5, image: require("../assets/images/cStorage_1.png") },
      2: { cost: 100, time: 7, image: require("../assets/images/cStorage_2.png") },
      3: { cost: 160, time: 9, image: require("../assets/images/cStorage_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/cStorage_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/cStorage_5.png") },
    },
  },

  builderHut: {
    name: "كوخ البناء",
    resource: "crystal",
    maxLevel: 1,
    price: 0, // الأول مجاني
    image: require("../assets/images/builder.png"),
  },
};
