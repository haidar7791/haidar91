//src/TroopItem.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import Troop from './Troop';

export default function TroopItem({ troopId, onTrain }) {
  const troop = TROOPS[troopId];
  if (!troop) return null;

  const { name_ar, image, trainTime, cost, description } = troop;

  return (
    <View style={styles.container}>
      {/* صورة الجندي */}
      <Image source={image} style={styles.image} resizeMode="contain" />

      {/* معلومات الجندي */}
      <View style={styles.info}>
        <Text style={styles.name}>{name_ar}</Text>
        <Text style={styles.desc}>{description}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>⏱ {trainTime}ث</Text>
          <Text style={styles.label}>💰 {cost.amount} {cost.type}</Text>
        </View>
      </View>

      {/* زر التدريب */}
      <TouchableOpacity style={styles.trainBtn} onPress={() => onTrain(troopId)}>
        <Text style={styles.trainText}>تدريب</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e1e1e",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#333",
  },

  image: {
    width: 60,
    height: 60,
  },

  info: {
    flex: 1,
  },

  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  desc: {
    color: "#bbb",
    fontSize: 12,
    marginTop: 2,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },

  label: {
    color: "#ccc",
    fontSize: 13,
  },

  trainBtn: {
    backgroundColor: "#3b82f6",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  trainText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
