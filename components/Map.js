import React from "react";
import { View, StyleSheet } from "react-native";
import Building from "./Building";

export default function Map({ buildings, setBuildings, saveBuildings }) {
  return (
    <View style={styles.map}>
      {buildings.map((b) => (
        <Building
          key={b.id}
          building={b}
          setBuildings={setBuildings}
          saveBuildings={saveBuildings}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    backgroundColor: "#a3d9a5"
  }
});
