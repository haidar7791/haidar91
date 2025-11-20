// src/store/gameState.js

// الموارد المتوفرة (قد تحتاج إلى تحديث هذه الأرقام بناءً على مخزن اللاعب)
export const initialResources = {
  cobalt: 500,    // المورد الأول
  mercury: 200,   // المورد الثاني
  crystal: 5,     // المورد الثالث (ربما للعمال/الأحجار الكريمة)
  // يمكنك إضافة موارد أخرى مثل 'timeTokens' أو 'energy'
};

// هيكل المباني التي بناها اللاعب فعلياً على خريطته
export const initialPlayerBuildings = [
  // مثال على مبنى القلعة (castle) الذي يبدأ به اللاعب
  {
    id: 'b1', // معرّف فريد للمبنى (مهم جداً لحفظ موقعه وتتبعه)
    type: 'castle', // نوع المبنى (يجب أن يتطابق مع مفاتيح BUILDINGS في BuildingData.js)
    level: 1, // مستوى المبنى الحالي
    x: 5,     // موقعه على شبكة الخريطة (أفقي)
    y: 5,     // موقعه على شبكة الخريطة (عمودي)
    isUpgrading: false, // هل هو قيد الترقية حالياً؟
    upgradeFinishTime: null, // متى ينتهي من الترقية (طابع زمني)
  },
  
  // مثال على منجم الزئبق
  {
    id: 'b2',
    type: 'mercuryExtractor',
    level: 1,
    x: 3,
    y: 7,
    isUpgrading: false,
    upgradeFinishTime: null,
  },
  
  // مثال على كوخ البناء (يجب أن يكون له موقع ثابت)
  {
    id: 'b3',
    type: 'builderHut',
    level: 1, // في حال كان له مستويات
    x: 8,
    y: 1,
    isUpgrading: false,
    upgradeFinishTime: null,
  }
];

// حالة اللاعب الكلية (تستخدم لاحقاً في Context أو Redux)
export const initialGameState = {
  resources: initialResources,
  buildings: initialPlayerBuildings,
  // يمكنك إضافة بيانات أخرى هنا مثل:
  // troops: [ ... ], // وحدات الجيش
  // score: 0, // نقاط اللاعب
};

