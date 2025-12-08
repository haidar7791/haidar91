// src/BuildingPlacement.js
import React, { useState, useRef, useMemo } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, PanResponder, Image, Text } from "react-native";
import BUILDINGS, { SHOP_ITEMS } from "./BuildingData";
import { MAP_TILES_X, MAP_TILES_Y } from "./MapConfig";

// دالة مساعدة: هل هناك مبنى يتداخل مع (x,y,size)؟
const isOverlapping = (buildings, test) => {
  for (const b of buildings || []) {
    const bw = b.size || 1;
    const bh = b.size || 1;
    const tx = test.x, ty = test.y, tw = test.size, th = test.size;
    const overlap = !(tx + tw <= b.x || tx >= b.x + bw || ty + th <= b.y || ty >= b.y + bh);
    if (overlap) return true;
  }
  return false;
};

export default function BuildingPlacement({ buildingType, gameState, onConfirmPlacement, onCancelPlacement, tileSize = 32, cameraOffset = { x: 0, y: 0 } }) {
  const [gridPos, setGridPos] = useState({ x: -1, y: -1 });
  const containerRef = useRef(null);

  const buildingData = BUILDINGS[buildingType];
  const size = buildingData?.size || 1;

  // PanResponder to move the ghost by touch (simplified)
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gesture) => {
      const touchX = gesture.moveX - (cameraOffset.x || 0);
      const touchY = gesture.moveY - (cameraOffset.y || 0);
      // تحويل إلى شبكة (افتراضي خريطة in pixels = tileSize * MAP_TILES_X)
      const mapLeft = 0;
      const mapTop = 0;
      const relX = touchX - mapLeft;
      const relY = touchY - mapTop;
      const gx = Math.floor(relX / tileSize);
      const gy = Math.floor(relY / tileSize);
      if (gx >= 0 && gy >= 0 && gx < MAP_TILES_X && gy < MAP_TILES_Y) {
        setGridPos({ x: gx, y: gy });
      } else {
        setGridPos({ x: -1, y: -1 });
      }
    },
    onPanResponderRelease: () => {},
  });

  const isColliding = useMemo(() => {
    if (gridPos.x === -1) return true;
    return isOverlapping(gameState.buildings, { x: gridPos.x, y: gridPos.y, size });
  }, [gridPos, gameState.buildings, size]);

  const confirm = () => {
    if (gridPos.x === -1) return;
    if (isColliding) {
      // منع التأكيد
      return;
    }
    onConfirmPlacement && onConfirmPlacement(buildingType, gridPos.x, gridPos.y);
  };

  return (
    <View style={styles.overlay} {...panResponder.panHandlers} ref={containerRef}>
      {gridPos.x !== -1 && (
        <View style={[styles.ghost, { left: gridPos.x * tileSize, top: gridPos.y * tileSize, width: size * tileSize, height: size * tileSize, backgroundColor: isColliding ? 'rgba(255,0,0,0.4)' : 'rgba(0,255,0,0.4)' }]}>
          <Image source={buildingData.image} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity style={[styles.button, isColliding && styles.disabledButton]} onPress={confirm} disabled={isColliding}>
          <Text style={styles.buttonText}>{isColliding ? "Cannot Place" : "Place"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => onCancelPlacement && onCancelPlacement()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0 },
  ghost: { position: "absolute", borderWidth: 1, borderColor: "#fff", justifyContent: "center", alignItems: "center" },
  controls: { position: "absolute", bottom: 20, left: 20, right: 20, flexDirection: "row", justifyContent: "space-between" },
  button: { backgroundColor: "#28a745", padding: 12, borderRadius: 8, minWidth: 120, alignItems: "center" },
  cancelButton: { backgroundColor: "#d9534f" },
  disabledButton: { backgroundColor: "#9e9e9e", opacity: 0.7 },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
