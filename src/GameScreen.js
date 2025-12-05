// src/GameScreen.js

import React, { useEffect, useState } from "react";
import { View, StyleSheet, StatusBar, Text } from "react-native";

// 🛑🛑🛑 استيراد جميع المكونات والدوال المساعدة من ملف الإدارة المركزي 🛑🛑🛑
import {
  // المكونات
  Map,
  ResourceBar,
  ShopBar,
  BuildingInfoPanel,
  TroopTrainingPanel,

  // الدوال المساعدة ومنطق اللعبة
  useGameLogic,
  storage, // نستخدمه هنا باسمه الأصلي (storage)
  // BuildingData, // افتراض أن BuildingData مُستوردة لتمكين منطق الترقية في BuildingInfoPanel
} from "./exports";
// 🛑🛑🛑 نهاية الاستيراد المركزي 🛑🛑🛑

export default function GameScreen() {
  // 1. حالة التحميل والبيانات المحفوظة
  const [loadedState, setLoadedState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load save file on mount (التحميل يتم قبل تهيئة منطق اللعبة)
  useEffect(() => {
    (async () => {
      try {
        // 🛑 الخطوة الحاسمة: تحميل الحالة من التخزين
        const saved = await storage.loadGameState();
        setLoadedState(saved); // تخزين الحالة المحملة
      } catch (e) {
        console.error("Failed to load game state:", e);
        // في حال فشل التحميل، يتم استخدام null (لتشغيل الحالة الأولية في useGameLogic)
        setLoadedState(null);
      } finally {
        setIsLoading(false); // تم الانتهاء من التحميل (سواء بنجاح أو فشل)
      }
    })();
  }, []);

  // 2. تمرير الحالة المحملة إلى Hook منطق اللعبة
  const {
    // تم حذف المباني والموارد من `useGameLogic` للحصول على نظافة الكود 
    // يجب تمريرهم الى useGameLogic لكي يكون الكود قابل للقراءة
    buildings,
    selectedBuilding,
    setSelectedBuilding,
    resources,
    // الدوال التي تم استيرادها مسبقًا:
    addResource,
    spendResource,
    troops,
    trainTroop,
    canTrain,
    isShopOpen,
    setShopOpen,
    isTrainingOpen,
    setTrainingOpen,
    camera,
    setCamera,
    isPlacingBuilding,
    startPlacingBuilding,
    finalizePlacement,
    cancelPlacement,
    // يجب التأكد من تمرير هذه الدوال الجديدة من useGameLogic:
    startUpgrade, // لترقية المبنى
  } = useGameLogic(loadedState); // 🛑 تمرير loadedState كمدخل

  // 3. عرض مؤشر التحميل
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingOverlay]}>
        <Text style={styles.loadingText}>جاري تحميل بيانات اللعبة...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* ================== MAP ================== */}
      <Map
        buildings={buildings}
        camera={camera}
        setCamera={setCamera}
        onSelectBuilding={setSelectedBuilding}
        isPlacingBuilding={isPlacingBuilding}
        finalizePlacement={finalizePlacement}
        cancelPlacement={cancelPlacement}
      />

      {/* ================== RESOURCE BAR ================== */}
      <ResourceBar resources={resources} />

      {/* ================== SHOP BAR ================== */}
      <ShopBar
        isOpen={isShopOpen}
        setOpen={setShopOpen}
        startPlacingBuilding={startPlacingBuilding}
        resources={resources}
      />

      {/* ================== BUILDING INFO PANEL (نافذة معلومات وترقية المبنى) ================== */}
      {/* 🛑 يجب ربط الدالة startUpgrade هنا 🛑 */}
      {selectedBuilding && !isTrainingOpen && (
        <BuildingInfoPanel
          building={selectedBuilding}
          close={() => setSelectedBuilding(null)}
          spendResource={spendResource}
          resources={resources}
          // 💡 تمرير دالة بدء الترقية إلى اللوحة
          onUpgrade={startUpgrade} 
        />
      )}

      {/* ================== TROOP TRAINING PANEL ================== */}
      {isTrainingOpen && (
        <TroopTrainingPanel
          troops={troops}
          canTrain={canTrain}
          trainTroop={trainTroop}
          close={() => setTrainingOpen(false)}
        />
      )}
    </View>
  );
}

// -------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingOverlay: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  }
});
