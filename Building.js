import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function Building({ building, upgradeBuilding }) {

  return (
    <TouchableOpacity
      style={[styles.building, { left: building.x, top: building.y }]}
      onPress={() => upgradeBuilding(building)}
    >
      <Text>{building.type} Lv{building.level}</Text>
      {building.upgrading && <Text>Upgrading...</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  building: {
    position: "absolute",
    width: 60,
    height: 60,
    backgroundColor: "#f4e842",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 5
  }
});
