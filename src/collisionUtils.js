// src/collisionUtils.js

/**
 * يحول موقع بالبلاط ("grid position") إلى مستطيل حقيقي على الخريطة
 */
export function getBuildingRect(building) {
  return {
    x: building.x || 0,
    y: building.y || 0,
    width: building.size || 1,
    height: building.size || 1,
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
    building.x + (building.size || 1) <= mapWidth &&
    building.y + (building.size || 1) <= mapHeight
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

// ============================================
// ✅ الدوال الجديدة والمفقودة
// ============================================

/**
 * ✅ الدالة المفقودة: التحقق من التداخل مع أي مبنى
 * @param {Array} buildings - قائمة المباني
 * @param {Object} testBuilding - المبنى المختبر
 * @returns {Object} نتيجة تحتوي على حالة التداخل والمبنى المتداخل
 */
export function isOverlappingAny(buildings, testBuilding) {
  if (!buildings || !Array.isArray(buildings)) {
    return { overlap: false, conflictingBuilding: null };
  }
  
  const testRect = getBuildingRect(testBuilding);
  
  for (const building of buildings) {
    // ✅ تجنب المقارنة مع نفس المبنى (إذا كان له ID)
    if (testBuilding.id && building.id === testBuilding.id) {
      continue;
    }
    
    const buildingRect = getBuildingRect(building);
    
    if (isRectOverlap(testRect, buildingRect)) {
      return { 
        overlap: true, 
        conflictingBuilding: building,
        message: `يتداخل مع ${building.type || 'مبنى'} في (${building.x},${building.y})`
      };
    }
  }
  
  return { overlap: false, conflictingBuilding: null };
}

/**
 * ✅ دالة جديدة: الحصول على المباني المتداخلة
 */
export function getOverlappingBuildings(buildings, testBuilding) {
  const overlapping = [];
  const testRect = getBuildingRect(testBuilding);
  
  for (const building of buildings) {
    if (testBuilding.id && building.id === testBuilding.id) {
      continue;
    }
    
    const buildingRect = getBuildingRect(building);
    if (isRectOverlap(testRect, buildingRect)) {
      overlapping.push(building);
    }
  }
  
  return overlapping;
}

/**
 * ✅ دالة جديدة: إيجاد أقرب موقع صالح
 */
export function findNearestValidPosition(building, otherBuildings, mapWidth, mapHeight) {
  const size = building.size || 1;
  const maxAttempts = 100;
  
  // ✅ بحث حلزوني من الموقع الحالي
  for (let radius = 1; radius <= 5; radius++) {
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (Math.abs(dx) === radius || Math.abs(dy) === radius) {
          const newX = building.x + dx;
          const newY = building.y + dy;
          
          if (newX >= 0 && newX + size <= mapWidth &&
              newY >= 0 && newY + size <= mapHeight) {
            
            const testBuilding = { ...building, x: newX, y: newY };
            
            if (canPlaceBuildingAt(testBuilding, otherBuildings)) {
              return { x: newX, y: newY, distance: Math.abs(dx) + Math.abs(dy) };
            }
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * ✅ دالة جديدة: حساب المسافة بين مبنيين
 */
export function getDistanceBetween(buildingA, buildingB) {
  const centerA = {
    x: buildingA.x + (buildingA.size || 1) / 2,
    y: buildingA.y + (buildingA.size || 1) / 2
  };
  
  const centerB = {
    x: buildingB.x + (buildingB.size || 1) / 2,
    y: buildingB.y + (buildingB.size || 1) / 2
  };
  
  return Math.sqrt(
    Math.pow(centerB.x - centerA.x, 2) + 
    Math.pow(centerB.y - centerA.y, 2)
  );
}

/**
 * ✅ دالة جديدة: التحقق من وجود مساحة كافية حول المبنى
 */
export function hasEnoughSpace(building, otherBuildings, minDistance = 2) {
  for (const other of otherBuildings) {
    if (other.id === building.id) continue;
    
    const distance = getDistanceBetween(building, other);
    if (distance < minDistance) {
      return false;
    }
  }
  
  return true;
}
