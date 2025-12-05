//src/Troop.js

import { TROOPS_DATA } from "./TroopsData";

export default class Troop {
  constructor(type, campId = null) {
    const troopInfo = TROOPS_DATA[type];

    if (!troopInfo) {
      throw new Error(`Troop type not found: ${type}`);
    }

    this.id = `${type}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    this.type = type;
    this.campId = campId; // المعسكر الذي ينتمي له

    this.level = 1; // مستقبلًا يمكن إضافة ترقيات للقوات
    this.hp = troopInfo.hp;
    this.damage = troopInfo.damage;
    this.speed = troopInfo.speed;
    this.housingSpace = troopInfo.housingSpace;
    this.trainingTime = troopInfo.trainingTime;

    this.state = "idle"; 
    // idle | training | ready | marching | attacking | dead

    this.position = { x: 0, y: 0 }; // مستقبلًا عند بدء المعارك
  }

  // تحديث موقع المقاتل
  setPosition(x, y) {
    this.position = { x, y };
  }

  // بدء التدريب
  startTraining() {
    this.state = "training";
    this.trainingStartTime = Date.now();
  }

  // عند انتهاء التدريب
  finishTraining() {
    this.state = "ready";
  }

  // هل انتهى التدريب؟
  isTrainingFinished() {
    if (this.state !== "training") return false;

    const elapsed = (Date.now() - this.trainingStartTime) / 1000;
    return elapsed >= this.trainingTime;
  }

  // بدء الحركة
  startMoving() {
    this.state = "marching";
  }

  // تلقي ضرر
  takeDamage(amount) {
    this.hp -= amount;
    if (this.hp <= 0) this.die();
  }

  // موت الجندي
  die() {
    this.state = "dead";
  }
}
