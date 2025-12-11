// src/gameState.js - النسخة المعدلة
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as TimeUtils from './TimeUtils';
import { isOverlappingAny, findNearestValidPosition } from './collisionUtils';
import { MAP_TILES_X, MAP_TILES_Y } from './MapConfig';

export const TOWN_HALL_ID = "Town_Hall";
const GAME_STATE_KEY = '@MyApp:gameState_v1';

// الحالة الابتدائية
export const initialGameState = {
  resources: {
    Cobalt: 500,
    Elixir: 500,
    Crystal: 50,
  },
  storageCapacity: {
    Cobalt: 1000,
    Elixir: 1000,
    Crystal: 100,
  },
  buildings: [
    {
      id: "th_001",
      type: TOWN_HALL_ID,
      level: 1,
      x: 5,
      y: 5,
      size: 2,
      isUpgrading: false,
      upgradeFinishTime: null,
      isBuilding: false,
      buildFinishTime: null,
    },
    {
      id: "hut_001",
      type: "Builder_Hut",
      level: 1,
      x: 8,
      y: 5,
      size: 1,
      isUpgrading: false,
      upgradeFinishTime: null,
      isBuilding: false,
      buildFinishTime: null,
    },
  ],
  totalBuilders: 1,
  availableBuilders: 1,
  lastUpdateTime: TimeUtils.now(), // seconds
  buildingPositions: new Set(), // ✅ تتبع المواقع المشغولة
};

// ✅ دالة لتحديث مواقع المباني
const updateBuildingPositions = (buildings) => {
  const positions = new Set();
  buildings.forEach(building => {
    const size = building.size || 1;
    for (let dx = 0; dx < size; dx++) {
      for (let dy = 0; dy < size; dy++) {
        positions.add(`${building.x + dx},${building.y + dy}`);
      }
    }
  });
  return positions;
};

// ✅ التحقق من موقع فارغ
export const isPositionEmpty = (buildings, x, y, size = 1, excludeId = null) => {
  for (let dx = 0; dx < size; dx++) {
    for (let dy = 0; dy < size; dy++) {
      const checkX = x + dx;
      const checkY = y + dy;
      
      for (const building of buildings) {
        if (excludeId && building.id === excludeId) continue;
        
        const bSize = building.size || 1;
        if (checkX >= building.x && checkX < building.x + bSize &&
            checkY >= building.y && checkY < building.y + bSize) {
          return false;
        }
      }
    }
  }
  return true;
};

