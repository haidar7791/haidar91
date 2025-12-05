// src/gameState.js
// هذا الملف مسؤول عن تعريف الحالة الأولية للعبة وإدارة الحفظ/التحميل (AsyncStorage).

import AsyncStorage from '@react-native-async-storage/async-storage';

export const TOWN_HALL_ID = "Town_Hall";
const GAME_STATE_KEY = '@MyApp:gameState'; // مفتاح التخزين

// تعريف الحالة الأولية - هذه القيم تظهر عند أول تشغيل للعبة
export const initialGameState = {
  resources: {
    Cobalt: 500, // الموارد الأولية: مهمة لظهور شريط الموارد ResourceBar
    Elixir: 500,
    Crystal: 50,
  },
  storageCapacity: {
    Cobalt: 1000,
    Elixir: 1000,
    Crystal: 50,
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
    },
    {
      id: "hut_001",
      type: "Builder_Hut",
      level: 1,
      x: 4,
      y: 4,
      isUpgrading: false,
      upgradeFinishTime: null,
    },
  ],
  totalBuilders: 1,
  availableBuilders: 1,
  lastUpdateTime: Date.now(),
};

// الدالة المطلوبة من useGameLogic.js لتهيئة الحالة الأولية
export const getInitialState = () => {
    return initialGameState;
};

/**
 * دالة لحفظ حالة اللعبة الحالية بشكل دائم باستخدام AsyncStorage.
 * @param {object} gameState - كائن حالة اللعبة الذي سيتم حفظه.
 */
export const saveGameState = async (gameState) => {
    try {
        const jsonValue = JSON.stringify(gameState);
        await AsyncStorage.setItem(GAME_STATE_KEY, jsonValue);
        console.log(`[GameState] State saved successfully to AsyncStorage.`);
    } catch (e) {
        console.error("[GameState] Error saving state:", e);
    }
};

/**
 * دالة لتحميل حالة اللعبة بشكل غير متزامن.
 * @returns {Promise<object>} كائن حالة اللعبة المحملة أو الحالة الأولية (initialGameState) إذا لم يكن هناك بيانات سابقة.
 */
export const loadGameState = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(GAME_STATE_KEY);
        
        if (jsonValue !== null) {
            // تحويل السلسلة النصية إلى كائن JavaScript
            console.log(`[GameState] State loaded successfully from AsyncStorage.`);
            return JSON.parse(jsonValue);
        } else {
            console.warn(`[GameState] No existing state found. Returning initial state.`);
            return getInitialState(); // إذا لم نجد بيانات، نرجع الحالة الأولية
        }
    } catch (e) {
        console.error("[GameState] Error loading state:", e);
        // في حال حدوث خطأ في القراءة، نرجع الحالة الأولية لتجنب تعطل التطبيق
        return getInitialState();
    }
};
