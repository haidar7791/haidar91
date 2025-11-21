// components/Building.js
import React from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import { BUILDINGS } from "./buildingsData";

export default function Building({ building }) {
  if (!building) return null;

  const data = BUILDINGS[building.type];
  if (!data) return null;

  const levelInfo = data.levels?.[building.level] || data.levels?.[1];
  if (!levelInfo) return null;

  return (
    <View style={styles.container}>
      <Image source={levelInfo.image} style={styles.image} />
      <Text style={styles.label}>{building.type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    margin: 5,
  },
  image: {
    width: 50,
    height: 50,
  },
  label: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "500",
  },
});
