// Building.js
// كلاس لتمثيل هيكل بيانات المبنى في حالة اللعبة (gameState).

// 🛑🛑🛑 الاستيراد من ملف الإدارة المركزي 🛑🛑🛑
import BUILDINGS from "./BuildingData";

export default class Building {
  constructor(id, type, level, x, y) {
    this.id = id; 
    this.type = type;
    this.level = level;
    this.x = x; // إحداثي X في الشبكة
    this.y = y; // إحداثي Y في الشبكة
    
    // حالة الإنتاج
    this.lastCollectTime = Date.now();
    this.currentProduction = 0; // الموارد المتراكمة
    
    // حالة الترقية
    this.isUpgrading = false;
    this.upgradeStartTime = null;
    this.upgradeFinishTime = null;
    
    // الحجم (لتسهيل الوصول)
    const data = BUILDINGS[type];
    this.width = data ? data.size.w : 1;
    this.height = data ? data.size.h : 1;
  }
}
