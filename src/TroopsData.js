// data/TroopsData.js

export const TROOP_TYPES = {
  SOLDIER: "Soldier",
  RANGER: "Ranger",
  TANK: "Tank",
};

// السعة لكل نوع قوات داخل المعسكر (كم خانة يأخذ)
export const TROOP_HOUSING_SPACE = {
  Soldier: 1,
  Ranger: 2,
  Tank: 5,
};

export const TROOPS = {
  // ---------------------------------------------------------------
  // 1. Soldier (المقاتل العادي)
  // ---------------------------------------------------------------
  Soldier: {
    name: "Soldier",
    name_ar: "جندي",
    description: "مقاتل خفيف، رخيص وسريع التدريب",

    levels: {
      1: { hp: 30, dmg: 5, trainingTime: 5, cost: { type: "Elixir", amount: 30 } },
      2: { hp: 40, dmg: 7, trainingTime: 5, cost: { type: "Elixir", amount: 50 } },
      3: { hp: 50, dmg: 9, trainingTime: 6, cost: { type: "Elixir", amount: 80 } },
      4: { hp: 60, dmg: 12, trainingTime: 6, cost: { type: "Elixir", amount: 120 } },
      5: { hp: 70, dmg: 15, trainingTime: 7, cost: { type: "Elixir", amount: 180 } },
      6: { hp: 80, dmg: 18, trainingTime: 7, cost: { type: "Elixir", amount: 250 } },
      7: { hp: 95, dmg: 22, trainingTime: 8, cost: { type: "Elixir", amount: 350 } },
      8: { hp: 110, dmg: 26, trainingTime: 8, cost: { type: "Elixir", amount: 500 } },
      9: { hp: 125, dmg: 30, trainingTime: 9, cost: { type: "Elixir", amount: 700 } },
      10: { hp: 150, dmg: 35, trainingTime: 10, cost: { type: "Elixir", amount: 1000 } },
    },
  },

  // ---------------------------------------------------------------
  // 2. Ranger (رامي – قوة بعيدة المدى)
  // ---------------------------------------------------------------
  Ranger: {
    name: "Ranger",
    name_ar: "رامي",
    description: "قوة بعيدة المدى، أقوى من الجندي ولكن أبطأ بالتدريب",

    levels: {
      1: { hp: 40, dmg: 10, trainingTime: 10, cost: { type: "Elixir", amount: 80 } },
      2: { hp: 50, dmg: 13, trainingTime: 11, cost: { type: "Elixir", amount: 120 } },
      3: { hp: 60, dmg: 16, trainingTime: 12, cost: { type: "Elixir", amount: 180 } },
      4: { hp: 70, dmg: 20, trainingTime: 13, cost: { type: "Elixir", amount: 260 } },
      5: { hp: 85, dmg: 24, trainingTime: 14, cost: { type: "Elixir", amount: 360 } },
      6: { hp: 100, dmg: 30, trainingTime: 14, cost: { type: "Elixir", amount: 480 } },
      7: { hp: 120, dmg: 35, trainingTime: 15, cost: { type: "Elixir", amount: 650 } },
      8: { hp: 140, dmg: 42, trainingTime: 16, cost: { type: "Elixir", amount: 900 } },
      9: { hp: 160, dmg: 50, trainingTime: 17, cost: { type: "Elixir", amount: 1200 } },
      10: { hp: 180, dmg: 60, trainingTime: 18, cost: { type: "Elixir", amount: 1500 } },
    },
  },

  // ---------------------------------------------------------------
  // 3. Tank (المصفحة – ثقيلة وقوية)
  // ---------------------------------------------------------------
  Tank: {
    name: "Tank",
    name_ar: "دبابة",
    description: "ثقيلة جدًا – بطيئة – قوية جدًا",

    levels: {
      1: { hp: 250, dmg: 25, trainingTime: 20, cost: { type: "Cobalt", amount: 150 } },
      2: { hp: 300, dmg: 30, trainingTime: 20, cost: { type: "Cobalt", amount: 200 } },
      3: { hp: 350, dmg: 36, trainingTime: 20, cost: { type: "Cobalt", amount: 300 } },
      4: { hp: 420, dmg: 42, trainingTime: 21, cost: { type: "Cobalt", amount: 450 } },
      5: { hp: 500, dmg: 50, trainingTime: 22, cost: { type: "Cobalt", amount: 600 } },
      6: { hp: 600, dmg: 60, trainingTime: 23, cost: { type: "Cobalt", amount: 800 } },
      7: { hp: 700, dmg: 70, trainingTime: 24, cost: { type: "Cobalt", amount: 1100 } },
      8: { hp: 820, dmg: 80, trainingTime: 25, cost: { type: "Cobalt", amount: 1500 } },
      9: { hp: 950, dmg: 95, trainingTime: 26, cost: { type: "Cobalt", amount: 1900 } },
      10: { hp: 1100, dmg: 110, trainingTime: 28, cost: { type: "Cobalt", amount: 2500 } },
    },
  },
};
