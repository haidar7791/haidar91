// src/Map.js
import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";

import MovableBuilding from "./MovableBuilding";
import Camera from "./Camera";
import ShopButton from "./ShopButton";
import BUILDINGS from "./BuildingData";
import UpgradePopup from "./UpgradePopup";

const { width: screenW, height: screenH } = Dimensions.get("window");

const MAP_WIDTH = screenW;
const MAP_HEIGHT = screenH;

const ACTIVE_ZONE_PERCENT = 0.99;
const ACTIVE_SIZE = Math.floor(screenW * ACTIVE_ZONE_PERCENT);

const TILE_SIZE = ACTIVE_SIZE / 20;

export default function Map({
  gameState,
  onStartUpgrade,
  onMoveBuilding,
  onOpenShop,
  onCancelPlacement,
  onConfirmPlacement,
  onSelectBuilding,
}) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [currentCameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  const handleCameraOffsetChange = useCallback((offset) => {
    setCameraOffset(offset);
  }, []);

  // عندما تتغير المباني، تحديث المبنى المحدد
  useEffect(() => {
    if (selectedBuilding) {
      const refreshed = (gameState.buildings || []).find(b => b.id === selectedBuilding.id);
      if (refreshed) setSelectedBuilding(refreshed);
      else setSelectedBuilding(null);
    }
  }, [gameState.buildings]);

  // ✅ تحسين: دالة مبسطة لعرض المباني في طبقة واحدة
  function renderBuildings() {
    const buildings = gameState.buildings || [];

    // ✅ ترتيب المباني حسب العمق (Y) لضمان المنظور البصري الصحيح
    return buildings
      .sort((a, b) => (a.y + (BUILDINGS[a.type]?.size || 1)) - (b.y + (BUILDINGS[b.type]?.size || 1)))
      .map((b) => {
        const buildingData = BUILDINGS[b.type];
        if (!buildingData) return null;

        return (
          <MovableBuilding
            key={`building_${b.id}_${b.type}_${b.x}_${b.y}`}
            building={b}
            buildingData={buildingData}
            tileSize={TILE_SIZE}
            mapWidth={ACTIVE_SIZE}
            mapHeight={ACTIVE_SIZE}
            isSelected={selectedBuilding?.id === b.id}
            onPress={(bb) => {
              setSelectedBuilding(bb);
              if (onSelectBuilding) onSelectBuilding(bb);
            }}
            onMoveStart={() => {
              // مؤقت: يمكنك إضافة مؤشر التحرير
            }}
            onMoveEnd={(moveObj) => {
              if (onMoveBuilding) onMoveBuilding(moveObj);
            }}
            gameBuildings={gameState.buildings || []}
            // ✅ إزالة zIndex الثابت للسماح للنظام الديناميكي بالعمل
            style={{ }}
          />
        );
      });
  }

  return (
    <View style={styles.fullScreen}>
      <TouchableOpacity
        activeOpacity={1}
        style={styles.fullScreen}
        onPress={() => {
          setSelectedBuilding(null);
          if (onSelectBuilding) onSelectBuilding(null);
          onOpenShop(false);
        }}
      >
        <Camera
          mapWidth={MAP_WIDTH}
          mapHeight={MAP_HEIGHT}
          onCameraOffsetChange={handleCameraOffsetChange}
        >
          <View style={styles.mapContainer}>
            {/* ✅ الخلفية */}
            <Image
              source={require("../assets/images/Game_floor.jpg")}
              style={styles.backgroundImage}
            />

            {/* ✅ طبقة المباني الواحدة - مبسطة */}
            <View
              style={[
                styles.buildingLayer,
                {
                  width: ACTIVE_SIZE,
                  height: ACTIVE_SIZE,
                  left: (MAP_WIDTH - ACTIVE_SIZE) / 2,
                  top: (MAP_HEIGHT - ACTIVE_SIZE) / 2,
                },
              ]}
            >
              {renderBuildings()}
            </View>
          </View>
        </Camera>
      </TouchableOpacity>

      {/* نافذة الترقية */}
      {selectedBuilding && (
        <UpgradePopup
          building={selectedBuilding}
          buildingData={BUILDINGS[selectedBuilding.type]}
          currentResources={gameState.resources}
          currentTime={Date.now()}
          townHallLevel={gameState.buildings?.find(b => b.type === "Town_Hall")?.level || 1} // ✅ تمرير المستوى الفعلي
          onClose={() => setSelectedBuilding(null)}
          onUpgrade={(buildingId, durationMs, costObj) => {
            if (onStartUpgrade) onStartUpgrade(buildingId, durationMs, costObj);
            setSelectedBuilding(null);
          }}
        />
      )}

      {/* زر المتجر */}
      <ShopButton
        onPress={() => onOpenShop(true)}
        style={styles.shopButtonPlacement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#1b4d2e",
    overflow: 'hidden', // ✅ منع التجاوزات
  },
  mapContainer: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    position: 'relative',
  },
  backgroundImage: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    position: "absolute",
    resizeMode: "cover", // ✅ تغيير من stretch إلى cover
  },
  buildingLayer: {
    position: "absolute",
    // ✅ إزالة أي تأثيرات طبقات
    elevation: 1,
    zIndex: 1,
  },
  shopButtonPlacement: {
    position: "absolute",
    bottom: 10,
    left: screenW / 2 - 50,
    zIndex: 100, // ✅ أعلى من المباني
  },
});
