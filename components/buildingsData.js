// components/buildingsData.js

export const BUILDINGS = {
  castle: {
    name: "قاعدة القلعة",
    resource: "cobalt",
    maxLevel: 5,
    levels: {
      1: { cost: 100, time: 10, image: require("../assets/images/Town Hall_1.png") },
      2: { cost: 200, time: 15, image: require("../assets/images/Town Hall_2.png") },
      3: { cost: 350, time: 20, image: require("../assets/images/Town Hall_3.png") },
      4: { cost: 600, time: 25, image: require("../assets/images/Town Hall_4.png") },
      5: { cost: 900, time: 30, image: require("../assets/images/Town Hall_5.png") },
    },
  },

  laserTower: {
    name: "برج الليزر",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 80, time: 5, image: require("../assets/images/Laser Tower_1.png") },
      2: { cost: 120, time: 7, image: require("../assets/images/Laser Tower_2.png") },
      3: { cost: 160, time: 9, image: require("../assets/images/Laser Tower_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/Laser Tower_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/Laser Tower_5.png") },
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

  cobal: {
    name: "الكوبالت",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 40, time: 5, image: require("../assets/images/cobalt_1.png") },
      2: { cost: 80, time: 7, image: require("../assets/images/cobalt_2.png") },
      3: { cost: 140, time: 10, image: require("../assets/images/cobalt_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/cobalt_4.png") },
      5: { cost: 350, time: 15, image: require("../assets/images/cobalt_5.png") },
    },
  },

  mercuryExtractor: {
    name: "مستخرج الزئبق",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 30, time: 5, image: require("../assets/images/Mercury elixir_1.png") },
      2: { cost: 70, time: 7, image: require("../assets/images/Mercury elixir_2.png") },
      3: { cost: 120, time: 9, image: require("../assets/images/Mercury elixir_3.png") },
      4: { cost: 200, time: 12, image: require("../assets/images/Mercury elixir_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/Mercury elixir_5.png") },
    },
  },

 "Elixir storehouse": {
    name: "مخزن الزئبق",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 60, time: 5, image: require("../assets/images/Elixirstorehouse_1.png") },
      2: { cost: 100, time: 7, image: require("../assets/images/Elixirstorehouse_2.png") },
      3: { cost: 150, time: 9, image: require("../assets/images/Elixirstorehouse_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/Elixirstorehouse_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/Elixirstorehouse_5.png") },
    },
  },

  Cobaltwarehouse: {
    name: "مخزن الكوبالت",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 50, time: 5, image: require("../assets/images/Cobaltwarehouse_1.png") },
      2: { cost: 100, time: 7, image: require("../assets/images/Cobaltwarehouse_2.png") },
      3: { cost: 160, time: 9, image: require("../assets/images/Cobaltwarehouse_3.png") },
      4: { cost: 220, time: 12, image: require("../assets/images/Cobaltwarehouse_4.png") },
      5: { cost: 300, time: 15, image: require("../assets/images/Cobaltwarehouse_5.png") },
    },
  },

  buildinghut: {
    name: "كوخ البناء",
    resource: "crystal",
    maxLevel: 1,
    price: 0, // الأول مجاني
    image: require("../assets/images/buildinghut.png"),
  },
};
