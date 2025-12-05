// utils/collisionUtils.js

/**
 * يحول موقع بالبلاط ("grid position") إلى مستطيل حقيقي على الخريطة
 */
export function getBuildingRect(building) {
  return {
    x: building.x,
    y: building.y,
    width: building.size,
    height: building.size,
  };
}

/**
 * يتحقق من وجود تداخل بين مستطيلين
 */
export function isRectOverlap(a, b) {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

/**
 * يتحقق إن كان مبنيان يتداخلان
 */
export function isBuildingsOverlap(buildingA, buildingB) {
  const rectA = getBuildingRect(buildingA);
  const rectB = getBuildingRect(buildingB);
  return isRectOverlap(rectA, rectB);
}

/**
 * فحص إذا كان مكان جديد صالح لمبنى (بدون تداخل)
 */
export function canPlaceBuildingAt(building, otherBuildings) {
  const rectA = getBuildingRect(building);

  for (let b of otherBuildings) {
    if (b.id !== building.id) {
      const rectB = getBuildingRect(b);
      if (isRectOverlap(rectA, rectB)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * فحص حدود الخريطة
 * mapWidth & mapHeight → بالبلاط (grid)
 */
export function isInsideMap(building, mapWidth, mapHeight) {
  return (
    building.x >= 0 &&
    building.y >= 0 &&
    building.x + building.size <= mapWidth &&
    building.y + building.size <= mapHeight
  );
}

/**
 * فحص شامل للموقع:
 *   - هل داخل حدود الخريطة؟
 *   - هل بدون تداخل مع مباني أخرى؟
 */
export function isValidPlacement(building, otherBuildings, mapWidth, mapHeight) {
  if (!isInsideMap(building, mapWidth, mapHeight)) return false;
  if (!canPlaceBuildingAt(building, otherBuildings)) return false;
  return true;
}
