// utils/GridUtils.js

// التحقق من أن الإحداثي داخل حدود الخريطة
export function inBounds(x, y, gridSize) {
  return x >= 0 && y >= 0 && x < gridSize && y < gridSize;
}

// التأكد أن البلاطة غير مشغولة
export function isTileEmpty(grid, x, y) {
  return grid[y][x] === null;
}

// وضع مبنى في الخريطة
export function placeBuilding(grid, x, y, buildingName) {
  if (!inBounds(x, y, grid.length)) return false;
  if (!isTileEmpty(grid, x, y)) return false;

  grid[y][x] = buildingName;
  return true;
}

// إزالة مبنى
export function removeBuilding(grid, x, y) {
  if (!inBounds(x, y, grid.length)) return false;
  grid[y][x] = null;
  return true;
}
