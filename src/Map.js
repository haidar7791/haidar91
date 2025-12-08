// src/Map.js
import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, Dimensions, Image } from "react-native";

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
  onSelectBuilding, // optional but kept for compatibility
}) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [currentCameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  const handleCameraOffsetChange = useCallback((offset) => {
    setCurrentCameraOffset(offset);
  }, []);

  // when gameState.buildings changed, refresh selectedBuilding reference so popup continues to show & update
  useEffect(() => {
    if (selectedBuilding) {
      const refreshed = (gameState.buildings || []).find(b => b.id === selectedBuilding.id);
      if (refreshed) setSelectedBuilding(refreshed);
      else setSelectedBuilding(null);
    }
  }, [gameState.buildings]);

  function renderBuildings() {
    return (gameState.buildings || []).map((b) => {
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
          onPress={(bb) => {
            setSelectedBuilding(bb);
            if (onSelectBuilding) onSelectBuilding(bb);
          }}
          onMoveStart={() => {
            // optional: you may highlight or lock UI while moving
          }}
          onMoveEnd={(moveObj) => {
            // forward to parent hook
            if (onMoveBuilding) onMoveBuilding(moveObj);
          }}
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
          </View>
        </View>
      </Camera>

      {selectedBuilding && (
        <UpgradePopup
          building={selectedBuilding}
          buildingData={BUILDINGS[selectedBuilding.type]}
          currentResources={gameState.resources}
          currentTime={Date.now()}
          onClose={() => setSelectedBuilding(null)}
          onUpgrade={(buildingId, durationMs, costObj) => {
            if (onStartUpgrade) onStartUpgrade(buildingId, durationMs, costObj);
            setSelectedBuilding(null);
          }}
        />
      )}

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
