// src/useGameLogic.js - الإصدار المعدل
import { useState, useEffect, useCallback, useRef } from "react";
import { BUILDINGS } from "./BuildingData";
import * as gameState from "./gameState";
import BuildingClass from "./Building";
import { MAP_TILES_X, MAP_TILES_Y } from "./MapConfig";

/**
 * useGameLogic - إدارة حالة اللعبة، البنائين، المؤقتات، الإنتاج
 */

// ✅ حساب البنائين من أكواخ البناء
const ensureBuildersFromBuildings = (buildings) => {
  let total = 0;
  (buildings || []).forEach((b) => {
    if (b.type === "Builder_Hut") {
      const lev = BUILDINGS.Builder_Hut?.levels?.[b.level] || {};
      total += Number(lev.addsBuilder || 0);
    }
  });
  return Math.max(1, total);
};

// ✅ التحقق من الإمكانية المالية
const canAfford = (resources = {}, cost) => {
  if (!cost) return false;
  if (cost.type && cost.amount !== undefined) {
    return (resources[cost.type] || 0) >= cost.amount;
  }
  if (typeof cost === "object") {
    return Object.entries(cost).every(([res, amt]) => (resources[res] || 0) >= amt);
  }
  return false;
};

// ✅ خصم التكلفة
const deductCost = (resources = {}, cost) => {
  const r = { ...(resources || {}) };
  if (!cost) return r;
  if (cost.type && cost.amount !== undefined) {
    r[cost.type] = Math.max(0, (r[cost.type] || 0) - cost.amount);
  } else if (typeof cost === "object") {
    Object.entries(cost).forEach(([res, amt]) => {
      r[res] = Math.max(0, (r[res] || 0) - amt);
    });
  }
  return r;
};

// ✅ المربعات المشغولة بالمبنى
const occupiedTiles = (x, y, size) => {
  const s = Math.max(1, Math.round(size));
  const tiles = [];
  for (let ox = 0; ox < s; ox++) {
    for (let oy = 0; oy < s; oy++) {
      tiles.push([Math.floor(x) + ox, Math.floor(y) + oy]);
    }
  }
  return tiles;
};

// ✅ التحقق من التداخل
const overlapsExisting = (buildings = [], x, y, size, excludeId = null) => {
  const newTiles = occupiedTiles(x, y, size).map((t) => `${t[0]}_${t[1]}`);
  for (const b of buildings) {
    if (excludeId && b.id === excludeId) continue;
    
    const bData = BUILDINGS[b.type];
    const bSize = bData?.size || 1;
    const bTiles = occupiedTiles(b.x, b.y, bSize).map((t) => `${t[0]}_${t[1]}`);
    
    for (const t of bTiles) {
      if (newTiles.includes(t)) {
        return { overlap: true, building: b };
      }
    }
  }
  return { overlap: false, building: null };
};

// ✅ البحث عن موقع فارغ ذكي
const findEmptySpotForBuilding = (buildings, size) => {
  // أولاً: ابحث حول المباني المشابهة
  const similarBuildings = buildings.filter(b => {
    const bData = BUILDINGS[b.type];
    return bData && (bData.size || 1) === size;
  });
  
  if (similarBuildings.length > 0) {
    // ابحث حول آخر مبنى مشابه
    const lastSimilar = similarBuildings[similarBuildings.length - 1];
    
    // مواقع محيطة مقترحة
    const adjacentSpots = [
      { x: lastSimilar.x + size + 1, y: lastSimilar.y }, // يمين
      { x: lastSimilar.x, y: lastSimilar.y + size + 1 }, // أسفل
      { x: lastSimilar.x - size - 1, y: lastSimilar.y }, // يسار
      { x: lastSimilar.x, y: lastSimilar.y - size - 1 }, // أعلى
    ];
    
    for (const spot of adjacentSpots) {
      if (spot.x >= 1 && spot.x + size <= MAP_TILES_X - 1 &&
          spot.y >= 1 && spot.y + size <= MAP_TILES_Y - 1) {
        
        const overlap = overlapsExisting(buildings, spot.x, spot.y, size);
        if (!overlap.overlap) {
          return spot;
        }
      }
    }
  }
  
  // ثانياً: البحث المنظم من الأعلى لليسار
  for (let y = 1; y <= MAP_TILES_Y - size; y++) {
    for (let x = 1; x <= MAP_TILES_X - size; x++) {
      const overlap = overlapsExisting(buildings, x, y, size);
      if (!overlap.overlap) {
        // تحقق من وجود مسافة كافية من المباني الأخرى
        let hasSpace = true;
        for (const building of buildings) {
          const distanceX = Math.abs((x + size/2) - (building.x + ((BUILDINGS[building.type]?.size || 1)/2)));
          const distanceY = Math.abs((y + size/2) - (building.y + ((BUILDINGS[building.type]?.size || 1)/2)));
          
          if (distanceX < 2 && distanceY < 2) {
            hasSpace = false;
            break;
          }
        }
        
        if (hasSpace) {
          return { x, y };
        }
      }
    }
  }
  
  // أخيراً: أي مكان فارغ
  for (let y = 1; y <= MAP_TILES_Y - size; y++) {
    for (let x = 1; x <= MAP_TILES_X - size; x++) {
      const overlap = overlapsExisting(buildings, x, y, size);
      if (!overlap.overlap) {
        return { x, y };
      }
    }
  }
  
  return null;
};

