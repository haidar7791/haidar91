// src/storage.js
// هذا الملف مسؤول عن إدارة قراءة وكتابة البيانات الخام (Game State)
// من وإلى التخزين المحلي (AsyncStorage) فقط.

import AsyncStorage from "@react-native-async-storage/async-storage";

// المفتاح المستخدم للتخزين لضمان الوصول المتناسق
const GAME_STATE_KEY = "GAME_DATA_STATE";

/**
 * دالة لحفظ حالة اللعبة في التخزين المحلي.
 * @param {object} data - كائن حالة اللعبة (gameState).
 */
export const saveGameState = async (data) => {
try {
  // التحقق من أن البيانات صالحة قبل التحويل والحفظ
  if (!data || typeof data !== 'object') {
    console.error("Attempted to save invalid game data.");
    return;
  }
  await AsyncStorage.setItem(GAME_STATE_KEY, JSON.stringify(data));
  console.log("Storage: Game state saved.");
} catch (error) {
  console.error("Error saving game state:", error);
}
};

/**
 * دالة لتحميل حالة اللعبة من التخزين المحلي.
 * @returns {Promise<object | null>} كائن الحالة المحملة أو null.
 */
export const loadGameState = async () => {
try {
  const saved = await AsyncStorage.getItem(GAME_STATE_KEY);
  if (saved) {
    console.log("Storage: Game state loaded.");
    return JSON.parse(saved);
  }
  console.log("Storage: No saved state found.");
  return null;
} catch (error) {
  console.error("Error loading game state:", error);
  return null;
}
};

/**
 * دالة لمسح بيانات اللعبة المحفوظة.
 */
export const clearGameData = async () => {
try {
  await AsyncStorage.removeItem(GAME_STATE_KEY);
  console.log("Storage: Game data cleared.");
} catch (error) {
  console.error("Error clearing game data:", error);
}
};
