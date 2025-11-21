// src/store/gameState.js
// الحالة الابتدائية للعبة: الموارد، المباني، وحالات المباني

import availableBuildings from "../../components/availableBuildings";

// الحالة الابتدائية للاعب
export const initialGameState = {
  resources: {
    cobalt: 500,
    mercury: 300,
    elixir: 200
  },
  buildings: [
    // مثال لمبنى ابتدائي موجود على الخريطة
    {
      type: "Town Hall_1",
      level: 1,
      x: 100,  // موقع المبنى على الخريطة
      y: 200,
      isUpgrading: false,
      upgradeEndTime: null
    }
  ],
  // إعدادات عامة للعبة
  settings: {
    soundEnabled: true,
    musicEnabled: true
  },
  // يمكن إضافة وحدات الجيش أو الدفاع هنا لاحقًا
};
