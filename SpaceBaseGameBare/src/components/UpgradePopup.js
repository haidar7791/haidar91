// ui/UpgradePopup.js

import { formatNumber } from "../utils/FormatUtils.js";

export default class UpgradePopup {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;

    // خلفية شفافة للنقر خارج النافذة
    this.overlay = this.scene.add.rectangle(
      0,
      0,
      scene.scale.width,
      scene.scale.height,
      0x000000,
      0.5
    );
    this.overlay.setOrigin(0);
    this.overlay.setVisible(false);
    this.overlay.setInteractive();
    this.overlay.on("pointerdown", () => this.hide());

    // صندوق النافذة
    this.container = this.scene.add.container(scene.scale.width / 2, scene.scale.height / 2);
    this.container.setVisible(false);

    this.bg = this.scene.add.rectangle(0, 0, 350, 300, 0x1a1a1a, 0.95);
    this.bg.setStrokeStyle(3, 0xffffff);
    this.bg.setOrigin(0.5);

    this.titleText = this.scene.add.text(0, -120, "Building", {
      fontFamily: "Arial",
      fontSize: 26,
      color: "#ffffff",
    }).setOrigin(0.5);

    this.levelText = this.scene.add.text(0, -80, "Level: 1", {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#cccccc",
    }).setOrigin(0.5);

    this.upgradeCostText = this.scene.add.text(0, -30, "Upgrade Cost: 0", {
      fontFamily: "Arial",
      fontSize: 20,
      color: "#e0e0e0",
    }).setOrigin(0.5);

    // أزرار
    this.upgradeBtn = this.createButton(0, 25, "Upgrade", () => this.onUpgrade());
    this.sellBtn = this.createButton(0, 75, "Sell", () => this.onSell());
    this.infoBtn = this.createButton(0, 125, "Info", () => this.onInfo());

    this.container.add([
      this.bg,
      this.titleText,
      this.levelText,
      this.upgradeCostText,
      this.upgradeBtn,
      this.sellBtn,
      this.infoBtn,
    ]);
  }

  // دالة إنشاء زر جاهز
  createButton(x, y, label, callback) {
    const btn = this.scene.add.text(x, y, label, {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#ffff00",
      backgroundColor: "#333333",
      padding: { left: 12, right: 12, top: 6, bottom: 6 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerdown", callback);

    return btn;
  }

  // فتح النافذة على مبنى معين
  show(building) {
    this.building = building;

    this.titleText.setText(building.name);
    this.levelText.setText(`Level: ${building.level}`);

    if (building.upgradeCost) {
      this.upgradeCostText.setText(
        `Upgrade Cost: ${formatNumber(building.upgradeCost)}`
      );
    }

    this.overlay.setVisible(true);
    this.container.setVisible(true);
    this.visible = true;
  }

  hide() {
    this.overlay.setVisible(false);
    this.container.setVisible(false);
    this.visible = false;
  }

  // استدعاء عند الضغط على ترقية
  onUpgrade() {
    if (this.building && this.building.onUpgrade) {
      this.building.onUpgrade();
    }
    this.hide();
  }

  // استدعاء عند البيع
  onSell() {
    if (this.building && this.building.onSell) {
      this.building.onSell();
    }
    this.hide();
  }

  // استدعاء عند عرض المعلومات
  onInfo() {
    if (this.building && this.building.onInfo) {
      this.building.onInfo();
    }
  }
}
