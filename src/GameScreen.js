// src/GameScreen.js

import React, { useEffect, useState } from "react";
import { View, StyleSheet, StatusBar, Text } from "react-native";

import Map from "./Map";
import ResourceBar from "./ResourceBar";
import ShopBar from "./ShopBar";
import TroopTrainingPanel from "./TroopTrainingPanel";
import useGameLogic from "./useGameLogic";
import * as storage from "./storage";
import UpgradePopup from "./UpgradePopup";
import { BUILDINGS } from "./BuildingData";
import * as TimeUtils from "./TimeUtils";

export default function GameScreen() {
  const [loadedState, setLoadedState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // حالة محلية لاختيار المبنى — الآن يديرها GameScreen
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isTrainingOpen, setTrainingOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await storage.loadGameState();
        setLoadedState(saved || null);
      } catch (e) {
        console.error("Failed to load game state:", e);
        setLoadedState(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // استخدام hook منطق اللعبة — ملاحظة: واجهة useGameLogic تعيد { gameState, addBuilding, startUpgrade, ... }
  const {
    gameState,
    addBuilding,
    startUpgrade,
    moveBuilding,
    collectResources,
  } = useGameLogic(loadedState);

  // استخرج القيم التي نحتاجها من gameState
  const buildings = gameState?.buildings || [];
  const resources = gameState?.resources || {};
  const camera = gameState?.camera || null;
  // دوال وضع/هدم/فتح المتجر وغيرها قد تُكمل لاحقاً إذا كانت في hook

  // مؤشر التحميل
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
        // إذا ضغط اللاعب على مبنى نضعه كـ selectedBuilding ليظهر popup
        onSelectBuilding={(b) => setSelectedBuilding(b)}
        // إذا كان لديك دوال كاميرا / وضع مباني مرّرها هنا
        onMoveBuilding={moveBuilding}
      />

      {/* ================== RESOURCE BAR ================== */}
      <ResourceBar resources={resources} />

      {/* ================== SHOP BAR ================== */}
      <ShopBar
        // إن أردت ربط فتح المتجر تُدرج الحالات المناسبة
        startPlacingBuilding={(type) => {
          // مثال: ابدأ وضع مبنى من المتجر
          // يمكنك استدعاء addBuilding لاحقًا عند تأكيد الموقع
        }}
        resources={resources}
      />

      {/* ================== BUILDING INFO / UPGRADE POPUP ================== */}
      {selectedBuilding && !isTrainingOpen && (
        <UpgradePopup
          building={selectedBuilding}
          buildingData={BUILDINGS[selectedBuilding.type]}
          onClose={() => setSelectedBuilding(null)}
          // onUpgrade expects (buildingId, durationMs, costObj)
          onUpgrade={(buildingId, durationMs, costObj) => {
            // تمرير الطلب إلى useGameLogic.startUpgrade
            startUpgrade(buildingId, durationMs, costObj);
            // أغلق اللوحة بعد بدء الترقية (اختياري)
            setSelectedBuilding(null);
          }}
          currentResources={resources}
          currentTime={TimeUtils.now()}
        />
      )}

      {/* ================== TROOP TRAINING PANEL ================== */}
      {isTrainingOpen && (
        <TroopTrainingPanel
          // مرّر دوال التدريب حسب واجهة مشروعك
          close={() => setTrainingOpen(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingOverlay: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
  },
});
