// src/buildingsManager.js
// نسخة معدلة للتكامل مع useGameLogic.js و BuildingData.js

import BUILDINGS from "./BuildingData";

/**
 * buildingsManager - دالة صافية (pure) لإدارة المباني
 * تم تعديلها لتناسب النظام الحالي في useGameLogic.js
 */

const buildingsManager = {
  /**
   * processProduction - حساب الإنتاج بناءً على المباني العاملة
   * 
   * ملاحظة: بناءً على BuildingData.js، جميع المباني تستخدم الصيغة الجديدة فقط:
   * { Cobalt: ratePerSecond, Elixir: ratePerSecond, ... }
   * 
   * @param {Array} buildings - قائمة المباني
   * @param {Object} resources - الموارد الحالية
   * @param {number} timeElapsedSeconds - الوقت المنقضي بالثواني
   * @param {Object} storageCapacity - السعة التخزينية (اختياري)
   * @returns {Object} { updatedResources, productionUpdates }
   */
  processProduction(buildings = [], resources = {}, timeElapsedSeconds = 0, storageCapacity = null) {
    // التحقق من صحة المدخلات
    if (!Array.isArray(buildings) || 
        typeof resources !== 'object' || 
        resources === null ||
        !Number.isFinite(timeElapsedSeconds) || 
        timeElapsedSeconds <= 0) {
      return { 
        updatedResources: { ...resources }, 
        productionUpdates: {} 
      };
    }

    const updatedResources = { ...resources };
    const productionUpdates = {};

    for (const b of buildings) {
      // لا تنتج إذا المبنى قيد الترقية أو البناء أو غير موجود
      if (!b || b.isUpgrading || b.isBuilding) continue;

      const def = BUILDINGS[b.type];
      if (!def) continue;

      const level = Math.max(1, b.level || 1);
      const levelData = def.levels && def.levels[level];
      if (!levelData || !levelData.production) continue;

      const prod = levelData.production;
      
      // ✅ الصيغة الوحيدة المستخدمة في BuildingData.js:
      // { Cobalt: ratePerSecond, Elixir: ratePerSecond, ... }
      Object.keys(prod).forEach((resKey) => {
        const ratePerSec = prod[resKey] || 0;
        if (ratePerSec <= 0) return;
        
        const amount = ratePerSec * timeElapsedSeconds;
        
        // ✅ إضافة الإنتاج
        updatedResources[resKey] = (updatedResources[resKey] || 0) + amount;
        productionUpdates[resKey] = (productionUpdates[resKey] || 0) + amount;
        
        // ✅ تطبيق حدود السعة التخزينية إذا وُجدت
        if (storageCapacity && storageCapacity[resKey] !== undefined) {
          updatedResources[resKey] = Math.min(
            updatedResources[resKey], 
            storageCapacity[resKey]
          );
        }
      });
    }

    return { updatedResources, productionUpdates };
  },

  /**
   * calculateStorageCapacity - حساب السعة التخزينية من المباني
   * 
   * @param {Array} buildings - قائمة المباني
   * @returns {Object} سعة كل مورد
   */
  calculateStorageCapacity(buildings = []) {
    const capacity = {};
    
    for (const b of buildings) {
      if (!b || b.isBuilding || b.isUpgrading) continue;
      
      const def = BUILDINGS[b.type];
      if (!def) continue;
      
      const level = Math.max(1, b.level || 1);
      const levelData = def.levels && def.levels[level];
      if (!levelData || !levelData.storage) continue;
      
      // جمع سعة كل مورد
      Object.keys(levelData.storage).forEach((resKey) => {
        const storageAmount = levelData.storage[resKey] || 0;
        capacity[resKey] = (capacity[resKey] || 0) + storageAmount;
      });
    }
    
    return capacity;
  },

  /**
   * calculateMaxBuilders - حساب عدد البنائين من كواخ البناء
   * 
   * @param {Array} buildings - قائمة المباني
   * @returns {number} عدد البنائين
   */
  calculateMaxBuilders(buildings = []) {
    let total = 1; // واحد افتراضي
    
    for (const b of buildings) {
      if (!b || b.type !== "Builder_Hut") continue;
      
      const level = Math.max(1, b.level || 1);
      const levelData = BUILDINGS.Builder_Hut?.levels?.[level];
      if (levelData && levelData.addsBuilder) {
        total += Number(levelData.addsBuilder) || 0;
      }
    }
    
    return Math.max(1, total);
  },

  /**
   * calculateBusyBuilders - حساب البنائين المشغولين
   * 
   * @param {Array} buildings - قائمة المباني
   * @returns {number} عدد البنائين المشغولين
   */
  calculateBusyBuilders(buildings = []) {
    return buildings.filter(b => 
      b && (b.isBuilding || b.isUpgrading)
    ).length;
  },

  /**
   * applyFinishedUpgradesAndBuilds - تطبيق الترقيات والبناء المنتهية
   * 
   * ✅ تم تحديثها لتكون متوافقة مع useGameLogic.js
   * 
   * @param {Object} gameState - حالة اللعبة الحالية
   * @param {Function} onBuilderChange - callback لتحديث البنائين
   * @returns {Object} { changed, newBuildings, builderUpdates }
   */
  applyFinishedUpgradesAndBuilds(gameState, onBuilderChange = null) {
    const now = Date.now();
    let changed = false;
    
    // تحديث البنائين
    let totalBuilders = gameState.totalBuilders || 
                       this.calculateMaxBuilders(gameState.buildings);
    let availableBuilders = gameState.availableBuilders || 
                           Math.max(0, totalBuilders - this.calculateBusyBuilders(gameState.buildings));
    
    const newBuildings = (gameState.buildings || []).map((b) => {
      let updates = {};
      let changedThis = false;
      
      // ✅ إنهاء الترقية
      if (b.isUpgrading && 
          typeof b.upgradeFinishTime === 'number' && 
          b.upgradeFinishTime <= now) {
        const nextLevel = (b.level || 1) + 1;
        const buildingDef = BUILDINGS[b.type];
        const maxLevel = buildingDef?.maxLevel || 1;
        
        // التحقق من عدم تجاوز الحد الأقصى
        if (nextLevel <= maxLevel) {
          updates.level = nextLevel;
          updates.isUpgrading = false;
          updates.upgradeFinishTime = null;
          changedThis = true;
          
          // ✅ تحرير بنّاء
          availableBuilders = Math.min(totalBuilders, availableBuilders + 1);
          
          // ✅ إذا كان المبنى يضيف بنّاءً عند الترقية
          const levelData = buildingDef?.levels?.[nextLevel];
          if (levelData && levelData.addsBuilder) {
            const adds = Number(levelData.addsBuilder) || 0;
            if (adds > 0) {
              totalBuilders += adds;
              availableBuilders += adds;
            }
          }
        }
      }
      
      // ✅ إنهاء البناء
      if (b.isBuilding && 
          typeof b.buildFinishTime === 'number' && 
          b.buildFinishTime <= now) {
        updates.isBuilding = false;
        updates.buildFinishTime = null;
        changedThis = true;
        
        // ✅ تحرير بنّاء
        availableBuilders = Math.min(totalBuilders, availableBuilders + 1);
        
        // ✅ إذا كان كوخ بناء يضيف بنّاءً
        if (b.type === "Builder_Hut") {
          const levelData = BUILDINGS.Builder_Hut?.levels?.[b.level || 1];
          if (levelData && levelData.addsBuilder) {
            const adds = Number(levelData.addsBuilder) || 0;
            if (adds > 0) {
              totalBuilders += adds;
              availableBuilders += adds;
            }
          }
        }
      }
      
      if (changedThis) {
        changed = true;
        return { ...b, ...updates };
      }
      
      return b;
    });
    
    // تحديث callback البنائين إذا وُجد
    if (changed && onBuilderChange) {
      onBuilderChange(totalBuilders, availableBuilders);
    }
    
    return { 
      changed, 
      newBuildings,
      builderUpdates: { totalBuilders, availableBuilders }
    };
  },

  /**
   * getBuildingCost - الحصول على تكلفة بناء/ترقية مبنى
   * 
   * @param {string} buildingType - نوع المبنى
   * @param {number} level - المستوى المطلوب
   * @returns {Object|null} التكلفة
   */
  getBuildingCost(buildingType, level = 1) {
    const building = BUILDINGS[buildingType];
    if (!building) return null;
    
    const levelData = building.levels && building.levels[level];
    if (!levelData) return null;
    
    return levelData.cost || null;
  },

  /**
   * getBuildingTime - الحصول على وقت بناء/ترقية مبنى
   * 
   * @param {string} buildingType - نوع المبنى
   * @param {number} level - المستوى المطلوب
   * @returns {number} الوقت بالثواني
   */
  getBuildingTime(buildingType, level = 1) {
    const building = BUILDINGS[buildingType];
    if (!building) return 30;
    
    const levelData = building.levels && building.levels[level];
    if (!levelData) return 30;
    
    return levelData.buildTime || 30;
  },

  /**
   * canAfford - التحقق من إمكانية تحمل التكلفة
   * 
   * @param {Object} resources - الموارد الحالية
   * @param {Object} cost - التكلفة المطلوبة
   * @returns {boolean} هل يمكن تحمل التكلفة؟
   */
  canAfford(resources = {}, cost = {}) {
    if (!cost || typeof cost !== 'object') return false;
    
    return Object.entries(cost).every(([resource, amount]) => {
      return (resources[resource] || 0) >= amount;
    });
  },

  /**
   * deductCost - خصم التكلفة من الموارد
   * 
   * @param {Object} resources - الموارد الحالية
   * @param {Object} cost - التكلفة المطلوبة
   * @returns {Object} الموارد بعد الخصم
   */
  deductCost(resources = {}, cost = {}) {
    const updated = { ...resources };
    
    if (!cost || typeof cost !== 'object') return updated;
    
    Object.entries(cost).forEach(([resource, amount]) => {
      updated[resource] = Math.max(0, (updated[resource] || 0) - amount);
    });
    
    return updated;
  }
};

export default buildingsManager;
