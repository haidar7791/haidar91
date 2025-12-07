// src/Map.js — نسخة كاملة مصححة 100%

import React, { useState, useCallback } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";

import MovableBuilding from "./MovableBuilding";
import BuildingPlacement from "./BuildingPlacement";
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
}) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingToMove, setBuildingToMove] = useState(null);
  const [buildingToPlaceType, setBuildingToPlaceType] = useState(null);

  const [currentCameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  const handleCameraOffsetChange = useCallback((offset) => {
    setCameraOffset(offset);
  }, []);

  // ======================================================
  // عرض المباني مع إصلاح key لتفادي Duplicate keys error
  // ======================================================
  function renderBuildings() {
    return gameState.buildings.map((b) => {
      const buildingData = BUILDINGS[b.type];
      if (!buildingData) return null;

      return (
        <MovableBuilding
          key={String(b.id) + "_" + b.type}
          building={b}
          buildingData={buildingData}
          tileSize={TILE_SIZE}
          mapWidth={ACTIVE_SIZE}
          mapHeight={ACTIVE_SIZE}
          isSelected={selectedBuilding?.id === b.id}
          onPress={() => setSelectedBuilding(b)}
        />
      );
    });
  }

  return (
    <View style={styles.fullScreen}>
      <Camera
        mapWidth={MAP_WIDTH}
        mapHeight={MAP_HEIGHT}
        onCameraOffsetChange={handleCameraOffsetChange}
      >
        <View style={styles.mapContainer}>
          <Image
            source={require("../assets/images/Game_floor.jpg")}
            style={styles.backgroundImage}
          />

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

            {/* عند تحريك مبنى */}
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

      {/* وضع مبنى جديد */}
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

      {/* نافذة معلومات + ترقية */}
      {selectedBuilding && (
        <UpgradePopup
          building={selectedBuilding}
          buildingData={BUILDINGS[selectedBuilding.type]}
          currentResources={gameState.resources}
          currentTime={Date.now()}
          onClose={() => setSelectedBuilding(null)}
          onUpgrade={(buildingId, durationMs, costObj) => {
            onStartUpgrade(buildingId, durationMs, costObj);
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
  },

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