// ✅ إيجاد موقع فارغ للمبنى الجديد
export const findEmptySpotForBuilding = (buildings, size = 1) => {
  // ابحث بشكل منظم من الأعلى لليسار
  for (let y = 1; y <= MAP_TILES_Y - size; y++) {
    for (let x = 1; x <= MAP_TILES_X - size; x++) {
      if (isPositionEmpty(buildings, x, y, size)) {
        // ✅ تأكد من وجود مسافة من المباني الأخرى
        let hasSpace = true;
        for (const building of buildings) {
          const distanceX = Math.abs((x + size/2) - (building.x + (building.size||1)/2));
          const distanceY = Math.abs((y + size/2) - (building.y + (building.size||1)/2));
          
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
  
  // إذا لم يجد مع المسافات، ابحث عن أي مكان فارغ
  for (let y = 1; y <= MAP_TILES_Y - size; y++) {
    for (let x = 1; x <= MAP_TILES_X - size; x++) {
      if (isPositionEmpty(buildings, x, y, size)) {
        return { x, y };
      }
    }
  }
  
  return null;
};

// ✅ إضافة مبنى جديد مع موقع تلقائي
export const addNewBuilding = (state, buildingType, buildingData, customX = null, customY = null) => {
  const newState = { ...state };
  const buildings = [...newState.buildings];
  
  const size = buildingData.size || 1;
  
  let x, y;
  
  if (customX !== null && customY !== null) {
    // استخدام الموقع المخصص
    x = customX;
    y = customY;
  } else {
    // البحث عن موقع تلقائي
    const spot = findEmptySpotForBuilding(buildings, size);
    if (!spot) {
      console.error("لا توجد أماكن فارغة للمبنى الجديد");
      return null;
    }
    x = spot.x;
    y = spot.y;
  }
  
  // التحقق من صحة الموقع
  if (!isPositionEmpty(buildings, x, y, size)) {
    console.error("الموقع المحدد مشغول بالفعل");
    return null;
  }
  
  // إنشاء المبنى الجديد
  const newBuilding = {
    id: `${buildingType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: buildingType,
    level: 1,
    x: x,
    y: y,
    size: size,
    isUpgrading: false,
    upgradeFinishTime: null,
    isBuilding: true,
    buildFinishTime: TimeUtils.now() + (buildingData.buildTime || 30), // 30 ثانية افتراضياً
  };
  
  // خصم التكلفة
  if (buildingData.cost) {
    for (const [resource, amount] of Object.entries(buildingData.cost)) {
      if (newState.resources[resource] !== undefined) {
        newState.resources[resource] -= amount;
      }
    }
  }
  
  // إضافة المبنى
  buildings.push(newBuilding);
  newState.buildings = buildings;
  
  // تحديث البنائين المتاحين
  newState.availableBuilders = Math.max(0, newState.availableBuilders - 1);
  
  return newState;
};

// ✅ تحريك مبنى مع التحقق
export const moveBuilding = (state, buildingId, newX, newY) => {
  const newState = { ...state };
  const buildings = [...newState.buildings];
  
  const buildingIndex = buildings.findIndex(b => b.id === buildingId);
  if (buildingIndex === -1) return newState;
  
  const building = { ...buildings[buildingIndex] };
  const size = building.size || 1;
  
  // ✅ التحقق من صحة الموقع الجديد
  if (!isPositionEmpty(buildings, newX, newY, size, buildingId)) {
    console.log(`[moveBuilding] لا يمكن تحريك ${buildingId} إلى (${newX},${newY}) - الموقع مشغول`);
    
    // ✅ إرجاع المبنى إلى موقعه الأصلي
    building.x = building.x; // البقاء في نفس المكان
    building.y = building.y;
    
    buildings[buildingIndex] = building;
    newState.buildings = buildings;
    
    // ✅ إرجاع حالة الخطأ
    return { ...newState, moveError: "الموقع مشغول" };
  }
  
  // ✅ الموقع صالح - التحرير
  building.x = newX;
  building.y = newY;
  
  buildings[buildingIndex] = building;
  newState.buildings = buildings;
  
  return newState;
};

// ✅ دالة مساعدة: الحصول على معلومات المبنى من BuildingData
export const getBuildingInfo = (buildingType, buildingData) => {
  const building = buildingData[buildingType];
  if (!building) {
    console.warn(`Building type ${buildingType} not found in BuildingData`);
    return null;
  }
  
  return {
    name: building.name || buildingType,
    size: building.size || 1,
    cost: building.cost || {},
    buildTime: building.buildTime || 30,
    production: building.production || {},
    capacity: building.capacity || {},
    image: building.image,
    levels: building.levels || {},
  };
};

// دالة للحصول على الحالة الابتدائية (مستخدمة في useGameLogic)
export const getInitialState = () => {
  return { ...initialGameState };
};

// حفظ الحالة إلى AsyncStorage
export const saveGameState = async (state) => {
  try {
    // ✅ تحديث وقت التحديث الأخير
    state.lastUpdateTime = TimeUtils.now();
    
    // ✅ تحديث مواقع المباني قبل الحفظ
    state.buildingPositions = updateBuildingPositions(state.buildings);
    
    const jsonValue = JSON.stringify(state);
    await AsyncStorage.setItem(GAME_STATE_KEY, jsonValue);
    console.log("[gameState] تم حفظ الحالة");
  } catch (e) {
    console.error("[gameState] خطأ في الحفظ:", e);
  }
};

// تحميل الحالة من AsyncStorage (إرجاع الحالة الابتدائية إن لم توجد)
export const loadGameState = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GAME_STATE_KEY);
    if (jsonValue !== null) {
      const parsed = JSON.parse(jsonValue);
      
      // ✅ تأكد من وجود الحقول الأساسية
      if (!parsed.lastUpdateTime) parsed.lastUpdateTime = TimeUtils.now();
      if (!parsed.buildings) parsed.buildings = [];
      
      // ✅ تحديث مواقع المباني
      parsed.buildingPositions = updateBuildingPositions(parsed.buildings);
      
      console.log("[gameState] تم تحميل الحالة");
      return parsed;
    }
  } catch (e) {
    console.error("[gameState] خطأ في التحميل:", e);
  }
  
  // ✅ إرجاع الحالة الابتدائية مع تحديث المواقع
  const initialState = getInitialState();
  initialState.buildingPositions = updateBuildingPositions(initialState.buildings);
  return initialState;
};

export default {
  getInitialState,
  saveGameState,
  loadGameState,
  addNewBuilding,
  moveBuilding,
  isPositionEmpty,
  findEmptySpotForBuilding,
  getBuildingInfo,
};
