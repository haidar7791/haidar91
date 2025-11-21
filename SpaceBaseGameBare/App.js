// App.js
import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, StatusBar, ActivityIndicator, Platform } from "react-native";
import { Asset } from "expo-asset";
import * as SplashScreen from "expo-splash-screen";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Map from "./components/Map";
import ResourceBar from "./components/ResourceBar";
import UpgradePopup from "./components/UpgradePopup";
import ShopItem from "./components/ShopItem";
import TimerDisplay from "./components/TimerDisplay";

import { initialGameState } from "./src/store/gameState";

// Preload list — must match files in ./assets/images and ./assets/sounds
const IMAGE_ASSETS = [
  require("./assets/images/Gamefloor.png"),
  require("./assets/images/Game icon.png"),
  require("./assets/images/Town Hall_1.png"),
  require("./assets/images/Town Hall_2.png"),
  require("./assets/images/Town Hall_3.png"),
  require("./assets/images/Town Hall_4.png"),
  require("./assets/images/Town Hall_5.png"),
  require("./assets/images/Cobalt_1.png"),
  require("./assets/images/Cobalt_2.png"),
  require("./assets/images/Cobalt_3.png"),
  require("./assets/images/Cobalt_4.png"),
  require("./assets/images/Cobalt_5.png"),
  require("./assets/images/Cobalt warehouse_1.png"),
  require("./assets/images/Cobalt warehouse_2.png"),
  require("./assets/images/Cobalt warehouse_3.png"),
  require("./assets/images/Cobalt warehouse_4.png"),
  require("./assets/images/Cobalt warehouse_5.png"),
  require("./assets/images/Mercury elixir_1.png"),
  require("./assets/images/Mercury elixir_2.png"),
  require("./assets/images/Mercury elixir_3.png"),
  require("./assets/images/Mercury elixir_4.png"),
  require("./assets/images/Mercury elixir_5.png"),
  require("./assets/images/Elixir storehouse_1.png"),
  require("./assets/images/Elixir storehouse_2.png"),
  require("./assets/images/Elixir storehouse_3.png"),
  require("./assets/images/Elixir storehouse_4.png"),
  require("./assets/images/Elixir storehouse_5.png"),
  require("./assets/images/Laser Tower_1.png"),
  require("./assets/images/Laser Tower_2.png"),
  require("./assets/images/Laser Tower_3.png"),
  require("./assets/images/Laser Tower_4.png"),
  require("./assets/images/Laser Tower_5.png"),
  require("./assets/images/cannon_1.png"),
  require("./assets/images/cannon_2.png"),
  require("./assets/images/cannon_3.png"),
  require("./assets/images/Forces camp_1.png"),
  require("./assets/images/Forces camp_2.png"),
  require("./assets/images/barracks_1.png"),
  require("./assets/images/barracks_2.png"),
  require("./assets/images/barracks_3.png"),
  require("./assets/images/building hut.png"),
];

