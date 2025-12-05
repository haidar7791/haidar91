// src/ShopButton.js
import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";

export default function ShopButton({ onPress }) {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <View style={styles.innerCircle}>
        <Text style={styles.icon}>🛠️</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 140,
    right: 12,
    width: 50,
    height: 50,
    backgroundColor: "#222",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  innerCircle: {
    width: 50,
    height: 50,
    backgroundColor: "#444",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 28,
    color: "white",
  },
});
