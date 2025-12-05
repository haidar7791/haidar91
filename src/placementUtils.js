// src/placementUtils.js
// أدوات مساعدة لتحديد مواقع المباني والتحقق من صلاحيتها على شبكة الخريطة.
import { isOverlappingAny } from "./collisionUtils";

// -----------------------------------------------------------
// محاولة إيجاد مكان فارغ لمبنى جديد
// mapWidth, mapHeight = حجم الخريطة بالمربعات
// -----------------------------------------------------------
export function findFreePlacement(buildings, size, mapWidth, mapHeight) {
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
// فحص إذا كان الموقع صالح لوضع مبنى (للسحب والموقع الجديد)
// -----------------------------------------------------------
export function isValidPlacement(buildings, building, mapWidth, mapHeight) {
  // خارج الحدود
  if (
    building.x < 0 ||
    building.y < 0 ||
    building.x + building.size > mapWidth ||
    building.y + building.size > mapHeight
  ) {
    return false;
  }

  // تداخل مع مبنى آخر
  // يتم استثناء المبنى نفسه من قائمة المباني الأخرى عند التحقق من التداخل
  const others = buildings.filter(b => b.id !== building.id);
  return !isOverlappingAny(others, building);
}

// -----------------------------------------------------------
// 🛑🛑🛑 الدالة المفقودة التي تسببت في الخطأ 🛑🛑🛑
// البحث عن مبنى في إحداثيات شبكة معينة
// -----------------------------------------------------------
/**
 * تبحث عن المبنى الذي يقع في إحداثيات شبكة (x, y) المحددة.
 * @param {Array<object>} buildings - قائمة المباني.
 * @param {number} x - إحداثي X للشبكة.
 * @param {number} y - إحداثي Y للشبكة.
 * @returns {object | undefined} المبنى الموجود في الموقع أو 'undefined'.
 */
export function findBuildingAtGrid(buildings, x, y) {
  return buildings.find(building => {
    // المبنى يغطي مساحة تبدأ من (building.x, building.y)
    // وتمتد لمساحة (building.size x building.size)
    
    // التحقق مما إذا كانت الإحداثيات (x, y) تقع ضمن حدود المبنى
    const isInXBounds = x >= building.x && x < building.x + (building.size || 1);
    const isInYBounds = y >= building.y && y < building.y + (building.size || 1);
    
    return isInXBounds && isInYBounds;
  });
}
