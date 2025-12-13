// src/GameScreen.js - الإصدار النهائي
import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, StatusBar, Text, Alert } from "react-native";

import Map from "./Map";
import ResourceBar from "./ResourceBar";
import ShopBar from "./ShopBar";
import ShopButton from "./ShopButton";
import TroopTrainingPanel from "./TroopTrainingPanel";
import useGameLogic from "./useGameLogic";
import * as storage from "./storage";
import UpgradePopup from "./UpgradePopup";
import { BUILDINGS, TOWN_HALL_ID } from "./BuildingData";
import * as TimeUtils from "./TimeUtils";

export default function GameScreen() {
  const [loadedState, setLoadedState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ حالة المتجر
  const [shopVisible, setShopVisible] = useState(false);
  const [placingBuilding, setPlacingBuilding] = useState(null);

  // ✅ حالة المبنى المحدد
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [isTrainingOpen, setTrainingOpen] = useState(false);

  // ✅ حالة للتحديث القسري
  const [refreshKey, setRefreshKey] = useState(0);

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

  // ✅ استخدام hook منطق اللعبة
  const {
    gameState,
    addBuilding,
    startUpgrade,
    moveBuilding,
    collectResources,
    getTownHallLevel,
    isBuildingUnlocked,
    canAddBuilding: canAddBuildingFromHook,
    currentTownHallLevel,
  } = useGameLogic(loadedState);

  // ✅ استخراج القيم من gameState
  const buildings = gameState?.buildings || [];
  const resources = gameState?.resources || {};

  // ✅ دالة لبدء وضع مبنى جديد
  const startPlacing = useCallback((buildingType) => {
    const buildingData = BUILDINGS[buildingType];

    if (!buildingData) {
      Alert.alert("خطأ", "نوع المبنى غير معروف");
      return;
    }

    // ✅ التحقق مما إذا كان المبنى مفتوحًا لمستوى القلعة الحالي
    if (!isBuildingUnlocked(buildingType)) {
      const requiresTownHall = buildingData.levels[1]?.requiresTownHall || 1;
      Alert.alert("🔒 مقفل", `تحتاج قلعة مستوى ${requiresTownHall} لفتح هذا المبنى\n(مستوى قلعتك الحالي: ${currentTownHallLevel})`);
      return;
    }

    // ✅ التحقق من maxCount
    if (!canAddBuildingFromHook(buildingType)) {
      const maxCount = buildingData.maxCount || 1;
      const currentCount = buildings.filter(b => b.type === buildingType).length;
      Alert.alert("❌ غير مسموح", `يمكنك بناء ${maxCount} فقط من هذا النوع\n(لديك: ${currentCount}/${maxCount})`);
      return;
    }

    // ✅ التحقق من الموارد
    const cost = buildingData.levels[1]?.cost || {};
    let canAfford = true;
    let missingResource = "";
    let missingAmount = 0;

    if (typeof cost === 'object' && !Array.isArray(cost)) {
      for (const [resource, amount] of Object.entries(cost)) {
        if ((resources[resource] || 0) < amount) {
          canAfford = false;
          missingResource = resource;
          missingAmount = amount - (resources[resource] || 0);
          break;
        }
      }
    }

    if (!canAfford) {
      Alert.alert("💰 غير كافي", `تحتاج ${missingAmount} ${missingResource} أخرى`);
      return;
    }

    setPlacingBuilding(buildingType);
    setShopVisible(false);
  }, [buildings, resources, currentTownHallLevel, isBuildingUnlocked, canAddBuildingFromHook]);

  // ✅ دالة تأكيد وضع المبنى
  const handleConfirmPlacement = useCallback((buildingType, x, y) => {
    addBuilding(buildingType, x, y);
    setPlacingBuilding(null);
    
    // ✅ تحديث المتجر فوراً
    setRefreshKey(prev => prev + 1);
    
    Alert.alert("✅ تم", `تم بناء ${BUILDINGS[buildingType]?.name_ar || buildingType}`);
  }, [addBuilding]);

  // ✅ دالة إلغاء وضع المبنى
  const handleCancelPlacement = useCallback(() => {
    setPlacingBuilding(null);
  }, []);

  // ✅ دالة تحريك مبنى
  const handleMoveBuilding = useCallback((moveObj) => {
    if (moveObj.cancelled) {
      return;
    }

    moveBuilding(moveObj);
  }, [moveBuilding]);

  // ✅ دالة بدء الترقية المحسنة
  const handleStartUpgrade = useCallback((buildingId, durationMs, costObj) => {
    startUpgrade(buildingId, durationMs, costObj);
    setSelectedBuilding(null);
    
    // ✅ إذا كان المبنى هو القلعة، قم بتحديث المتجر فوراً
    const building = buildings.find(b => b.id === buildingId);
    if (building && building.type === TOWN_HALL_ID) {
      setTimeout(() => {
        setRefreshKey(prev => prev + 1);
      }, 100);
    }
  }, [startUpgrade, buildings]);

  // ✅ مؤشر التحميل
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

      {/* ================== الخريطة ================== */}
      <Map
        key={`map-${refreshKey}`}
        gameState={gameState}
        onStartUpgrade={handleStartUpgrade}
        onMoveBuilding={handleMoveBuilding}
        onOpenShop={() => setShopVisible(true)}
        onCancelPlacement={handleCancelPlacement}
        onConfirmPlacement={handleConfirmPlacement}
        onSelectBuilding={(b) => setSelectedBuilding(b)}
      />

      {/* ================== شريط الموارد ================== */}
      <ResourceBar resources={resources} />

      {/* ================== زر المتجر ================== */}
      <ShopButton onPress={() => setShopVisible(!shopVisible)} />

      {/* ================== شريط المتجر ================== */}
      <ShopBar
        key={`shop-${refreshKey}-${currentTownHallLevel}`}
        shopVisible={shopVisible}
        resources={resources}
        startPlacing={startPlacing}
        townHallLevel={currentTownHallLevel}
        existingBuildings={buildings}
      />

      {/* ================== نافذة ترقية المبنى ================== */}
      {selectedBuilding && !isTrainingOpen && (
        <UpgradePopup
          key={`upgrade-${selectedBuilding.id}-${currentTownHallLevel}`}
          building={selectedBuilding}
          buildingData={BUILDINGS[selectedBuilding.type]}
          onClose={() => setSelectedBuilding(null)}
          onUpgrade={handleStartUpgrade}
          currentResources={resources}
          currentTime={TimeUtils.now()}
          townHallLevel={currentTownHallLevel}
          buildings={buildings}
        />
      )}

      {/* ================== نافذة تدريب القوات ================== */}
      {isTrainingOpen && (
        <TroopTrainingPanel
          close={() => setTrainingOpen(false)}
        />
      )}

      {/* ================== وضع المبنى الجديد ================== */}
      {placingBuilding && (
        <View style={styles.placementOverlay}>
          <Text style={styles.placementText}>
            اختر موقعاً لـ {BUILDINGS[placingBuilding]?.name_ar}
          </Text>
          <Text style={styles.placementHint}>
            اسحب لتحريك • انقر خارج الشاشة للإلغاء
          </Text>
        </View>
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
  placementOverlay: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    zIndex: 1000,
  },
  placementText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  placementHint: {
    color: '#AAA',
    fontSize: 12,
  },
});
