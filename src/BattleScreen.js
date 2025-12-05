// /screens/BattleScreen.js

import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function BattleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>⚔️ ساحة المعركة — قادمة قريباً!</Text>
      <Text style={styles.sub}>هنا سيتم عرض الهجوم — القوات — الدفاع — الغنائم</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 26,
    color: "#FFF",
    marginBottom: 10,
  },
  sub: {
    fontSize: 16,
    color: "#BBB",
  },
});
