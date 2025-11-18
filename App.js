import React, { useEffect, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Map from "./components/Map";
import { BUILDINGS } from "./components/buildingsData";

export default function App() {
  const [resources, setResources] = useState({
    mercury: 500,
    cobalt: 300,
    crystal: 1,
  });

  const [builders, setBuilders] = useState(1);
  const [busyBuilders, setBusyBuilders] = useState(0);

  const [buildings, setBuildings] = useState([]);
  const [selected, setSelected] = useState(null);

  // Load saved data
  useEffect(() => {
    loadGame();
  }, []);

  async function loadGame() {
    const saved = await AsyncStorage.getItem("game");
    if (saved) {
      const data = JSON.parse(saved);
      setBuildings(data.buildings);
      setResources(data.resources);
      setBuilders(data.builders);
      setBusyBuilders(data.busyBuilders);
    }
  }

  async function saveGame() {
    await AsyncStorage.setItem(
      "game",
      JSON.stringify({ buildings, resources, builders, busyBuilders })
    );
  }

  useEffect(() => {
    saveGame();
  }, [buildings, resources, builders, busyBuilders]);

  function addBuilding(type) {
    const id = Date.now().toString();

    if (type === "builderHut" && buildings.filter(b => b.type === "builderHut").length >= 4)
      return Alert.alert("لا يمكنك إضافة أكثر من 4 أكواخ بناء");

    const price = BUILDINGS[type].price || 0;
    if (resources.crystal < price)
      return Alert.alert("لا يوجد كريستال كافٍ");

    setResources(r => ({ ...r, crystal: r.crystal - price }));

    setBuildings((b) => [
      ...b,
      { id, type, level: 1, x: 150, y: 150, upgrading: false, remainingTime: 0 },
    ]);

    if (type === "builderHut") setBuilders(n => n + 1);
  }

  function startUpgrade(building) {
    if (busyBuilders >= builders)
      return Alert.alert("جميع البنّائين مشغولين");

    const data = BUILDINGS[building.type];
    if (building.level >= data.maxLevel)
      return Alert.alert("المبنى في أقصى مستوى");

    const next = data.levels[building.level + 1];

    if (resources[data.resource] < next.cost)
      return Alert.alert("الموارد غير كافية");

    setResources(r => ({
      ...r,
      [data.resource]: r[data.resource] - next.cost,
    }));

    setBusyBuilders(n => n + 1);

    setBuildings((arr) =>
      arr.map((b) =>
        b.id === building.id
          ? {
              ...b,
              upgrading: true,
              remainingTime: next.time,
            }
          : b
      )
    );
  }

  // Timer
  useEffect(() => {
    const t = setInterval(() => {
      setBuildings((arr) =>
        arr.map((b) => {
          if (b.upgrading && b.remainingTime > 0)
            return { ...b, remainingTime: b.remainingTime - 1 };

          if (b.upgrading && b.remainingTime <= 1) {
            setBusyBuilders((n) => n - 1);
            return {
              ...b,
              upgrading: false,
              level: b.level + 1,
              remainingTime: 0,
            };
          }

          return b;
        })
      );
    }, 1000);

    return () => clearInterval(t);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 10, backgroundColor: "#222", flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ color: "white" }}>Mercury: {resources.mercury}</Text>
        <Text style={{ color: "white" }}>Cobalt: {resources.cobalt}</Text>
        <Text style={{ color: "white" }}>Crystal: {resources.crystal}</Text>
        <Text style={{ color: "white" }}>Builders: {busyBuilders}/{builders}</Text>
      </View>

      <Map buildings={buildings} onSelect={setSelected} />

      <View style={{ padding: 10, backgroundColor: "#333" }}>
        <Button title="إضافة برج ليزر" onPress={() => addBuilding("laserTower")} />
        <Button title="إضافة مدفع" onPress={() => addBuilding("cannon")} />
        <Button title="إضافة كوخ بناء" onPress={() => addBuilding("builderHut")} />
        <Button title="ترقية المبنى المحدد" onPress={() => selected && startUpgrade(selected)} />
      </View>
    </View>
  );
}
