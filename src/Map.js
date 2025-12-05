// Map.js (الشبكة النشطة مائلة 45 درجة داخليًا)

import React, { useState, useCallback, useRef, useMemo } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  MAP_TILES_X,
  MAP_TILES_Y,
  BuildingInfoPanel,
  MovableBuilding,
  Camera,
  BUILDINGS,
  TimeUtils,
  ShopButton,
  BuildingPlacement, 
} from "./exports";

const { width: screenW, height: screenH } = Dimensions.get("window");

const MAP_WIDTH = screenW;
const MAP_HEIGHT = screenH;

const ACTIVE_ZONE_PERCENT = 0.99;
const ACTIVE_SIZE = Math.floor(screenW * ACTIVE_ZONE_PERCENT);

const TILE_SIZE = ACTIVE_SIZE / MAP_TILES_X;

export default function Map({
  gameState,
  onStartUpgrade,
  onMoveBuilding,
  onPlayClick,
  onOpenShop,
  onConfirmPlacement,
  onCancelPlacement,
}) {
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [buildingToMove, setBuildingToMove] = useState(null);
  const [currentCameraOffset, setCurrentCameraOffset] = useState({
    x: 0,
    y: 0,
  });
  
  const [buildingToPlaceType, setBuildingToPlaceType] = useState(null); 

  const handleCameraOffsetChange = useCallback((offset) => {
    setCurrentCameraOffset(offset);
  }, []);
  
  // ----------------------------------------------------
  // وظيفة عرض المباني (مستوية)
  function renderBuildings() {
    return gameState.buildings.map((b) => {
      const buildingData = BUILDINGS[b.type];

      if (!buildingData) {
        console.error(`Building data missing for type: ${b.type}`);
        return null;
      }

      return (
        <MovableBuilding
          key={b.id}
          building={b}
          buildingData={buildingData}
          tileSize={TILE_SIZE}
          mapWidth={ACTIVE_SIZE}
          mapHeight={ACTIVE_SIZE}
          isSelected={selectedBuilding && selectedBuilding.id === b.id}
        />
      );
    });
  }

  // وظيفة عرض المبنى المتحرك
  function renderMovingBuilding() {
    if (!buildingToMove) return null;
    const buildingData = BUILDINGS[buildingToMove.type];

    if (!buildingData) return null;

    return (
      <MovableBuilding
        building={buildingToMove}
        buildingData={buildingData}
        tileSize={TILE_SIZE}
        mapWidth={ACTIVE_SIZE}
        mapHeight={ACTIVE_SIZE}
        isMoving={true}
      />
    );
  }

  // 🛑 وظيفة عرض الشبكة النشطة (مائلة 45 درجة)
  function renderActiveGrid() {
    // 🛑 يتم إرجاع View مائل 45 درجة بدلاً من null
    return (
      <View 
        style={{
          ...StyleSheet.absoluteFillObject,
          transform: [{ rotate: "45deg" }], // 🛑 تطبيق الميلان 45 درجة هنا
          backgroundColor: "rgba(0,0,0,0.1)", 
          overflow: "hidden",
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        {/* هنا ستظهر خطوط الشبكة المائلة */}
      </View>
    );
  }
  
  // ----------------------------------------------------
  
  const handleConfirmPlacement = (gridX, gridY) => {
      if (onConfirmPlacement) {
          onConfirmPlacement(buildingToPlaceType, gridX, gridY);
      }
      setBuildingToPlaceType(null); 
  };

  const handleCancelPlacement = () => {
      if (onCancelPlacement) {
          onCancelPlacement();
      }
      setBuildingToPlaceType(null); 
  };

  // ----------------------------------------------------
  
  return (
    <View style={styles.fullScreen}>
      <Camera
        mapWidth={MAP_WIDTH}
        mapHeight={MAP_HEIGHT}
        onCameraOffsetChange={handleCameraOffsetChange}
      >
        <View style={styles.mapContainer}>
          
          {/* 🖼️ 1. صورة الأرضية (في الأسفل) */}
          <Image
            source={require("../assets/images/Game_floor.jpg")}
            style={styles.backgroundImage}
          />

          {/* 🏗️ 2. طبقة المباني (مستوية - تحتوي على الشبكة المائلة) */}
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
            {/* 🛑 يتم عرض الشبكة المائلة هنا */}
            {renderActiveGrid()} 
            
            {/* المباني تظهر مستوية فوق الشبكة المائلة */}
            {renderBuildings()}
            {renderMovingBuilding()}
          </View>

        </View>
      </Camera>

      {/* 🛑 استدعاء شاشة وضع المبنى */}
      {buildingToPlaceType && (
          <BuildingPlacement
              buildingType={buildingToPlaceType}
              gameState={gameState}
              onConfirmPlacement={handleConfirmPlacement}
              onCancelPlacement={handleCancelPlacement}
              tileSize={TILE_SIZE} 
              cameraOffset={currentCameraOffset} 
              // ⚠️ يجب التأكد من أن BuildingPlacement.js مستوٍ (Flat) ليتناسب مع الخريطة الآن
          />
      )}
      
      {selectedBuilding && (
        <BuildingInfoPanel
          building={selectedBuilding}
          buildingData={BUILDINGS[selectedBuilding.type]}
          currentResources={gameState.resources}
          onClose={() => setSelectedBuilding(null)}
          onStartMove={() => { /* handleStartMove(selectedBuilding) */ }}
          onStartUpgrade={() => onStartUpgrade(selectedBuilding)}
          currentTime={TimeUtils.now()}
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

  // 🛑 تم تنظيف هذا النمط ليصبح حاوية مستوية للمباني
  buildingLayer: {
    position: "absolute",
    // ❌ لا يوجد ميلان هنا
  },

  gridTile: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  shopButtonPlacement: {
    position: "absolute",
    bottom: 10,
    left: screenW / 2 - 50,
  },
});