const SOUND_ASSETS = {
  bg: require("./assets/sounds/bg_loop.mp3"),
  click: require("./assets/sounds/click.mp3"),
  place: require("./assets/sounds/place.mp3"),
  collect: require("./assets/sounds/collect.mp3"),
};

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const [gameState, setGameState] = useState(initialGameState);
  const [soundOn, setSoundOn] = useState(true);
  const bgSoundRef = useRef(null);
  const clickSoundRef = useRef(null);
  const placeSoundRef = useRef(null);
  const collectSoundRef = useRef(null);

  // preload assets and sounds
  useEffect(() => {
    let mounted = true;

    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();

        // preload images
        const imagePromises = IMAGE_ASSETS.map((img) => Asset.fromModule(img).downloadAsync());
        await Promise.all(imagePromises);

        // preload sounds
        const { bg, click, place, collect } = SOUND_ASSETS;

        bgSoundRef.current = new Audio.Sound();
        clickSoundRef.current = new Audio.Sound();
        placeSoundRef.current = new Audio.Sound();
        collectSoundRef.current = new Audio.Sound();

        await bgSoundRef.current.loadAsync(bg);
        await clickSoundRef.current.loadAsync(click);
        await placeSoundRef.current.loadAsync(place);
        await collectSoundRef.current.loadAsync(collect);

        // set looping bg and start if soundOn
        await bgSoundRef.current.setIsLoopingAsync(true);
        if (soundOn) {
          await bgSoundRef.current.playAsync();
        }

        // load saved state if exists
        const saved = await AsyncStorage.getItem("gameState_v1");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (mounted) setGameState(parsed);
          } catch (e) {
            // ignore parse errors — keep default initialGameState
          }
        }
      } catch (e) {
        // ignore preload errors but still continue
        console.warn("Asset/sound preload error:", e);
      } finally {
        if (mounted) {
          setAppReady(true);
          await SplashScreen.hideAsync();
        }
      }
    }

    prepare();

    return () => {
      mounted = false;
      // unload sounds
      (async () => {
        try {
          if (bgSoundRef.current) await bgSoundRef.current.unloadAsync();
          if (clickSoundRef.current) await clickSoundRef.current.unloadAsync();
          if (placeSoundRef.current) await placeSoundRef.current.unloadAsync();
          if (collectSoundRef.current) await collectSoundRef.current.unloadAsync();
        } catch (e) {}
      })();
    };
  }, []);

  // auto-save gameState periodically
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        await AsyncStorage.setItem("gameState_v1", JSON.stringify(gameState));
      } catch (e) {
        console.warn("Save failed", e);
      }
    }, 5000); // every 5s

    return () => clearInterval(id);
  }, [gameState]);

  // sound toggle
  const toggleSound = async () => {
    setSoundOn((prev) => {
      const next = !prev;
      (async () => {
        try {
          if (next) {
            if (bgSoundRef.current) await bgSoundRef.current.playAsync();
          } else {
            if (bgSoundRef.current) await bgSoundRef.current.pauseAsync();
          }
        } catch (e) {}
      })();
      return next;
    });
  };

  // small helpers to play SFX
  const playClick = async () => {
    try {
      if (soundOn && clickSoundRef.current) {
        await clickSoundRef.current.replayAsync();
      }
    } catch (e) {}
  };
  const playPlace = async () => {
    try {
      if (soundOn && placeSoundRef.current) {
        await placeSoundRef.current.replayAsync();
      }
    } catch (e) {}
  };
  const playCollect = async () => {
    try {
      if (soundOn && collectSoundRef.current) {
        await collectSoundRef.current.replayAsync();
      }
    } catch (e) {}
  };

  // Expose addBuilding, upgradeBuilding etc. to Map and children via props
  const addBuilding = (type, x, y) => {
    playPlace();
    setGameState((prev) => {
      const nextId = prev.buildings.length ? Math.max(...prev.buildings.map((b) => b.id)) + 1 : 1;
      const newB = {
        id: nextId,
        type,
        level: 1,
        x,
        y,
        isUpgrading: false,
        upgradeEndTime: null,
      };
      return { ...prev, buildings: [...prev.buildings, newB] };
    });
  };

  const startUpgrade = (buildingId, durationSeconds, costResource) => {
    setGameState((prev) => {
      const buildings = prev.buildings.map((b) => {
        if (b.id === buildingId) {
          const end = Date.now() + durationSeconds * 1000;
          return { ...b, isUpgrading: true, upgradeEndTime: end };
        }
        return b;
      });
      // deduct cost if resource exists
      const resources = { ...prev.resources };
      if (costResource && resources[costResource.type] >= costResource.amount) {
        resources[costResource.type] -= costResource.amount;
      }
      return { ...prev, buildings, resources };
    });
  };

  const collectResources = (amounts) => {
    playCollect();
    setGameState((prev) => {
      const resources = { ...prev.resources };
      for (const key of Object.keys(amounts)) {
        resources[key] = (resources[key] || 0) + amounts[key];
      }
      return { ...prev, resources };
    });
  };

  // finish upgrades if time passed
  useEffect(() => {
    const id = setInterval(() => {
      setGameState((prev) => {
        const now = Date.now();
        let changed = false;
        const buildings = prev.buildings.map((b) => {
          if (b.isUpgrading && b.upgradeEndTime && now >= b.upgradeEndTime) {
            changed = true;
            return { ...b, isUpgrading: false, upgradeEndTime: null, level: b.level + 1 };
          }
          return b;
        });
        if (changed) return { ...prev, buildings };
        return prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!appReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <StatusBar barStyle="dark-content" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={false} />
      <ResourceBar
        resources={gameState.resources}
        onToggleSound={toggleSound}
        soundOn={soundOn}
        onCollect={() => {
          // example collect action
          collectResources({ cobalt: 10, mercury: 5 });
        }}
      />

      <Map
        gameState={gameState}
        onAddBuilding={addBuilding}
        onStartUpgrade={startUpgrade}
        onPlayClick={playClick}
      />

      <UpgradePopup
        // hookup basic props; actual popup controlled inside Map or Building components
        onConfirmUpgrade={(buildingId, duration, cost) => startUpgrade(buildingId, duration, cost)}
      />

      {/* Other UI components can be placed globally here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eef2f5",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
