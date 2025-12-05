// src/buildingsManager.js
// يدير هذا الملف المنطق الخاص بالمباني، مثل الإضافة، والتحريك، والترقية، وإنتاج الموارد.
// 💡 تم إصلاح الخطأ المتعلق بالتعديل المباشر للحالة (State Mutation).

// يجب أن يتم استيراد BUILDINGS من ملف الإدارة المركزي (exports.js)
import { BUILDINGS } from "./BuildingData.js"; 
// نستخدم TimeUtils لاستخدام دالة now
import { TimeUtils } from "./exports.js"; 

export const BuildingsManager = {
  /**
   * دالة معالجة إنتاج الموارد (لحل خطأ processProduction is not a function)
   * هذه الدالة يتم استدعاؤها دورياً في useGameLogic.js
   * * @param {object[]} buildings - قائمة المباني الحالية.
   * @param {object} resources - الموارد الحالية.
   * @param {number} timeElapsed - الوقت المنقضي بالمللي ثانية.
   * @returns {{updatedResources: object, productionUpdates: object}}
   */
  processProduction(buildings, resources, timeElapsed) {
    
    const updatedResources = { ...resources };
    const productionUpdates = {}; 
    
    // تحويل timeElapsed من ميلي ثانية إلى ثواني
    const timeInSeconds = timeElapsed / 1000;

    buildings.forEach(building => {
        // التحقق من وجود بيانات المبنى في BUILDINGS
        const data = BUILDINGS[building.type];
        
        // التحقق من أن المبنى ليس في حالة ترقية (لضمان توقف الإنتاج أثناء الترقية)
        if (!data || building.isUpgrading) return;
        
        // الحصول على بيانات المستوى الحالي
        const levelData = data.levels[building.level];
        if (!levelData || !levelData.production) return;

        const { rate, type } = levelData.production;

        if (rate && type) {
            // حساب الإنتاج: (المعدل في الثانية) * عدد الثواني
            const producedAmount = rate * timeInSeconds; 
            
            // إضافة إلى الموارد الحالية
            updatedResources[type] = (updatedResources[type] || 0) + producedAmount;
            
            // تسجيل التحديث
            if (productionUpdates[type]) {
                productionUpdates[type] += producedAmount;
            } else {
                productionUpdates[type] = producedAmount;
            }
        }
    });

    return { updatedResources, productionUpdates };
  },
  
  /**
   * دالة التحقق من اكتمال الترقيات
   * * @param {object[]} buildings - قائمة المباني الحالية.
   * @returns {boolean} - true إذا تم اكتمال ترقية واحدة على الأقل.
   */
  checkUpgrades(buildings) {
    let upgradeCompleted = false;
    const currentTime = TimeUtils.now();
    
    buildings.forEach(b => {
      if (b.isUpgrading && b.upgradeFinishTime && b.upgradeFinishTime <= currentTime) {
          upgradeCompleted = true;
      }
    });
    
    return upgradeCompleted;
  },
  
  /**
   * 💡 تم التعديل: ترجع كائن حالة جديد بدلاً من التعديل المباشر (Mutation)
   * @param {object} gameState - حالة اللعبة الحالية
   * @param {string} buildingKey - مفتاح نوع المبنى
   * @param {number} x - إحداثي الشبكة X
   * @param {number} y - إحداثي الشبكة Y
   * @returns {{success: boolean, newState?: object, error?: string}}
   */
  addBuilding(gameState, buildingKey, x, y) {
    const data = BUILDINGS[buildingKey];
    if (!data) return { success: false, error: "invalid_building" };

    if (!gameState || !gameState.buildings)
      return { success: false, error: "missing_game_state" };

    const newBuilding = {
      id: Date.now(),
      type: buildingKey,
      level: 1,
      x,
      y,
      // 💡 تم حذف خاصية 'size' لأنه يتم تحديدها من كائن BUILDINGS
      isMoving: false,
      isUpgrading: false,
      upgradeFinishTime: null, // 💡 تمت إضافتها لتجنب الأخطاء
    };

    // إنشاء نسخة جديدة من مصفوفة المباني وإضافة المبنى الجديد
    const newBuildings = [...gameState.buildings, newBuilding];
    
    // إرجاع كائن حالة جديد
    return { 
        success: true, 
        newState: {
            ...gameState,
            buildings: newBuildings
        } 
    };
  },

  /**
   * 💡 تم التعديل: ترجع كائن حالة جديد بدلاً من التعديل المباشر (Mutation)
   * @param {object} gameState - حالة اللعبة الحالية
   * @param {number} id - مُعرِّف المبنى
   * @param {number} x - إحداثي الشبكة X الجديد
   * @param {number} y - إحداثي الشبكة Y الجديد
   * @returns {object | undefined} - كائن حالة جديد أو Undefined إذا لم يتم العثور على المبنى
   */
  moveBuilding(gameState, id, x, y) {
    if (!gameState || !gameState.buildings) return;
    
    const newBuildings = gameState.buildings.map(b => {
        if (b.id === id) {
            // إنشاء نسخة من المبنى مع تحديث الإحداثيات
            return { ...b, x, y };
        }
        return b;
    });

    // إرجاع كائن حالة جديد
    return { 
        ...gameState,
        buildings: newBuildings
    };
  },

  /**
   * 💡 تم التعديل: ترجع كائن حالة جديد بدلاً من التعديل المباشر (Mutation)
   * @param {object} gameState - حالة اللعبة الحالية
   * @param {number} id - مُعرِّف المبنى
   * @param {number} duration - مدة الترقية بالمللي ثانية
   * @returns {object | undefined} - كائن حالة جديد أو Undefined إذا لم يتم العثور على المبنى
   */
  startUpgrade(gameState, id, duration) {
    if (!gameState || !gameState.buildings) return;
    
    const finishTime = TimeUtils.now() + (duration || 0);

    const newBuildings = gameState.buildings.map(b => {
        if (b.id === id) {
            // إنشاء نسخة من المبنى مع تحديث حالة الترقية
            return { 
                ...b, 
                isUpgrading: true,
                upgradeFinishTime: finishTime,
            };
        }
        return b;
    });

    // إرجاع كائن حالة جديد
    return { 
        ...gameState,
        buildings: newBuildings
    };
  },
  
  // دالة وهمية مطلوبة في useGameLogic.js لتهيئة حالة المباني
  setGameState(state) {
    // هذه الدالة لم تعد ضرورية هنا لأن الدوال الأخرى ترجع الحالة الجديدة
  }
};

export default BuildingsManager;
