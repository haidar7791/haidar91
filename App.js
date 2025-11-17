import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Alert, FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Map from "./components/Map";

export default function App() {
  const [gold, setGold] = useState(2000);
  const [elixir, setElixir] = useState(1500);
  const [buildings, setBuildings] = useState([]);
  const [isSelectingBuilding, setIsSelectingBuilding] = useState(false);

  const buildingTypes = [
    { id: "castle", name: "قلعة", cost: 1000 },
    { id: "laser_tower", name: "برج الليزر", cost: 600 },
    { id: "cobalt_mine", name: "منجم الكوبالت", cost: 400 },
    { id: "elixir_extractor", name: "مستخرج الإكسير", cost: 350 },
    { id: "cannon", name: "مدفع", cost: 250 },
    { id: "builder_hut", name: "كوخ بناء", cost: 150 },
  ];

  // --- LOAD SAVED VILLAGE ---
  useEffect(() => {
    const loadGame = async () => {
      try {
        const saved = await AsyncStorage.getItem("VILLAGE_DATA");
        if (saved) {
          const data = JSON.parse(saved);
          setGold(data.gold);
          setElixir(data.elixir);
          setBuildings(data.buildings);
        }
      } catch (err) {
        console.log("Load error:", err);
      }
    };
    loadGame();
  }, []);

  // --- SAVE ON ANY CHANGE ---
  useEffect(() => {
    const saveGame = async () => {
      const data = { gold, elixir, buildings };
      await AsyncStorage.setItem("VILLAGE_DATA", JSON.stringify(data));
    };
    saveGame();
  }, [gold, elixir, buildings]);

  // Add a building
  const placeBuilding = (type) => {
    if (gold < type.cost) {
      Alert.alert("تنبيه", "ما عندك ذهب كافي!");
      return;
    }

    const newBuilding = {
      id: Date.now().toString(),
      type: type.id,
      level: 1,
      x: 150,
      y: 200,
    };

    setBuildings([...buildings, newBuilding]);
    setGold(gold - type.cost);
    setIsSelectingBuilding(false);
  };

  // Upgrade a building
  const upgradeBuilding = (id) => {
    const newList = buildings.map((b) => {
      if (b.id === id) {
        const price = b.level * 200;
        if (gold < price) {
          Alert.alert("تنبيه", "لا تملك ذهب كافٍ للترقية!");
          return b;
        }
        setGold(gold - price);
        return { ...b, level: b.level + 1 };
      }
      return b;
    });

    setBuildings(newList);
  };

  // Move building
  const updatePosition = (id, x, y) => {
    const updated = buildings.map((b) =>
      b.id === id ? { ...b, x, y } : b
    );
    setBuildings(updated);
  };

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("./assets/images/ground.png")}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        {/* RESOURCES BAR */}
        <View style={styles.resourceBar}>
          <Text style={styles.resText}>💰 الذهب: {gold}</Text>
          <Text style={styles.resText}>🧪 الإكسير: {elixir}</Text>
        </View>

        {/* GAME MAP */}
        <Map
          buildings={buildings}
          onUpgrade={upgradeBuilding}
          onMove={updatePosition}
        />

        {/* ADD BUILDING BUTTON */}
        {!isSelectingBuilding && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setIsSelectingBuilding(true)}
          >
            <Text style={{ color: "#fff", fontSize: 18 }}>➕ إضافة مبنى</Text>
          </TouchableOpacity>
        )}

        {/* BUILDING SELECTION MENU */}
        {isSelectingBuilding && (
          <View style={styles.selectionMenu}>
            <Text style={styles.menuTitle}>اختر المبنى:</Text>

            <FlatList
              data={buildingTypes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => placeBuilding(item)}
                >
                  <Text style={styles.menuItemText}>
                    {item.name} — {item.cost} ذهب
                  </Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setIsSelectingBuilding(false)}
            >
              <Text style={{ color: "#fff" }}>إلغاء</Text>
            </TouchableOpacity>
          </View>
        )}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  resourceBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingVertical: 10,
  },
  resText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  addBtn: {
    position: "absolute",
    bottom: 25,
    alignSelf: "center",
    backgroundColor: "#1e88e5",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  selectionMenu: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "50%",
    backgroundColor: "#222",
    padding: 15,
  },
  menuTitle: {
    color: "#fff",
    fontSize: 20,
    marginBottom: 10,
  },
  menuItem: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  menuItemText: {
    color: "#fff",
    fontSize: 16,
  },
  cancelBtn: {
    marginTop: 10,
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
  },
});