const useGameLogic = (initialSavedState) => {
  const [currentGameState, setGameState] = useState(initialSavedState || gameState.getInitialState());
  const lastUpdate = useRef(Date.now());

  // ✅ تهيئة البنائين
  useEffect(() => {
    setGameState((prev) => {
      const buildings = prev.buildings || [];
      const total = prev.totalBuilders !== undefined ? prev.totalBuilders : ensureBuildersFromBuildings(buildings);
      const busy = buildings.reduce((acc, b) => acc + ((b.isBuilding || b.isUpgrading) ? 1 : 0), 0);
      const available = Math.max(0, total - busy);
      
      if (prev.totalBuilders === total && prev.availableBuilders === available) return prev;
      
      const updated = { ...prev, totalBuilders: total, availableBuilders: available };
      gameState.saveGameState(updated);
      return updated;
    });
  }, []);

  // ✅ التحديث الدوري: الإنتاج + إنهاء البناء/الترقية
  const updateGame = useCallback(() => {
    setGameState((prev) => {
      const now = Date.now();
      const dt = now - (lastUpdate.current || now);
      if (dt <= 0) {
        lastUpdate.current = now;
        return prev;
      }
      lastUpdate.current = now;

      let newResources = { ...(prev.resources || {}) };
      let buildings = (prev.buildings || []).map((b) => ({ ...b }));

      // ✅ الإنتاج: للمباني غير قيد البناء/الترقية
      for (const b of buildings) {
        if (b.isBuilding || b.isUpgrading) continue;
        
        const bData = BUILDINGS[b.type];
        const levInfo = bData?.levels?.[b.level] || {};
        const production = levInfo.production || {};
        
        for (const [res, rate] of Object.entries(production)) {
          if (rate > 0) {
            const gain = (rate * dt) / 1000;
            newResources[res] = Math.floor((newResources[res] || 0) + gain);
            
            // عدم تجاوز السعة
            if (prev.storageCapacity && prev.storageCapacity[res]) {
              newResources[res] = Math.min(newResources[res], prev.storageCapacity[res]);
            }
          }
        }
      }

      // ✅ إنهاء البناء/الترقية
      let changed = false;
      let totalBuilders = prev.totalBuilders ?? ensureBuildersFromBuildings(buildings);
      let busyCount = buildings.reduce((acc, b) => acc + ((b.isBuilding || b.isUpgrading) ? 1 : 0), 0);
      let availableBuilders = prev.availableBuilders !== undefined ? prev.availableBuilders : Math.max(0, totalBuilders - busyCount);

      buildings = buildings.map((b) => {
        const out = { ...b };

        // ✅ إنهاء الترقية
        if (out.isUpgrading && out.upgradeFinishTime !== null && out.upgradeFinishTime <= now) {
          out.level = (out.level || 1) + 1;
          out.isUpgrading = false;
          out.upgradeFinishTime = null;

          availableBuilders = Math.min(totalBuilders, availableBuilders + 1);
          changed = true;

          // إذا أضاف المستوى بنائين
          const levelInfo = BUILDINGS[out.type]?.levels?.[out.level];
          if (levelInfo && levelInfo.addsBuilder) {
            const adds = Number(levelInfo.addsBuilder) || 0;
            if (adds > 0) {
              totalBuilders += adds;
              availableBuilders += adds;
            }
          }
        }

        // ✅ إنهاء البناء
        if (out.isBuilding && out.buildFinishTime !== null && out.buildFinishTime <= now) {
          out.isBuilding = false;
          out.buildFinishTime = null;

          availableBuilders = Math.min(totalBuilders, availableBuilders + 1);
          changed = true;

          // إذا كان كوخ بناء
          if (out.type === "Builder_Hut") {
            const levelInfo = BUILDINGS.Builder_Hut?.levels?.[out.level];
            if (levelInfo && levelInfo.addsBuilder) {
              const adds = Number(levelInfo.addsBuilder) || 0;
              if (adds > 0) {
                totalBuilders += adds;
                availableBuilders += adds;
              }
            }
          }
        }

        return out;
      });

      const newState = {
        ...prev,
        resources: newResources,
        buildings,
        totalBuilders,
        availableBuilders,
        lastUpdateTime: now,
      };

      if (changed || dt > 300000) {
        gameState.saveGameState(newState);
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(updateGame, 1000);
    return () => clearInterval(id);
  }, [updateGame]);

  // ✅ إضافة مبنى جديد - مع موقع تلقائي
  const addBuilding = useCallback((type, customX = null, customY = null) => {
    const buildingData = BUILDINGS[type];
    if (!buildingData) {
      console.error(`[addBuilding] نوع غير معروف: ${type}`);
      return { success: false, error: "نوع المبنى غير معروف" };
    }
    
    setGameState((prev) => {
      const nextLevel = 1;
      const lvlInfo = buildingData.levels?.[nextLevel] || {};
      const cost = lvlInfo.cost || null;
      const size = buildingData.size || 1;

      // ✅ التحقق من الإمكانية المالية
      if (!canAfford(prev.resources || {}, cost)) {
        console.warn("[addBuilding] لا تكفي الموارد");
        return prev;
      }

      let x, y;
      
      // ✅ إذا تم تحديد موقع مخصص
      if (customX !== null && customY !== null) {
        x = customX;
        y = customY;
        
        // التحقق من التداخل في الموقع المخصص
        const overlap = overlapsExisting(prev.buildings || [], x, y, size);
        if (overlap.overlap) {
          console.warn("[addBuilding] الموقع مشغول بالفعل");
          return prev;
        }
      } else {
        // ✅ البحث عن موقع فارغ تلقائياً
        const spot = findEmptySpotForBuilding(prev.buildings || [], size);
        if (!spot) {
          console.warn("[addBuilding] لا توجد أماكن فارغة");
          return prev;
        }
        x = spot.x;
        y = spot.y;
      }

      // ✅ التحقق من البنائين المتاحين
      const buildSec = lvlInfo.buildTime || 0;
      const buildMs = Math.max(0, buildSec * 1000);
      
      let totalBuilders = prev.totalBuilders ?? ensureBuildersFromBuildings(prev.buildings || []);
      let busyCount = (prev.buildings || []).filter((b) => b.isBuilding || b.isUpgrading).length;
      let availableBuilders = prev.availableBuilders !== undefined ? prev.availableBuilders : Math.max(0, totalBuilders - busyCount);
      
      if (buildMs > 0 && availableBuilders <= 0) {
        console.warn("[addBuilding] جميع البنائين مشغولون!");
        return prev;
      }

      // ✅ خصم الموارد
      const newResources = deductCost(prev.resources || {}, cost);

      // ✅ إنشاء المبنى الجديد
      const id = `b_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
      const newB = new BuildingClass(id, type, nextLevel, x, y);

      if (buildMs > 0) {
        newB.isBuilding = true;
        newB.buildFinishTime = Date.now() + buildMs;
        availableBuilders = Math.max(0, availableBuilders - 1);
      } else {
        // تأثير فوري (مثل كوخ البناء)
        if (lvlInfo.addsBuilder) {
          const adds = Number(lvlInfo.addsBuilder) || 0;
          if (adds > 0) {
            totalBuilders += adds;
            availableBuilders += adds;
          }
        }
      }

      // ✅ تحديد حجم المبنى
      newB.size = size;

      const newState = {
        ...prev,
        resources: newResources,
        buildings: [...(prev.buildings || []), newB],
        totalBuilders,
        availableBuilders,
      };

      gameState.saveGameState(newState);
      console.log(`✅ تم إضافة ${buildingData.name_ar} في (${x}, ${y})`);
      return newState;
    });
  }, []);

  // ✅ بدء الترقية
  const startUpgrade = useCallback((buildingId, durationMs, cost) => {
    setGameState((prev) => {
      const idx = (prev.buildings || []).findIndex((b) => b.id === buildingId);
      if (idx === -1) return prev;
      
      let totalBuilders = prev.totalBuilders ?? ensureBuildersFromBuildings(prev.buildings || []);
      let busyCount = (prev.buildings || []).filter((b) => b.isBuilding || b.isUpgrading).length;
      let availableBuilders = prev.availableBuilders !== undefined ? prev.availableBuilders : Math.max(0, totalBuilders - busyCount);

      if (availableBuilders <= 0) {
        console.warn("[startUpgrade] جميع البنائين مشغولون!");
        return prev;
      }
      
      if (!canAfford(prev.resources || {}, cost)) {
        console.warn("[startUpgrade] لا تكفي الموارد");
        return prev;
      }

      const newResources = deductCost(prev.resources || {}, cost);
      const buildings = (prev.buildings || []).map((b) => ({ ...b }));
      
      buildings[idx].isUpgrading = true;
      buildings[idx].upgradeFinishTime = Date.now() + (durationMs || 0);

      availableBuilders = Math.max(0, availableBuilders - 1);
      
      const newState = {
        ...prev,
        resources: newResources,
        buildings,
        totalBuilders,
        availableBuilders,
      };
      
      gameState.saveGameState(newState);
      return newState;
    });
  }, []);

  // ✅ تحريك مبنى - مع التحقق والتراجع
  const moveBuilding = useCallback(({ id, newX, newY, oldX, oldY, cancelled = false }) => {
    setGameState((prev) => {
      // إذا تم إلغاء التحرير، ابق في المكان
      if (cancelled) {
        console.log(`[moveBuilding] تم إلغاء تحريك المبنى ${id}`);
        return prev;
      }

      const bIndex = (prev.buildings || []).findIndex((b) => b.id === id);
      if (bIndex === -1) return prev;
      
      const moving = prev.buildings[bIndex];
      const size = BUILDINGS[moving.type]?.size || moving.size || 1;
      
      // ✅ التحقق من التداخل (استثناء المبنى المتحرك)
      const other = (prev.buildings || []).filter((b) => b.id !== id);
      const overlap = overlapsExisting(other, newX, newY, size);
      
      if (overlap.overlap) {
        console.warn(`[moveBuilding] لا يمكن وضع ${moving.type} في (${newX},${newY}) - يتداخل مع ${overlap.building?.type}`);
        
        // ✅ العودة للمكان الأصلي مع رسالة خطأ
        alert(`⚠️ لا يمكن وضع المبنى هنا!\nيتداخل مع ${overlap.building ? 'مبنى آخر' : 'شيء ما'}`);
        return prev;
      }
      
      // ✅ الموقع صالح - التحرير
      const newBuildings = (prev.buildings || []).map((b) => 
        b.id === id ? { ...b, x: newX, y: newY } : b
      );
      
      const updated = { ...prev, buildings: newBuildings };
      gameState.saveGameState(updated);
      console.log(`✅ تم تحريك ${moving.type} إلى (${newX}, ${newY})`);
      return updated;
    });
  }, []);

  // ✅ جمع الموارد
  const collectResources = useCallback((collected) => {
    setGameState((prev) => {
      const newResources = { ...(prev.resources || {}) };
      Object.entries(collected || {}).forEach(([k, v]) => {
        newResources[k] = (newResources[k] || 0) + v;
      });
      const updated = { ...prev, resources: newResources };
      gameState.saveGameState(updated);
      return updated;
    });
  }, []);

  return {
    gameState: currentGameState,
    addBuilding,
    startUpgrade,
    moveBuilding,
    collectResources,
  };
};

export default useGameLogic;
