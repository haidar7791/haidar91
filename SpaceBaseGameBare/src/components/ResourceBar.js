// ui/ResourceBar.js

import { formatNumber } from "../utils/FormatUtils.js";

export default class ResourceBar {
  constructor(scene, initialResources = {}) {
    this.scene = scene;

    // الموارد المتاحة في اللعبة
    this.resources = {
      mercury: 0,
      cobalt: 0,
      uranium: 0,
      gold: 0,
      ...initialResources
    };

    this.container = this.scene.add.container(10, 10);

    this.textElements = {};

    // ترتيب الظهور في الشريط
    const order = ["mercury", "cobalt", "uranium", "gold"];

    let offsetX = 0;

    order.forEach((resName) => {
      const text = this.scene.add.text(offsetX, 0, `${resName}: 0`, {
        fontFamily: "Arial",
        fontSize: 22,
        color: "#ffffff",
      });

      this.container.add(text);
      this.textElements[resName] = text;

      offsetX += 150; // المسافة بين الموارد
    });
  }

  // تحديث موارد اللاعب
  updateResources(newData) {
    Object.keys(newData).forEach((key) => {
      if (this.resources.hasOwnProperty(key)) {
        this.resources[key] = newData[key];
      }
    });

    this.refreshUI();
  }

  // تحديث النصوص في الواجهة
  refreshUI() {
    Object.keys(this.textElements).forEach((resName) => {
      const amount = this.resources[resName] || 0;
      this.textElements[resName].setText(
        `${capitalize(resName)}: ${formatNumber(amount)}`
      );
    });
  }
}

// لتحويل أول حرف إلى كبير
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
