import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Map from "./components/Map";

export default function App() {
  const [buildings, setBuildings] = useState([]);
  const [resources, setResources] = useState({
    cobalt: 1000,
    mercury: 500,
    crystals: 10
  });

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

  const addBuilding = (type) => {
    if(type === "worker_hut" && buildings.filter(b => b.type==="worker_hut").length >= 4){
      Alert.alert("Limit reached", "Maximum 4 huts allowed");
      return;
    }
    let cost = 0;
    if(type === "worker_hut" && buildings.length > 0) cost = 1;
    if(type === "worker_hut" && buildings.length === 0) cost = 0;

    if(resources.crystals < cost){
      Alert.alert("Not enough crystals");
      return;
    }

    const newBuilding = {
      id: Date.now().toString(),
      type: type,
      level: 1,
      x: 50,
      y: 50,
      upgrading: false
    };

    if(cost > 0){
      setResources(prev => ({...prev, crystals: prev.crystals - cost}));
    }

    saveBuildings([...buildings, newBuilding]);
  };

  const upgradeBuilding = (building) => {
    if(building.level >= getMaxLevel(building.type)) {
      Alert.alert("Max Level Reached");
      return;
    }

    let costResource = getUpgradeResource(building.type);
    let costAmount = 100 * building.level;

    if(resources[costResource] < costAmount){
      Alert.alert(`Not enough ${costResource}`);
      return;
    }

    setResources(prev => ({...prev, [costResource]: prev[costResource]-costAmount}));
    setBuildings(prev => {
      const updated = prev.map(b => b.id === building.id ? {...b, upgrading:true} : b);
      saveBuildings(updated);
      return updated;
    });

    setTimeout(() => {
      setBuildings(prev => {
        const updated = prev.map(b => {
          if(b.id === building.id) return {...b, level:b.level+1, upgrading:false};
          return b;
        });
        saveBuildings(updated);
        return updated;
      });
    }, 5000);
  };

  const getUpgradeResource = (type) => {
    if(type === "castle") return "cobalt";
    if(type === "worker_hut") return "crystals";
    return "mercury";
  };

  const getMaxLevel = (type) => {
    const levels = {
      "castle": 5,
      "laser_tower": 5,
      "cannon": 3,
      "cobalt_mine": 5,
      "worker_hut": 1,
      "mercury_extractor": 6,
      "mercury_storage": 6,
      "cobalt_storage": 5
    };
    return levels[type] || 1;
  };

  return (
    <View style={styles.container}>
      <Text>Resources:</Text>
      <Text>Cobalt: {resources.cobalt}</Text>
      <Text>Mercury: {resources.mercury}</Text>
      <Text>Crystals: {resources.crystals}</Text>

      <Map buildings={buildings} setBuildings={setBuildings} upgradeBuilding={upgradeBuilding} />

      <Button title="Add Castle" onPress={()=>addBuilding("castle")} />
      <Button title="Add Laser Tower" onPress={()=>addBuilding("laser_tower")} />
      <Button title="Add Cannon" onPress={()=>addBuilding("cannon")} />
      <Button title="Add Cobalt Mine" onPress={()=>addBuilding("cobalt_mine")} />
      <Button title="Add Worker Hut" onPress={()=>addBuilding("worker_hut")} />
      <Button title="Add Mercury Extractor" onPress={()=>addBuilding("mercury_extractor")} />
      <Button title="Add Mercury Storage" onPress={()=>addBuilding("mercury_storage")} />
      <Button title="Add Cobalt Storage" onPress={()=>addBuilding("cobalt_storage")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50
  }
});
