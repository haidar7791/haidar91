//src/ShopItem.js

import { formatNumber } from "./exports";

export default class ShopItem {
  constructor(scene, x, y, data, onPurchase) {
    this.scene = scene;
    this.data = data;         // { id, name, price, imageKey, description }
    this.onPurchase = onPurchase;

    // حاوية العنصر
    this.container = scene.add.container(x, y);

    // الخلفية
    this.bg = scene.add.rectangle(0, 0, 260, 280, 0x1e1e1e, 0.95)
      .setStrokeStyle(3, 0xffffff)
      .setOrigin(0.5);

    // صورة العنصر
    this.icon = scene.add.image(0, -80, data.imageKey)
      .setDisplaySize(110, 110)
      .setOrigin(0.5);

    // الاسم
    this.nameText = scene.add.text(0, 10, data.name, {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#ffffff",
      fontStyle: "bold"
    }).setOrigin(0.5);

    // السعر
    this.priceText = scene.add.text(0, 55, `Price: ${formatNumber(data.price)}`, {
      fontFamily: "Arial",
      fontSize: 20,
      color: "#ffdd55"
    }).setOrigin(0.5);

    // الوصف
    this.descText = scene.add.text(0, 95, data.description, {
      fontFamily: "Arial",
      fontSize: 16,
      color: "#cccccc",
      align: "center",
      wordWrap: { width: 230 }
    }).setOrigin(0.5);

    // زر شراء
    this.buyButton = this.scene.add.text(0, 140, "Buy", {
      fontFamily: "Arial",
      fontSize: 22,
      color: "#00ff00",
      backgroundColor: "#333333",
      padding: { left: 16, right: 16, top: 8, bottom: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.buyButton.on("pointerdown", () => this.purchase());

    this.container.add([
      this.bg,
      this.icon,
      this.nameText,
      this.priceText,
      this.descText,
      this.buyButton
    ]);
  }

  // تحديث إذا اللاعب ما يملك موارد
  setDisabled(state) {
    const alpha = state ? 0.4 : 1;

    this.bg.setAlpha(alpha);
    this.icon.setAlpha(alpha);
    this.nameText.setAlpha(alpha);
    this.priceText.setAlpha(alpha);
    this.descText.setAlpha(alpha);
    this.buyButton.setAlpha(alpha);

    this.buyButton.disableInteractive();
    if (!state) this.buyButton.setInteractive({ useHandCursor: true });
  }

  // تنفيذ الشراء
  purchase() {
    if (this.onPurchase) {
      this.onPurchase(this.data);
    }

    // تشغيل صوت الشراء (إذا عندك sound system)
    if (this.scene.sound) {
      this.scene.sound.play("buy_sound");
    }
  }

  getView() {
    return this.container;
  }
  }
