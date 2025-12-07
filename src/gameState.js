// src/gameState.js
// مسؤول عن الحالة الأولية وحفظ/تحميل الحالة (AsyncStorage)

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TimeUtils from './TimeUtils';

export const TOWN_HALL_ID = "Town_Hall";
const GAME_STATE_KEY = '@MyApp:gameState_v1';

// الحالة الابتدائية
export const initialGameState = {
  resources: {
    Cobalt: 500,
    Elixir: 500,
    Crystal: 50,
  },
  storageCapacity: {
    Cobalt: 1000,
    Elixir: 1000,
    Crystal: 100,
  },
  buildings: [
    {
      id: "th_001",
      type: TOWN_HALL_ID,
      level: 1,
      x: 5,
      y: 5,
      isUpgrading: false,
      upgradeFinishTime: null,
      isBuilding: false,
      buildFinishTime: null,
    },
    {
      id: "hut_001",
      type: "Builder_Hut",
      level: 1,
      x: 3,
      y: 5,
      isUpgrading: false,
      upgradeFinishTime: null,
      isBuilding: false,
      buildFinishTime: null,
    },
  ],
  totalBuilders: 1,
  availableBuilders: 1,
  lastUpdateTime: TimeUtils.now(), // seconds
};

// دالة للحصول على الحالة الابتدائية (مستخدمة في useGameLogic)
export const getInitialState = () => {
  return initialGameState;
};

// حفظ الحالة إلى AsyncStorage
export const saveGameState = async (state) => {
  try {
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(GAME_STATE_KEY, jsonValue);
    // console.log("[gameState] saved");
  } catch (e) {
    console.error("[gameState] save error:", e);
  }
};

// تحميل الحالة من AsyncStorage (إرجاع الحالة الابتدائية إن لم توجد)
export const loadGameState = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GAME_STATE_KEY);
    if (jsonValue !== null) {
      const parsed = JSON.parse(jsonValue);
      // ensure lastUpdateTime exists
      if (!parsed.lastUpdateTime) parsed.lastUpdateTime = TimeUtils.now();
      // console.log("[gameState] loaded");
      return parsed;
    }
  } catch (e) {
    console.error("[gameState] load error:", e);
  }
  return getInitialState();
};

export default {
  getInitialState,
  saveGameState,
  loadGameState,
};
