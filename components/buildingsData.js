// components/buildingsData.js

const BUILDINGS = {
  "Town Hall_1": {
    levels: {
      1: { image: require("../assets/images/Town Hall_1.png"), upgradeCost: 500 },
      2: { image: require("../assets/images/Town Hall_2.png"), upgradeCost: 1000 },
      3: { image: require("../assets/images/Town Hall_3.png"), upgradeCost: 2000 },
      4: { image: require("../assets/images/Town Hall_4.png"), upgradeCost: 4000 },
      5: { image: require("../assets/images/Town Hall_5.png"), upgradeCost: 8000 },
    },
  },
  "Cobalt_1": {
    levels: {
      1: { image: require("../assets/images/Cobalt_1.png"), upgradeCost: 100 },
      2: { image: require("../assets/images/Cobalt_2.png"), upgradeCost: 200 },
      3: { image: require("../assets/images/Cobalt_3.png"), upgradeCost: 400 },
      4: { image: require("../assets/images/Cobalt_4.png"), upgradeCost: 800 },
      5: { image: require("../assets/images/Cobalt_5.png"), upgradeCost: 1600 },
    },
  },
  "Cobalt warehouse_1": {
    levels: {
      1: { image: require("../assets/images/Cobalt warehouse_1.png"), upgradeCost: 150 },
      2: { image: require("../assets/images/Cobalt warehouse_2.png"), upgradeCost: 300 },
      3: { image: require("../assets/images/Cobalt warehouse_3.png"), upgradeCost: 600 },
      4: { image: require("../assets/images/Cobalt warehouse_4.png"), upgradeCost: 1200 },
      5: { image: require("../assets/images/Cobalt warehouse_5.png"), upgradeCost: 2400 },
    },
  },
  "Mercury elixir_1": {
    levels: {
      1: { image: require("../assets/images/Mercury elixir_1.png"), upgradeCost: 80 },
      2: { image: require("../assets/images/Mercury elixir_2.png"), upgradeCost: 160 },
      3: { image: require("../assets/images/Mercury elixir_3.png"), upgradeCost: 320 },
      4: { image: require("../assets/images/Mercury elixir_4.png"), upgradeCost: 640 },
      5: { image: require("../assets/images/Mercury elixir_5.png"), upgradeCost: 1280 },
    },
  },
  "Elixir storehouse_1": {
    levels: {
      1: { image: require("../assets/images/Elixir storehouse_1.png"), upgradeCost: 120 },
      2: { image: require("../assets/images/Elixir storehouse_2.png"), upgradeCost: 240 },
      3: { image: require("../assets/images/Elixir storehouse_3.png"), upgradeCost: 480 },
      4: { image: require("../assets/images/Elixir storehouse_4.png"), upgradeCost: 960 },
      5: { image: require("../assets/images/Elixir storehouse_5.png"), upgradeCost: 1920 },
    },
  },
  "Laser Tower_1": {
    levels: {
      1: { image: require("../assets/images/Laser Tower_1.png"), upgradeCost: 300 },
      2: { image: require("../assets/images/Laser Tower_2.png"), upgradeCost: 600 },
      3: { image: require("../assets/images/Laser Tower_3.png"), upgradeCost: 1200 },
      4: { image: require("../assets/images/Laser Tower_4.png"), upgradeCost: 2400 },
      5: { image: require("../assets/images/Laser Tower_5.png"), upgradeCost: 4800 },
    },
  },
  "cannon_1": {
    levels: {
      1: { image: require("../assets/images/cannon_1.png"), upgradeCost: 250 },
      2: { image: require("../assets/images/cannon_2.png"), upgradeCost: 500 },
      3: { image: require("../assets/images/cannon_3.png"), upgradeCost: 1000 },
    },
  },
  "Forces camp_1": {
    levels: {
      1: { image: require("../assets/images/Forces camp_1.png"), upgradeCost: 200 },
      2: { image: require("../assets/images/Forces camp_2.png"), upgradeCost: 400 },
    },
  },
  "barracks_1": {
    levels: {
      1: { image: require("../assets/images/barracks_1.png"), upgradeCost: 150 },
      2: { image: require("../assets/images/barracks_2.png"), upgradeCost: 300 },
      3: { image: require("../assets/images/barracks_3.png"), upgradeCost: 600 },
    },
  },
  "building hut": {
    levels: {
      1: { image: require("../assets/images/building hut.png"), upgradeCost: 100 },
    },
  },
};

export default BUILDINGS;
