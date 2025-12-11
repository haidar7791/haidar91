// src/GridOverlay.js
import React from "react";
import { View, StyleSheet } from "react-native";

export default function GridOverlay({ width, height, tileSize, color }) {
  const rows = Math.ceil(height / tileSize) + 5;
  const cols = Math.ceil(width / tileSize) + 5;

  return (
    <View
      style={[
        styles.wrapper,
        {
          width,
          height,
        },
      ]}
    >
      {/* الشبكة المائلة */}
      <View
        style={[
          styles.rotatedGrid,
          {
            width: width * 1.5,
            height: height * 1.5,
            top: -height * 0.25, // رفع الشبكة قليلاً للأعلى
            left: -width * 0.25, // تعويض دوران الشبكة
          },
        ]}
      >
        {/* الخطوط الأفقية (بعد التدوير ستصبح خطوط مائلة) */}
        {Array.from({ length: rows }).map((_, i) => (
          <View
            key={`h_${i}`}
            style={{
              position: "absolute",
              top: i * tileSize,
              width: "100%",
              height: 1,
              backgroundColor: color,
            }}
          />
        ))}

        {/* الخطوط الرأسية */}
        {Array.from({ length: cols }).map((_, i) => (
          <View
            key={`v_${i}`}
            style={{
              position: "absolute",
              left: i * tileSize,
              height: "100%",
              width: 1,
              backgroundColor: color,
            }}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    overflow: "hidden",
  },
  rotatedGrid: {
    position: "absolute",
    transform: [{ rotate: "45deg" }],
  },
});
