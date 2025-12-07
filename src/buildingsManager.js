// src/buildingsManager.js
// منطق مباني: إنتاج، فحص انتهاء الترقية/البناء، إضافة/نقل (دوال صافية لا تعدل الحالة مباشرة)

import BUILDINGS from "./BuildingData";
import * as TimeUtils from "./TimeUtils";

/**
 * buildingsManager.processProduction:
 *   - يتلقى timeElapsed بالثواني (seconds)
 *   - levelData.production قد يكون إما:
 *       a) { rate: number, type: "Cobalt" }  (legacy)
 *       b) { Cobalt: ratePerSecond, Elixir: ratePerSecond, ... } (current)
 */
const buildingsManager = {
  processProduction(buildings = [], resources = {}, timeElapsedSeconds = 0) {
    const updatedResources = { ...resources };
    const productionUpdates = {};

    if (!Array.isArray(buildings) || timeElapsedSeconds <= 0) {
      return { updatedResources, productionUpdates };
    }

    buildings.forEach((b) => {
      // لا تنتج إذا المبنى قيد الترقية أو البِناء
      if (!b) return;
      if (b.isUpgrading || b.isBuilding) return;

      const def = BUILDINGS[b.type];
      if (!def) return;
      const level = b.level || 1;
      const levelData = def.levels && def.levels[level];
      if (!levelData || !levelData.production) return;

      const prod = levelData.production;

      // صيغة legacy: { rate: number, type: "Cobalt" }
      if (prod.rate && prod.type) {
        const amount = prod.rate * timeElapsedSeconds;
        updatedResources[prod.type] = (updatedResources[prod.type] || 0) + amount;
        productionUpdates[prod.type] = (productionUpdates[prod.type] || 0) + amount;
        return;
      }

      // صيغة جديدة: { Cobalt: ratePerSecond, Elixir: ratePerSecond, ... }
      Object.keys(prod).forEach((resKey) => {
        const ratePerSec = prod[resKey] || 0;
        if (ratePerSec <= 0) return;
        const amount = ratePerSec * timeElapsedSeconds;
        updatedResources[resKey] = (updatedResources[resKey] || 0) + amount;
        productionUpdates[resKey] = (productionUpdates[resKey] || 0) + amount;
      });
    });

    return { updatedResources, productionUpdates };
  },

  // تحقق انتهاء عمليات البناء/ترقية منفرد (يُستخدم إن لزم)
  applyFinishedUpgradesAndBuilds(gameState) {
    const now = TimeUtils.now();
    let changed = false;
    const newBuildings = (gameState.buildings || []).map((b) => {
      let nb = b;
      if (b.isUpgrading && b.upgradeFinishTime && b.upgradeFinishTime <= now) {
        nb = { ...nb, isUpgrading: false, upgradeFinishTime: null, level: (b.level || 1) + 1 };
        changed = true;
      }
      if (b.isBuilding && b.buildFinishTime && b.buildFinishTime <= now) {
        nb = { ...nb, isBuilding: false, buildFinishTime: null };
        changed = true;
      }
      return nb;
    });
    return { changed, newBuildings };
  },

  // غرّد: وظائف مساعدة لصافية أعلاه
};

export default buildingsManager;
