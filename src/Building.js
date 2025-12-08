// src/Building.js
import BUILDINGS from "./BuildingData";

export default class Building {
  constructor(id, type, level = 1, x = 0, y = 0) {
    this.id = id;
    this.type = type;
    this.level = level;
    this.x = x;
    this.y = y;

    // production bookkeeping
    this.lastCollectTime = Date.now();
    this.currentProduction = 0;

    // build / upgrade state
    this.isBuilding = false;
    this.buildStartTime = null;
    this.buildFinishTime = null;

    this.isUpgrading = false;
    this.upgradeStartTime = null;
    this.upgradeFinishTime = null;

    // size
    const data = BUILDINGS[type] || {};
    this.size = data.size || 1;
  }
}
