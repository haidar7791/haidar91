// src/utils/GridUtils.js
// دوال مساعدة لإدارة الشبكة/الخريطة في اللعبة

/**
 * إنشاء مصفوفة ثنائية الأبعاد تمثل خريطة اللعبة
 * @param {number} rows - عدد الصفوف
 * @param {number} cols - عدد الأعمدة
 * @param {any} initialValue - القيمة الابتدائية لكل خانة
 * @returns {Array}
 */
export function createGrid(rows, cols, initialValue = null) {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => initialValue));
}

/**
 * التحقق إذا كانت الخانة فارغة
 * @param {Array} grid - خريطة اللعبة
 * @param {number} x - إحداثي العمود
 * @param {number} y - إحداثي الصف
 * @returns {boolean}
 */
export function isCellEmpty(grid, x, y) {
  return grid[y] && grid[y][x] === null;
}

/**
 * وضع قيمة في الخريطة
 * @param {Array} grid
 * @param {number} x
 * @param {number} y
 * @param {any} value
 */
export function setCell(grid, x, y, value) {
  if (grid[y] && typeof grid[y][x] !== 'undefined') {
    grid[y][x] = value;
  }
}

/**
 * إزالة قيمة من الخريطة
 * @param {Array} grid
 * @param {number} x
 * @param {number} y
 */
export function clearCell(grid, x, y) {
  setCell(grid, x, y, null);
}
