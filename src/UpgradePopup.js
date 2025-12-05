// src/UpgradePopup.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function UpgradePopup({ building, onClose, onUpgrade }) {
  // إذا لم يكن هناك مبنى محدد، لا تعرض الـ popup
  if (!building) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.title}>{building.type}</Text>
        <Text style={styles.level}>Level: {building.level}</Text>

        <TouchableOpacity
          style={styles.upgradeBtn}
          onPress={() => onUpgrade(building.id)}
        >
          <Text style={styles.btnText}>Upgrade</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.btnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  popup: {
    width: 240,
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  level: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 20,
  },
  upgradeBtn: {
    backgroundColor: "#5cb85c",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  closeBtn: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 8,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
