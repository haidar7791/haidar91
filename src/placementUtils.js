// src/placementUtils.js
// أدوات مساعدة لتحديد مواقع المباني والتحقق من صلاحيتها على شبكة الخريطة.
import { isOverlappingAny } from "./collisionUtils";

// -----------------------------------------------------------
// ✅ محسّن: إيجاد أول مكان فارغ ذكي (بحث من المنتصف)
// -----------------------------------------------------------
export function findFreePlacement(buildings, size, mapWidth, mapHeight) {
  // ✅ بدء البحث من منتصف الخريطة (أفضل للمظهر)
  const startY = Math.floor((mapHeight - size) / 2);
  const startX = Math.floor((mapWidth - size) / 2);
  
  // ✅ البحث بشكل حلزوني من المنتصف
  let radius = 0;
  const maxRadius = Math.max(mapWidth, mapHeight);
  
  while (radius <= maxRadius) {
    // ✅ البحث في المحيط الحالي
    for (let direction = 0; direction < 4; direction++) {
      for (let step = 0; step <= radius * 2; step++) {
        let x = startX;
        let y = startY;
        
        // ✅ حساب الإحداثيات بناء على الاتجاه
        switch (direction) {
          case 0: // يمين
            x = startX + radius;
            y = startY - radius + step;
            break;
          case 1: // أسفل
            x = startX + radius - step;
            y = startY + radius;
            break;
          case 2: // يسار
            x = startX - radius;
            y = startY + radius - step;
            break;
          case 3: // أعلى
            x = startX - radius + step;
            y = startY - radius;
            break;
        }
        
        // ✅ التحقق من حدود الخريطة
        if (x >= 0 && x + size <= mapWidth && 
            y >= 0 && y + size <= mapHeight) {
          
          const testBuilding = { x, y, size };
          if (!isOverlappingAny(buildings, testBuilding)) {
            return { x, y };
          }
        }
      }
    }
    radius++;
  }
  
  // ✅ إذا لم يجد مكاناً في البحث الحلزوني، يبحث بالطريقة التقليدية
  for (let y = 0; y < mapHeight - size; y++) {
    for (let x = 0; x < mapWidth - size; x++) {
      const testBuilding = { x, y, size };
      if (!isOverlappingAny(buildings, testBuilding)) {
        return { x, y };
      }
    }
  }
  return null; // لا يوجد مكان متاح
}

// -----------------------------------------------------------
// ✅ محسّن: فحص صلاحية الموقع مع إضافة التلميحات
// -----------------------------------------------------------
export function isValidPlacement(buildings, building, mapWidth, mapHeight) {
  // التحقق من الحدود
  if (
    building.x < 0 ||
    building.y < 0 ||
    building.x + (building.size || 1) > mapWidth ||
    building.y + (building.size || 1) > mapHeight
  ) {
    return { valid: false, reason: "خارج حدود الخريطة" };
  }

  // ✅ التحقق من التداخل مع مباني أخرى
  const others = buildings.filter(b => b.id !== building.id);
  const overlapResult = isOverlappingAny(others, building);
  
  if (overlapResult.overlap) {
    return { 
      valid: false, 
      reason: "يتداخل مع مبنى آخر",
      conflictingBuilding: overlapResult.conflictingBuilding 
    };
  }

  // ✅ فحص المسافات الدنيا (اختياري)
  const minDistance = 1; // مسافة مربع واحد على الأقل
  for (const other of others) {
    const distanceX = Math.abs(building.x - other.x);
    const distanceY = Math.abs(building.y - other.y);
    const otherSize = other.size || 1;
    
    if (distanceX < minDistance && distanceY < minDistance) {
      return { 
        valid: false, 
        reason: "قريب جداً من مبنى آخر" 
      };
    }
  }

  return { valid: true, reason: "الموقع صالح" };
}

// -----------------------------------------------------------
// ✅ دالة مساعدة جديدة: اقتراح أفضل موقع
// -----------------------------------------------------------
export function suggestBestPlacement(buildings, size, mapWidth, mapHeight) {
  // ✅ 1. أولاً حاول العثور على مكان بالقرب من مباني مشابهة
  const similarBuildings = buildings.filter(b => (b.size || 1) === size);
  if (similarBuildings.length > 0) {
    // حاول وضع المبنى بجانب آخر مبنى مشابه
    const lastSimilar = similarBuildings[similarBuildings.length - 1];
    
    // ✅ مواقع مجاورة مقترحة (يمين، أسفل، يسار، أعلى)
    const nearbySpots = [
      { x: lastSimilar.x + size + 1, y: lastSimilar.y }, // يمين
      { x: lastSimilar.x, y: lastSimilar.y + size + 1 }, // أسفل
      { x: lastSimilar.x - size - 1, y: lastSimilar.y }, // يسار
      { x: lastSimilar.x, y: lastSimilar.y - size - 1 }, // أعلى
    ];
    
    for (const spot of nearbySpots) {
      if (spot.x >= 0 && spot.x + size <= mapWidth &&
          spot.y >= 0 && spot.y + size <= mapHeight) {
        const testBuilding = { x: spot.x, y: spot.y, size };
        if (!isOverlappingAny(buildings, testBuilding).overlap) {
          return spot;
        }
      }
    }
  }
  
  // ✅ 2. إذا لم ينجح، استخدم البحث الحلزوني الذكي
  return findFreePlacement(buildings, size, mapWidth, mapHeight);
}

