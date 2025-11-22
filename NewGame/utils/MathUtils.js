// utils/MathUtils.js

// حساب الضرر النهائي (damage * multiplier - defense)
export function calculateDamage(baseDamage, multiplier, enemyDefense) {
  const total = baseDamage * multiplier - enemyDefense;
  return total > 0 ? total : 1; // أقل شيء 1 ضرر
}

// حساب الإنتاج لكل ساعة
export function hourlyProduction(ratePerSecond) {
  return ratePerSecond * 3600;
}

// scaling — تدرّج قوة المبنى
export function levelScaling(baseValue, level, growthRate = 1.15) {
  return Math.floor(baseValue * Math.pow(growthRate, level - 1));
}

// اختيار رقم عشوائي بين min/max
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
