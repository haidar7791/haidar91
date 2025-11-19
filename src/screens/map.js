import React, { useState } from "react";
import { View, Image, Pressable, StyleSheet, Dimensions } from "react-native";
import { buildings } from "../data/buildings";

const screenWidth = Dimensions.get("window").width;
const GRID_SIZE = 14; // حجم الخريطة 14×14
const CELL_SIZE = screenWidth / GRID_SIZE;

export default function MapScreen() {
  const [placedBuildings, setPlacedBuildings] = useState([]);

  // وضع مبنى جديد على الخريطة
  const placeBuilding = (type, x, y) => {
    setPlacedBuildings((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        level: 0,
        x,
        y,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* صورة أرضية اللعبة */}
      <Image
        source={require("../../assets/images/Game floor.png")}
        style={styles.mapBackground}
      />

      {/* شبكة المربعات */}
      {Array.from({ length: GRID_SIZE }).map((_, row) =>
        Array.from({ length: GRID_SIZE }).map((_, col) => (
          <Pressable
            key={`${row}-${col}`}
            style={[styles.cell, { left: col * CELL_SIZE, top: row * CELL_SIZE }]}
            onPress={() => placeBuilding("townHall", col, row)} // مؤقتًا نضع TownHall، ستتغير لاحقًا
          />
        ))
      )}

      {/* المباني الموضوعة */}
      {placedBuildings.map((b) => {
        const img = buildings[b.type].levels
          ? buildings[b.type].levels[b.level]
          : buildings[b.type].image;

        return (
          <Image
            key={b.id}
            source={img}
            style={{
              position: "absolute",
              width: CELL_SIZE * 1.4,
              height: CELL_SIZE * 1.4,
              left: b.x * CELL_SIZE,
              top: b.y * CELL_SIZE,
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  mapBackground: {
    position: "absolute",
    width: screenWidth,
    height: screenWidth,
    resizeMode: "cover",
  },

  cell: {
    position: "absolute",
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.3,
    borderColor: "rgba(255,255,255,0.15)",
  },
});
