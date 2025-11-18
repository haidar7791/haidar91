// components/Map.js
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import Building from "./Building";

export default function Map({ buildings, onSelect }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#4c7a3d" }}>
      {buildings.map((b) => (
        <Building key={b.id} building={b} onSelect={onSelect} />
      ))}
    </View>
  );
}
