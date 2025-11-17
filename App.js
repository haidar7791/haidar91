import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Map from "./components/Map";

export default function App() {
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const data = await AsyncStorage.getItem("buildings");
      if (data) setBuildings(JSON.parse(data));
    } catch (error) {
      Alert.alert("Error", "Failed to load buildings");
    }
  };

  const saveBuildings = async (newBuildings) => {
    try {
      await AsyncStorage.setItem("buildings", JSON.stringify(newBuildings));
      setBuildings(newBuildings);
    } catch (error) {
      Alert.alert("Error", "Failed to save buildings");
    }
  };

  const addBuilding = () => {
    const newBuilding = {
      id: Date.now().toString(),
      type: "house",
      level: 1,
      x: 50,
      y: 50
    };
    saveBuildings([...buildings, newBuilding]);
  };

  return (
    <View style={styles.container}>
      <Map buildings={buildings} setBuildings={setBuildings} saveBuildings={saveBuildings} />
      <Button title="Add Building" onPress={addBuilding} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50
  }
});
