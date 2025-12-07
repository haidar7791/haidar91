// Map.js — نسخة خالية من الإيزومتريك + استيرادات مباشرة وصحيحة

import React, { useState, useCallback, useMemo } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";

// ⚠️ استيرادات مباشرة من الملفات الأصلية وليس exports.js
import MovableBuilding from "./MovableBuilding";
import BuildingPlacement from "./BuildingPlacement";
import Camera from "./Camera";
import BuildingInfoPanel from "./BuildingInfoPanel";
import ShopButton from "./ShopButton";
import BUILDINGS from "./BuildingData";
import TimeUtils from "./TimeUtils";

const { width: screenW, height: screenH } = Dimensions.get("window");

const MAP_WIDTH = screenW;
const MAP_HEIGHT = screenH;

const ACTIVE_ZONE_PERCENT = 0.99;
const ACTIVE_SIZE = Math.floor(screenW * ACTIVE_ZONE_PERCENT);

const TILE_SIZE = ACTIVE_SIZE / 20; // عدد مربعات الشبكة (عدّل إذا لزم)

export default function Map({
  gameState,
  onStartUpgrade,
  onMoveBuilding,
  onOpenShop,
  onConfirmPlacement,
  onCancelPlacement,
}) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingToMove, setBuildingToMove] = useState(null);
  const [buildingToPlaceType, setBuildingToPlaceType] = useState(null);

  const [currentCameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  const handleCameraOffsetChange = useCallback((offset) => {
    setCameraOffset(offset);
  }, []);

  // ----------------------------------------------------
  // عرض المباني بشكل مستوٍ على الخريطة (بدون إيزومترك)
  function renderBuildings() {
    return gameState.buildings.map((b) => {
      const buildingData = BUILDINGS[b.type];
      if (!buildingData) return null;

      return (
        <MovableBuilding
          key={b.id}
          building={b}
          buildingData={buildingData}
          tileSize={TILE_SIZE}
          mapWidth={ACTIVE_SIZE}
          mapHeight={ACTIVE_SIZE}
          isSelected={selectedBuilding?.id === b.id}
        />
      );
    });
  }

  // ----------------------------------------------------

  return (
    <View style={styles.fullScreen}>
      <Camera
        mapWidth={MAP_WIDTH}
        mapHeight={MAP_HEIGHT}
        onCameraOffsetChange={handleCameraOffsetChange}
      >
        <View style={styles.mapContainer}>

          {/* الأرضية */}
          <Image
            source={require("../assets/images/Game_floor.jpg")}
            style={styles.backgroundImage}
          />

          {/* طبقة المباني */}
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

            {buildingToMove && (
              <MovableBuilding
                building={buildingToMove}
                buildingData={BUILDINGS[buildingToMove.type]}
                tileSize={TILE_SIZE}
                mapWidth={ACTIVE_SIZE}
                mapHeight={ACTIVE_SIZE}
                isMoving={true}
              />
            )}
          </View>
        </View>
      </Camera>

      {/* وضع المبنى */}
      {buildingToPlaceType && (
        <BuildingPlacement
          buildingType={buildingToPlaceType}
          gameState={gameState}
          onConfirmPlacement={onConfirmPlacement}
          onCancelPlacement={onCancelPlacement}
          tileSize={TILE_SIZE}
          cameraOffset={currentCameraOffset}
        />
      )}

      {/* لوحة معلومات المبنى */}
      {selectedBuilding && (
        <BuildingInfoPanel
          building={selectedBuilding}
          buildingData={BUILDINGS[selectedBuilding.type]}
          currentResources={gameState.resources}
          onClose={() => setSelectedBuilding(null)}
          onStartUpgrade={() => onStartUpgrade(selectedBuilding)}
          currentTime={TimeUtils.now()}
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
  fullScreen: { flex: 1, backgroundColor: "#1b4d2e" },

  mapContainer: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
  },

  backgroundImage: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    position: "absolute",
    resizeMode: "stretch",
  },

  buildingLayer: {
    position: "absolute",
  },

  shopButtonPlacement: {
    position: "absolute",
    bottom: 10,
    left: screenW / 2 - 50,
  },
});
