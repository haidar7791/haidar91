// components/Map.js
import React, { useState, useEffect } from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import ResourceBar from "./ResourceBar";
import UpgradePopup from "./UpgradePopup";
import buildingsData from "../buildingsData";
import { Audio } from "expo-av";

const Map = () => {
  const [placedBuildings, setPlacedBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);

  // تحميل الأصوات
  const sounds = {
    click: require("../assets/sounds/click.mp3"),
    place: require("../assets/sounds/place.mp3"),
    upgrade: require("../assets/sounds/upgrade.mp3"),
    error: require("../assets/sounds/error.mp3"),
    collect: require("../assets/sounds/collect.mp3"),
    menu_open: require("../assets/sounds/menu_open.mp3"),
    menu_close: require("../assets/sounds/menu_close.mp3"),
    bg_loop: require("../assets/sounds/bg_loop.mp3"),
  };

  const playSound = async (name) => {
    try {
      const sound = new Audio.Sound();
      await sound.loadAsync(sounds[name]);
      await sound.playAsync();
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  // تشغيل الموسيقى الخلفية
  useEffect(() => {
    let bgSound = new Audio.Sound();

    const playBg = async () => {
      try {
        await bgSound.loadAsync(sounds.bg_loop);
        await bgSound.setIsLoopingAsync(true);
        await bgSound.setVolumeAsync(0.4);
        await bgSound.playAsync();
      } catch (e) {
        console.log("BG Sound error:", e);
      }
    };

    playBg();

    return () => {
      bgSound.unloadAsync();
    };
  }, []);

  // إضافة مبنى جديد
  const addBuilding = (type, x, y) => {
    const buildingInfo = buildingsData[type];
    if (!buildingInfo) {
      playSound("error");
      return;
    }

    const newBuilding = {
      id: Date.now(),
      type,
      level: 1,
      x,
      y,
      isUpgrading: false,
      upgradeFinishTime: null,
    };

    setPlacedBuildings((prev) => [...prev, newBuilding]);

    playSound("place");
  };

  // الضغط على الخريطة
  const handleMapPress = (event) => {
    const { locationX, locationY } = event.nativeEvent;

    // مبنى افتراضي — سيتم لاحقًا ربط المباني من القائمة
    addBuilding("Town Hall_1", locationX, locationY);
  };

  // الضغط على مبنى
  const handleBuildingPress = (building) => {
    playSound("click");
    setSelectedBuilding(building);
  };

  // عملية الترقية
  const upgradeBuilding = (id) => {
    setPlacedBuildings((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, level: b.level + 1 }
          : b
      )
    );

    playSound("upgrade");
  };

  return (
    <View style={styles.container}>
      <ResourceBar />

      <Pressable style={styles.mapContainer} onPress={handleMapPress}>
        <Image
          source={require("../assets/images/Gamefloor.png")}
          style={styles.mapImage}
        />

        {placedBuildings.map((b) => {
          const sprite = buildingsData[b.type]?.sprite;

          return (
            <Pressable
              key={b.id}
              onPress={() => handleBuildingPress(b)}
              style={{
                position: "absolute",
                left: b.x - 40,
                top: b.y - 40,
              }}
            >
              <Image
                source={sprite}
                style={{ width: 80, height: 80 }}
              />
            </Pressable>
          );
        })}
      </Pressable>

      {selectedBuilding && (
        <UpgradePopup
          building={selectedBuilding}
          onClose={() => {
            playSound("menu_close");
            setSelectedBuilding(null);
          }}
          onUpgrade={() => upgradeBuilding(selectedBuilding.id)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
  },
  mapImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});

export default Map;
