import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  Animated,
  Text,
} from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import * as Audio from "expo-av";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";

// 🟢 استيرادات Firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// 🟢 استيراد الوحدات
import {
  useGameLogic,
  Map,
  ResourceBar,
  ShopBar,
  BUILDINGS,
  MAP_TILES_X,
  MAP_TILES_Y,
} from "./src/exports";

const { height } = Dimensions.get("window");

const MIN_SHOP_HEIGHT = 80;
const MAX_SHOP_HEIGHT = height * 0.5;

// 🟢 متغيرات Firebase
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";
const firebaseConfig =
  typeof __firebase_config !== "undefined"
    ? JSON.parse(__firebase_config)
    : {};
const initialAuthToken =
  typeof __initial_auth_token !== "undefined"
    ? __initial_auth_token
    : null;

let app, db, auth;
if (Object.keys(firebaseConfig).length > 0) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } catch (e) {
    console.error("Firebase Initialization Error:", e);
  }
} else {
  console.warn("Firebase config is missing. Data persistence disabled.");
}

const IMAGE_ASSETS = [
  require("./assets/images/Game_floor.jpg"),
  require("./assets/images/Game_icon.png"),
  require("./assets/images/Town_Hall.png"),
  require("./assets/images/Town_Hall_2.png"),
  require("./assets/images/Town_Hall_3.png"),
  require("./assets/images/Town_Hall_4.png"),
  require("./assets/images/Town_Hall_5.png"),
];

const SOUND_ASSETS = {
  bg: require("./assets/sounds/bg_loop.mp3"),
  click: require("./assets/sounds/click.mp3"),
  place: require("./assets/sounds/place.mp3"),
  collect: require("./assets/sounds/collect.mp3"),
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [initialSaved, setInitialSaved] = useState(null);

  // Firebase States
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const [shopVisible, setShopVisible] = useState(false);
  const shopPanelOffset = useRef(new Animated.Value(0)).current;

  // الأصوات
  const bgSound = useRef(null);
  const clickSound = useRef(null);
  const placeSound = useRef(null);
  const collectSound = useRef(null);

  // منطق اللعبة
  const { gameState, addBuilding, moveBuilding, startUpgrade, collectResources } =
    useGameLogic(initialSaved);

  // ------------------------------------------
  // Firebase Auth
  // ------------------------------------------
  useEffect(() => {
    if (!auth) {
      setIsAuthReady(true);
      return;
    }

    const initAuth = async () => {
      try {
        if (initialAuthToken) {
          await signInWithCustomToken(auth, initialAuthToken);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth failed:", e);
      }
    };

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
      setIsAuthReady(true);
    });

    initAuth();
    return () => unsub();
  }, []);

  // ------------------------------------------
  // Firestore Listener
  // ------------------------------------------
  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    const userDocRef = doc(
      db,
      "artifacts",
      appId,
      "users",
      userId,
      "gameData",
      "cityData"
    );

    const unsub = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          setInitialSaved(snap.data().gameState || null);
        } else {
          setDoc(userDocRef, { gameState });
        }
      },
      (e) => console.error("Firestore error:", e)
    );

    return () => unsub();
  }, [userId, isAuthReady]);

  // ------------------------------------------
  // Auto Save every 5 seconds
  // ------------------------------------------
  useEffect(() => {
    if (!db || !userId || !gameState) return;

    const save = async () => {
      const ref = doc(
        db,
        "artifacts",
        appId,
        "users",
        userId,
        "gameData",
        "cityData"
      );
      try {
        await setDoc(ref, { gameState });
      } catch (e) {
        console.error("Save error:", e);
      }
    };

    const id = setInterval(save, 5000);
    return () => clearInterval(id);
  }, [gameState, userId]);

  // ------------------------------------------
  // تحميل الصور والأصوات
  // ------------------------------------------
  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();

        await Promise.all(
          IMAGE_ASSETS.map((img) => Asset.fromModule(img).downloadAsync())
        );

        bgSound.current = new Audio.Audio.Sound();
        clickSound.current = new Audio.Audio.Sound();
        placeSound.current = new Audio.Audio.Sound();
        collectSound.current = new Audio.Audio.Sound();

        await bgSound.current.loadAsync(SOUND_ASSETS.bg);
        await clickSound.current.loadAsync(SOUND_ASSETS.click);
        await placeSound.current.loadAsync(SOUND_ASSETS.place);
        await collectSound.current.loadAsync(SOUND_ASSETS.collect);

        await bgSound.current.setIsLoopingAsync(true);
        if (soundOn) await bgSound.current.playAsync();
      } catch (e) {
        console.warn(e);
      } finally {
        if (active) {
          setReady(true);
          SplashScreen.hideAsync();
        }
      }
    };

    init();
    return () => {
      active = false;
      bgSound.current?.unloadAsync();
      clickSound.current?.unloadAsync();
      placeSound.current?.unloadAsync();
      collectSound.current?.unloadAsync();
    };
  }, []);

  // ------------------------------------------
  // متجر البناء
  // ------------------------------------------
  const toggleShop = (force = null) => {
    const next = force !== null ? force : !shopVisible;
    setShopVisible(next);

    Animated.timing(shopPanelOffset, {
      toValue: next ? MIN_SHOP_HEIGHT - MAX_SHOP_HEIGHT : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const startPlacing = (type) => {
    toggleShop(false);
    handleAddBuilding(type);
  };

  const handleAddBuilding = (type) => {
    const spot = findFreeSpot();
    if (!spot) return;
    addBuilding(type, spot.x, spot.y, null, 0);
  };

  const findFreeSpot = () => {
    for (let x = 0; x < MAP_TILES_X; x++) {
      for (let y = 0; y < MAP_TILES_Y; y++) {
        if (!gameState.buildings.some((b) => b.x === x && b.y === y)) {
          return { x, y };
        }
      }
    }
    return null;
  };

  // ------------------------------------------
  // شاشة التحميل
  // ------------------------------------------
  if (!ready || !gameState || !isAuthReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading...</Text>
      </View>
    );
  }

  // ------------------------------------------
  // الواجهة الرئيسية
  // ------------------------------------------
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden={false} />

        <Text style={styles.userIdDisplay}>User ID: {userId}</Text>

        <ResourceBar
          resources={gameState.resources}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn(!soundOn)}
          onCollect={() => collectResources({ Cobalt: 10, Elixir: 5 })}
          style={styles.resourceBarFixed}
        />

        <Map
          gameState={gameState}
          onStartUpgrade={startUpgrade}
          onMoveBuilding={moveBuilding}
          onOpenShop={toggleShop}
        />

        <ShopBar
          shopVisible={shopVisible}
          shopPanelOffset={shopPanelOffset}
          resources={gameState.resources}
          toggleShop={toggleShop}
          startPlacing={startPlacing}
        />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1b4d2e" },

  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  userIdDisplay: {
    position: "absolute",
    top: 5,
    right: 5,
    fontSize: 10,
    color: "#fff",
    zIndex: 1000,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 5,
    borderRadius: 5,
  },

  resourceBarFixed: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
});
