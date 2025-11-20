// src/components/Building.js
import React from "react";
import { View, Image, Text, TouchableOpacity } from "react-native";
import { BUILDINGS } from ".data/buildingsData";

export default function Building({ building, onSelect }) {
  const data = BUILDINGS[building.type];
  const levelInfo = data.levels ? data.levels[building.level] : null;

  return (
    <TouchableOpacity
      style={{
        position: "absolute",
        left: building.x,
        top: building.y,
        alignItems: "center",
      }}
      onPress={() => onSelect(building)}
    >
      <Image
        source={levelInfo ? levelInfo.image : data.image}
        style={{ width: 80, height: 80 }}
        resizeMode="contain"
      />

      {building.upgrading && (
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: 4,
            borderRadius: 4,
            marginTop: -10,
          }}
        >
          <Text style={{ color: "white", fontSize: 12 }}>
            {building.remainingTime}s
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
