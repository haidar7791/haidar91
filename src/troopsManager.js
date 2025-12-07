// src/troopsManager.js

// 🛑🛑🛑 استيراد جميع البيانات والدوال المساعدة من ملف الإدارة المركزي 🛑🛑🛑
import * as TimeUtils from './TimeUtils';
import * as gameState from './gameState'; 
import { TROOPS_DATA } from './TroopsData';

class TroopsManager {
  constructor() {
    // 🛑 استخدام gameState.loadGameState() 🛑
    this.state = gameState.loadGameState();

    // في حال لم تكن موجودة ننشئها
    if (!this.state.troops) {
      this.state.troops = {
        queue: [], // قائمة انتظار التدريب
        army: [],  // القوات الجاهزة
        capacityUsed: 0,
      };
      // 🛑 استخدام gameState.saveGameState() 🛑
      gameState.saveGameState(this.state);
    }
  }

  // --------------------------
  // 1. حساب السعة القصوى للمعسكرات
  // --------------------------
  calculateArmyCapacity() {
    const buildings = this.state.buildings;
    let capacity = 0;

    buildings.forEach((b) => {
      if (b.type === "Forces_Camp") {
        const lvl = b.level;
        // ملاحظة: يفترض أن المبنى "Forces_Camp" لديه data.levels[lvl].capacity
        const data = b.data.levels[lvl]; 

        if (data && data.capacity) {
          capacity += data.capacity;
        }
      }
    });

    return capacity;
  }

  getUsedCapacity() {
    return this.state.troops.capacityUsed;
  }

  getFreeCapacity() {
    return this.calculateArmyCapacity() - this.getUsedCapacity();
  }

  // --------------------------
  // 2. إضافة تدريب للقائمة
  // --------------------------
  trainTroop(troopType) {
    const troopData = TROOPS_DATA[troopType];
    if (!troopData) return { error: "نوع الجندي غير موجود" };

    const cost = troopData.cost;
    const capacity = troopData.capacity;

    // التحقق من الموارد
    if (this.state.resources[cost.type] < cost.amount) {
      return { error: "الموارد غير كافية لتدريب الجندي" };
    }

    // لا نحتاج سعة هنا، السعة تتفعل عند نهاية التدريب
    // حتى نستطيع إضافة جنود بانتظار التدريب

    // 🛑 استخدام TimeUtils.getTimeNow() 🛑
    const now = TimeUtils.getTimeNow();

    // 🛑 استخدام TimeUtils.secondsToMs() 🛑
    const trainingTime = TimeUtils.secondsToMs(troopData.trainTime);

    const queueItem = {
      id: Date.now() + "_" + troopType,
      troopType,
      startTime: now,
      finishTime: now + trainingTime,
      status: "training",
    };

    // خصم الموارد
    this.state.resources[cost.type] -= cost.amount;

    // إضافة للقائمة
    this.state.troops.queue.push(queueItem);

    // 🛑 استخدام gameState.saveGameState() 🛑
    gameState.saveGameState(this.state);

    return { success: true, queueItem };
  }

  // --------------------------
  // 3. تحديث التدريب – إنهاء التدريب
  // --------------------------
  updateTraining() {
    // 🛑 استخدام TimeUtils.getTimeNow() 🛑
    const now = TimeUtils.getTimeNow();
    let changed = false;

    // ملاحظة: من الأفضل استخدام دالة filter و map لتجنب تغيير المصفوفة أثناء التكرار.
    this.state.troops.queue.forEach((item) => {
      if (item.status === "training" && now >= item.finishTime) {
        const troopData = TROOPS_DATA[item.troopType];

        // التحقق من السعة
        if (this.getFreeCapacity() >= troopData.capacity) {
          // إضافة للجيش
          this.state.troops.army.push({
            type: item.troopType,
            level: troopData.startLevel || 1,
          });

          // تحديث السعة
          this.state.troops.capacityUsed += troopData.capacity;

          // إزالة من التدريب
          item.status = "done";
        } else {
          // لا توجد سعة = يبقى مكتمل لكنه "متوقف"
          item.status = "waiting_storage";
        }

        changed = true;
      }
    });

    if (changed) gameState.saveGameState(this.state);
  }

  // --------------------------
  // 4. الحصول على الجيش الجاهز
  // --------------------------
  getArmy() {
    return this.state.troops.army;
  }

  // --------------------------
  // 5. حذف جندي (مثلاً عند الهجوم)
  // --------------------------
  removeTroop(troopType) {
    const index = this.state.troops.army.findIndex((t) => t.type === troopType);
    if (index === -1) return;

    const troopData = TROOPS_DATA[troopType];

    this.state.troops.army.splice(index, 1);

    this.state.troops.capacityUsed -= troopData.capacity;

    // 🛑 استخدام gameState.saveGameState() 🛑
    gameState.saveGameState(this.state);
  }

  // --------------------------
  // 6. الحصول على قائمة الانتظار
  // --------------------------
  getTrainingQueue() {
    return this.state.troops.queue;
  }
}

export const troopsManager = new TroopsManager();
