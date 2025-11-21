// src/store/gameState.js

export const initialGameState = {
  resources: {
    cobalt: 1000,
    mercury: 500,
    gold: 2000,
  },
  buildings: [
    {
      type: "Town Hall_1",
      level: 1,
      x: 5,
      y: 5,
      isUpgrading: false,
      upgradeCompleteTime: null,
    },
    {
      type: "Cobalt warehouse_1",
      level: 1,
      x: 3,
      y: 4,
      isUpgrading: false,
      upgradeCompleteTime: null,
    },
    {
      type: "Mercury elixir_1",
      level: 1,
      x: 7,
      y: 6,
      isUpgrading: false,
      upgradeCompleteTime: null,
    },
    {
      type: "Laser Tower_1",
      level: 1,
      x: 2,
      y: 8,
      isUpgrading: false,
      upgradeCompleteTime: null,
    },
  ],
};
