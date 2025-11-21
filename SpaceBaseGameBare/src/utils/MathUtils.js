// src/utils/MathUtils.js
// دوال مساعدة لإجراء العمليات الرياضية الخاصة باللعبة

/**
 * حساب الضرر الناتج عن هجوم مبنى على مبنى آخر
 * @param {number} attackPower - قوة الهجوم
 * @param {number} defense - دفاع الهدف
 * @returns {number}
 */
export function calculateDamage(attackPower, defense) {
  const damage = attackPower - defense;
  return damage > 0 ? damage : 0;
}

/**
 * حساب معدل إنتاج الموارد
 * @param {number} baseProduction - الإنتاج الأساسي
 * @param {number} level - مستوى المبنى
 * @param {number} multiplier - مضاعف إضافي
 * @returns {number}
 */
export function calculateProduction(baseProduction, level, multiplier = 1) {
  return Math.floor(baseProduction * (1 + level * 0.1) * multiplier);
}

/**
 * حساب الوقت اللازم لإكمال عملية الترقية
 * @param {number} baseTime - الوقت الأساسي بالثواني
 * @param {number} level - مستوى المبنى الحالي
 * @returns {number}
 */
export function calculateUpgradeTime(baseTime, level) {
  return Math.floor(baseTime * (1 + level * 0.2));
}

/**
 * دالة لمعادلة عامة إذا لزم الأمر
 * @param {number} value
 * @param {number} factor
 * @returns {number}
 */
export function multiply(value, factor) {
  return value * factor;
}
