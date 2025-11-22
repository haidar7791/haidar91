// src/data/BuildingData.js

export const BUILDINGS = {
  Town_Hall: {
    name: "Town_Hall",
    resource: "cobalt",
    maxLevel: 5,
    levels: {
      1: { cost: 100, time: 10, image: require("../../assets/images/Town_Hall_1.png") },
      2: { cost: 200, time: 15, image: require("../../assets/images/Town_Hall_2.png") },
      3: { cost: 350, time: 20, image: require("../../assets/images/Town_Hall_3.png") },
      4: { cost: 600, time: 25, image: require("../../assets/images/Town_Hall_4.png") },
      5: { cost: 900, time: 30, image: require("../../assets/images/Town_Hall_5.png") },
    },
  },

  laser_Tower: {
    name: "laser_Tower",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 80, time: 5, image: require("../../assets/images/laser_Tower_1.png") },
      2: { cost: 120, time: 7, image: require("../../assets/images/laser_Tower_2.png") },
      3: { cost: 160, time: 9, image: require("../../assets/images/laser_Tower_3.png") },
      4: { cost: 220, time: 12, image: require("../../assets/images/laser_Tower_4.png") },
      5: { cost: 300, time: 15, image: require("../../assets/images/laser_Tower_5.png") },
    },
  },

  cannon: {
    name: "cannon",
    resource: "mercury",
    maxLevel: 3,
    levels: {
      1: { cost: 50, time: 5, image: require("../../assets/images/cannon_1.png") },
      2: { cost: 90, time: 8, image: require("../../assets/images/cannon_2.png") },
      3: { cost: 140, time: 10, image: require("../../assets/images/cannon_3.png") },
    },
  },

  Cobalt: {
    name: "Cobalt",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 40, time: 5, image: require("../../assets/images/cobalt_1.png") },
      2: { cost: 80, time: 7, image: require("../../assets/images/cobalt_2.png") },
      3: { cost: 140, time: 10, image: require("../../assets/images/cobalt_3.png") },
      4: { cost: 220, time: 12, image: require("../../assets/images/cobalt_4.png") },
      5: { cost: 350, time: 15, image: require("../../assets/images/cobalt_5.png") },
    },
  },

  Mercury_elixir: {
    name: "Mercury_elixir",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 30, time: 5, image: require("../../assets/images/Mercury_elixir_1.png") },
      2: { cost: 70, time: 7, image: require("../../assets/images/Mercury_elixir_2.png") },
      3: { cost: 120, time: 9, image: require("../../assets/images/Mercury_elixir_3.png") },
      4: { cost: 200, time: 12, image: require("../../assets/images/Mercury_elixir_4.png") },
      5: { cost: 300, time: 15, image: require("../../assets/images/Mercury_elixir_5.png") },
    },
  },

  Elixir_storehouse: {
    name: "Elixir_storehouse",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 60, time: 5, image: require("../../assets/images/Elixir_storehouse_1.png") },
      2: { cost: 100, time: 7, image: require("../../assets/images/Elixir_storehouse_2.png") },
      3: { cost: 150, time: 9, image: require("../../assets/images/Elixir_storehouse_3.png") },
      4: { cost: 220, time: 12, image: require("../../assets/images/Elixir_storehouse_4.png") },
      5: { cost: 300, time: 15, image: require("../../assets/images/Elixir_storehouse_5.png") },
    },
  },

  Cobalt_warehouse: {
    name: "Cobalt_warehouse",
    resource: "mercury",
    maxLevel: 5,
    levels: {
      1: { cost: 50, time: 5, image: require("../../assets/images/Cobalt_warehouse_1.png") },
      2: { cost: 100, time: 7, image: require("../../assets/images/Cobalt_warehouse_2.png") },
      3: { cost: 160, time: 9, image: require("../../assets/images/Cobalt_warehouse_3.png") },
      4: { cost: 220, time: 12, image: require("../../assets/images/Cobalt_warehouse_4.png") },
      5: { cost: 300, time: 15, image: require("../../assets/images/Cobalt_warehouse_5.png") },
    },
  },

  building_hut: {
    name: "building_hut",
    resource: "crystal",
    maxLevel: 1,
    price: 0, // الأول مجاني
    image: require("../../assets/images/building_hut.png"),
  },
};