// -----------------------------------------------------------
// ✅ دالة جديدة: التحقق من منطقة فارغة بالحجم المطلوب
// -----------------------------------------------------------
export function findEmptyArea(buildings, width, height, mapWidth, mapHeight) {
  for (let y = 0; y <= mapHeight - height; y++) {
    for (let x = 0; x <= mapWidth - width; x++) {
      let areaFree = true;
      
      // ✅ فحص كل موقع في المنطقة
      for (let checkY = y; checkY < y + height; checkY++) {
        for (let checkX = x; checkX < x + width; checkX++) {
          const buildingAtSpot = findBuildingAtGrid(buildings, checkX, checkY);
          if (buildingAtSpot) {
            areaFree = false;
            break;
          }
        }
        if (!areaFree) break;
      }
      
      if (areaFree) {
        return { x, y };
      }
    }
  }
  return null;
}

// -----------------------------------------------------------
// البحث عن مبنى في إحداثيات شبكة معينة
// -----------------------------------------------------------
export function findBuildingAtGrid(buildings, x, y) {
  return buildings.find(building => {
    const buildingSize = building.size || 1;
    const isInXBounds = x >= building.x && x < building.x + buildingSize;
    const isInYBounds = y >= building.y && y < building.y + buildingSize;
    return isInXBounds && isInYBounds;
  });
}

// -----------------------------------------------------------
// ✅ دالة جديدة: تنسيق الموقع إلى أقرب شبكة
// -----------------------------------------------------------
export function snapToGrid(x, y, tileSize = 1) {
  return {
    x: Math.round(x / tileSize) * tileSize,
    y: Math.round(y / tileSize) * tileSize
  };
}

// -----------------------------------------------------------
// ✅ دالة جديدة: الحصول على مواقع شبكة محيطة فارغة
// -----------------------------------------------------------
export function getAdjacentEmptySpots(buildings, building, mapWidth, mapHeight) {
  const spots = [];
  const size = building.size || 1;
  
  // ✅ المواضع المحيطة (8 اتجاهات)
  const directions = [
    { dx: size, dy: 0 },        // يمين
    { dx: size, dy: size },     // يمين-أسفل
    { dx: 0, dy: size },        // أسفل
    { dx: -size, dy: size },    // يسار-أسفل
    { dx: -size, dy: 0 },       // يسار
    { dx: -size, dy: -size },   // يسار-أعلى
    { dx: 0, dy: -size },       // أعلى
    { dx: size, dy: -size }     // يمين-أعلى
  ];
  
  for (const dir of directions) {
    const spotX = building.x + dir.dx;
    const spotY = building.y + dir.dy;
    
    if (spotX >= 0 && spotX + size <= mapWidth &&
        spotY >= 0 && spotY + size <= mapHeight) {
      
      const testBuilding = { x: spotX, y: spotY, size };
      if (!isOverlappingAny(buildings, testBuilding).overlap) {
        spots.push({ x: spotX, y: spotY });
      }
    }
  }
  
  return spots;
}

// -----------------------------------------------------------
// ✅ دالة جديدة: ترتيب المباني تلقائياً
// -----------------------------------------------------------
export function autoArrangeBuildings(buildings, mapWidth, mapHeight) {
  const sortedBuildings = [...buildings]
    .sort((a, b) => {
      // ✅ ترتيب حسب النوع ثم الحجم
      const sizeA = a.size || 1;
      const sizeB = b.size || 1;
      if (sizeA !== sizeB) return sizeB - sizeA; // المباني الكبيرة أولاً
      return (a.type || '').localeCompare(b.type || '');
    });
  
  const newPositions = [];
  const placedBuildings = [];
  
  for (const building of sortedBuildings) {
    const size = building.size || 1;
    const newSpot = suggestBestPlacement(placedBuildings, size, mapWidth, mapHeight);
    
    if (newSpot) {
      newPositions.push({
        id: building.id,
        x: newSpot.x,
        y: newSpot.y
      });
      placedBuildings.push({
        ...building,
        x: newSpot.x,
        y: newSpot.y
      });
    } else {
      // إذا لم يجد مكاناً، يبقى في مكانه
      newPositions.push({
        id: building.id,
        x: building.x,
        y: building.y
      });
      placedBuildings.push(building);
    }
  }
  
  return newPositions;
}
