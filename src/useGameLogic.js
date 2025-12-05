// src/useGameLogic.js (النسخة النهائية والمتناسقة)

import { useState, useEffect, useCallback, useRef } from "react";
import buildingsManager from "./buildingsManager"
import { BUILDINGS } from "./BuildingData"
import * as TimeUtils from './TimeUtils';
import {
  gameState,
  Building as BuildingClass,
} from "./exports";

const useGameLogic = (initialSavedState) => {
  const [currentGameState, setGameState] = useState(
      // 💡 عند التحميل الأولي، يجب حساب الإنتاج السلبي المتراكم هنا (يُفترض أن يتم ذلك في loadGameState)
      initialSavedState || gameState.getInitialState()
  );

  const lastUpdate = useRef(TimeUtils.now());

  // ----------------------------------------------------
  // منطق التحديث الرئيسي (يُنفذ كل ثانية)
  // ----------------------------------------------------
  const updateGame = useCallback(() => {
    setGameState((prev) => {
      const currentTime = TimeUtils.now();
      const timeElapsed = currentTime - lastUpdate.current;

      if (timeElapsed <= 0) return prev;

      const newResources = { ...prev.resources };
      const newBuildings = [...prev.buildings];

      let productionUpdates = {};
      let completedUpgrades = 0;
      let completedBuilds = 0;

      // 1. 🛑 معالجة الإنتاج والتخزين - تم تصحيح استدعاء الدالة هنا
      // الدالة processProduction موجودة في buildingsManager.js وتقوم بحساب الموارد المنتجة
      const { updatedResources: prodResources, productionUpdates: pU } = buildingsManager.processProduction(
          prev.buildings,
          prev.resources,
          timeElapsed
          // ❌ تم حذف وسيط BUILDINGS الرابع، حيث يتم استيراده داخل buildingsManager
      );
      // تحديث الموارد الجديدة مع إضافة الإنتاج
      Object.assign(newResources, prodResources);
      Object.assign(productionUpdates, pU);

      // 2. معالجة الترقيات والبناء
      newBuildings.forEach((b) => {
        // أ. معالجة الترقيات المكتملة
        if (b.isUpgrading) {
          const remaining = (b.upgradeFinishTime || 0) - currentTime;
          if (remaining <= 0) {
            b.level += 1;
            b.isUpgrading = false;
            b.upgradeFinishTime = null;
            completedUpgrades++;
          }
        }

        // ب. معالجة البناء المكتمل
        if (b.isBuilding) {
          const remaining = (b.buildFinishTime || 0) - currentTime;
          if (remaining <= 0) {
            b.isBuilding = false;
            b.buildFinishTime = null;
            completedBuilds++;
          }
        }
      });

      lastUpdate.current = currentTime;

      // حفظ الحالة إذا حدث تغيير مهم
      if (Object.keys(productionUpdates).length > 0 || completedUpgrades > 0 || completedBuilds > 0 || timeElapsed > 300000) {
          gameState.saveGameState({
              ...prev,
              resources: newResources,
              buildings: newBuildings,
              lastUpdateTime: currentTime,
          });
      }

      return {
          ...prev,
          resources: newResources,
          buildings: newBuildings,
          lastUpdateTime: currentTime,
      };
    });
  }, []);

  // ----------------------------------------------------
  // API الدوال العامة للواجهة الرسومية
  // ----------------------------------------------------

  // A. إضافة مبنى
  const addBuilding = useCallback((type, x, y) => {
    const buildingData = BUILDINGS[type];
    if (!buildingData) {
        console.error(`Attempted to add unknown building type: ${type}`);
        return;
    }

    setGameState(prev => {
        const townHall = prev.buildings.find(b => b.type === 'Town_Hall');
        const townHallLevel = townHall ? townHall.level : 1;
        const currentCount = prev.buildings.filter(b => b.type === type).length;
        const nextLevel = 1;

        const unlockLevel = buildingData.levels[nextLevel]?.unlockLevel || 1;
        if (townHallLevel < unlockLevel) {
            console.warn(`Town Hall Level ${unlockLevel} required for ${type}. Current: ${townHallLevel}`);
            return prev;
        }

        const maxCount = buildingData.levels[nextLevel]?.maxCount || 99;
        if (currentCount >= maxCount) {                
            console.warn(`Max count (${maxCount}) reached for ${type}.`);
            return prev;
        }

        const cost = buildingData.levels[nextLevel]?.cost;                                                    
        if (!cost || prev.resources[cost.type] < cost.amount) {
            console.warn(`Cannot afford ${type} or cost data missing.`);
            return prev;
        }

        // 👷 الخطوة الحاسمة 1: التحقق من عامل البناء (إذا كان المبنى يحتاج وقت بناء)
        const constructionTime = buildingData.levels[nextLevel]?.constructionTime || 0;
        const maxBuilders = prev.buildings.filter(b => b.type === 'Builder_Hut').length;
        const busyBuilders = prev.buildings.filter(b => b.isBuilding || b.isUpgrading).length;
                                                       
        if (constructionTime > 0) {
            // 🛑 تحسين: يجب أن نتحقق من عدد المباني قيد البناء/الترقية مقارنة بالحد الأقصى
            if (busyBuilders >= maxBuilders) {
                console.warn("All builders are busy! Cannot add building.");
                return prev;
            }
        }
        // ----------------------------------------------------------------------------------
                                                       
        const newResources = { ...prev.resources, [cost.type]: prev.resources[cost.type] - cost.amount };
                                                       
        const newBuilding = new BuildingClass(
            TimeUtils.now(),
            type,
            nextLevel,
            x,
            y
        );                                                                                                    
        // 👷 الخطوة الحاسمة 2: تعيين حالة البناء ووقت الانتهاء                                               
        if (constructionTime > 0) {
            newBuilding.isBuilding = true;
            newBuilding.buildFinishTime = TimeUtils.now() + constructionTime;
        }
        // ----------------------------------------------------------------------------------                                                                        
        const newState = {
            ...prev,
            resources: newResources,
            buildings: [...prev.buildings, newBuilding],
        };
        gameState.saveGameState(newState);
        return newState;
    });                                                
  }, []);

  // B. بدء الترقية
  const startUpgrade = useCallback((buildingId, duration, cost) => {
    setGameState(prev => {
      const buildingIndex = prev.buildings.findIndex(b => b.id === buildingId);                               
      if (buildingIndex === -1) return prev;                                                                  
      const building = prev.buildings[buildingIndex];

      // 👷 التحقق من عامل البناء قبل الترقية
      const maxBuilders = prev.buildings.filter(b => b.type === 'Builder_Hut').length;
      const busyBuilders = prev.buildings.filter(b => b.isBuilding || b.isUpgrading).length;

      if (busyBuilders >= maxBuilders) {               
          console.warn("All builders are busy! Cannot start upgrade.");
          return prev;
      }                                                                                                       
      // تحقق من التكلفة                               
      if (prev.resources[cost.type] < cost.amount) {   
          console.warn("Cannot afford upgrade.");      
          return prev;
      }

      // تطبيق الترقية
      const newBuildings = [...prev.buildings];
      const newResources = { ...prev.resources, [cost.type]: prev.resources[cost.type] - cost.amount };
                                                       
      newBuildings[buildingIndex] = {
          ...building,                                 
          isUpgrading: true,
          upgradeStartTime: TimeUtils.now(),           
          upgradeFinishTime: TimeUtils.now() + duration,
      };                                                                                                      
      const newState = {
          ...prev,                                     
          resources: newResources,                     
          buildings: newBuildings,                     
      };                                               
      gameState.saveGameState(newState);

      return newState;
    });                                                
  }, []);
                                                       
  // C. تحريك مبنى 🛑 التعديل الحاسم هنا
  // الآن تقبل الكائن الكامل {id, newX, newY, oldX, oldY} المرسل من MovableBuilding
  const moveBuilding = useCallback(({ id, newX, newY, oldX, oldY }) => {
    setGameState(prev => {
      const newBuildings = [...prev.buildings];        
      const buildingIndex = newBuildings.findIndex(b => b.id === id);                                         

      if (buildingIndex !== -1) {                      
        // 💡 في هذه المرحلة، يمكن إضافة منطق التحقق من التصادمات

        // تحديث الموقع
        newBuildings[buildingIndex] = {
          ...newBuildings[buildingIndex],
          x: newX,                                     
          y: newY,                                     
        };
      }                                                                                                       
      const newState = {
        ...prev,                                       
        buildings: newBuildings,                       
      };                                               
      gameState.saveGameState(newState);                                                                      
      return newState;                                 
    });                                                
  }, []);                                                                                                     

  // D. جمع الموارد
  const collectResources = useCallback((collected) => {
    setGameState(prev => {
      const newResources = { ...prev.resources };

      Object.entries(collected).forEach(([type, amount]) => {                                                 
          if (newResources[type] !== undefined) {      
              newResources[type] += amount;            
          }                                            
      });                                                                                                     
      const newState = {                               
          ...prev,                                     
          resources: newResources,                     
          buildings: prev.buildings,
      };                                               
      gameState.saveGameState(newState);
                                                             return newState;                                 
    });                                                
  }, []);                                              

  // ----------------------------------------------------                                                     
  // تأثير التحديث الزمني (Interval Effect)            
  // ----------------------------------------------------                                                     
  useEffect(() => {
    const intervalId = setInterval(updateGame, 1000);  
    return () => clearInterval(intervalId);            
  }, [updateGame]);

  return {
    gameState: currentGameState,
    addBuilding,
    startUpgrade,
    moveBuilding,
    collectResources,
  };
};

export default useGameLogic;
