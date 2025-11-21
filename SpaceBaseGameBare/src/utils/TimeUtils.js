// src/utils/TimeUtils.js
// دوال إدارة الوقت في اللعبة

/**
 * تحويل الثواني إلى صيغة ساعات:دقائق:ثواني
 * @param {number} seconds
 * @returns {string}
 */
export function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
}

/**
 * حساب الوقت المتبقي حتى الانتهاء
 * @param {number} endTimestamp - طابع زمني للانتهاء
 * @returns {number} - الوقت المتبقي بالثواني
 */
export function getTimeRemaining(endTimestamp) {
  const now = Date.now();
  const remaining = Math.floor((endTimestamp - now) / 1000);
  return remaining > 0 ? remaining : 0;
}

/**
 * التحقق إذا انتهى الوقت
 * @param {number} endTimestamp
 * @returns {boolean}
 */
export function isTimeOver(endTimestamp) {
  return getTimeRemaining(endTimestamp) <= 0;
}
