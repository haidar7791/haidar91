import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";

export default function Building({ building, setBuildings, saveBuildings }) {
  const upgrade = () => {
    const newLevel = building.level + 1;
    const updatedBuilding = { ...building, level: newLevel };
    setBuildings(prev => {
      const other = prev.filter(b => b.id !== building.id);
      const updated = [...other, updatedBuilding];
      saveBuildings(updated);
      return updated;
    });
  };

  return (
    <TouchableOpacity
      style={[styles.building, { left: building.x, top: building.y }]}
      onPress={upgrade}
    >
      <Text>{building.type} Lv{building.level}</Text>
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
