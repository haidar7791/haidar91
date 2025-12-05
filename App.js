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

// 🛑🛑🛑 استيرادات Firebase 🛑🛑🛑
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// 🛑🛑🛑 استيراد الوحدات من ملف الإدارة المركزي 🛑🛑🛑
import { 
  useGameLogic, 
  Map, 
  ResourceBar, 
  UpgradePopup, 
  ShopBar, 
  BUILDINGS, 
  MAP_TILES_X, 
  MAP_TILES_Y, 
} from "./src/exports"; // تم تغيير المسار ليتناسب مع ملف التصدير الجديد

const { height } = Dimensions.get("window");

// تعريف ثوابت ارتفاع الشريط (يجب أن تتطابق مع ShopBar.js)
const MIN_SHOP_HEIGHT = 80; 
const MAX_SHOP_HEIGHT = height * 0.5;

// 🛑 متغيرات Firebase العامة (ضرورية للتكامل في بيئة Canvas/المتصفح)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// تهيئة Firebase
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
    console.warn("Firebase config is missing. Data persistence will be disabled.");
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

  // 🛑🛑🛑 حالة ومتغيرات Firebase 🛑🛑🛑
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  // 🛑🛑🛑 نهاية حالة Firebase 🛑🛑🛑
  
  // منطق المتجر والحركة
  const [shopVisible, setShopVisible] = useState(false);
  const shopPanelOffset = useRef(new Animated.Value(0)).current; 
  
  // refs الصوت
  const bgSound = useRef(null);
  const clickSound = useRef(null);
  const placeSound = useRef(null);
  const collectSound = useRef(null);

  // hook اللعبة 
  const {
    gameState,
    addBuilding,
    moveBuilding,
    startUpgrade,
    collectResources,
  } = useGameLogic(initialSaved); 

  // ----------------------------------------------------
  // 🛑🛑🛑 منطق المصادقة و Firestore (بديل AsyncStorage) 🛑🛑🛑
  // ----------------------------------------------------
  useEffect(() => {
    if (!auth) {
        setIsAuthReady(true); 
        return;
    }

    const signInAndListen = async () => {
        try {
            if (initialAuthToken) {
                await signInWithCustomToken(auth, initialAuthToken);
            } else {
                await signInAnonymously(auth);
            }
        } catch (error) {
            console.error("Firebase authentication failed:", error);
        }
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
        if (user) {
            setUserId(user.uid);
            setIsAuthReady(true);
        } else {
            setUserId(null);
            setIsAuthReady(true);
        }
    });

    signInAndListen();
    return () => unsubscribeAuth();
  }, []); 

  // Firestore Listener (تحميل البيانات في الوقت الحقيقي)
  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    // المسار الخاص بحفظ بيانات المستخدم لهذه اللعبة
    const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'gameData', 'cityData');
    
    // لضبط مستوى تسجيل أخطاء Firestore (اختياري)
    // setLogLevel('debug'); 

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            setInitialSaved(data.gameState || null); 
        } else {
            // إنشاء الحالة الأولية وحفظها إذا لم تكن موجودة
            if (gameState && !docSnap.metadata.hasPendingWrites) {
                setDoc(userDocRef, { gameState: gameState });
            }
        }
    }, (error) => {
        console.error("Error listening to Firestore:", error);
    });

    return () => unsubscribe();
  }, [userId, isAuthReady]); 

  // حفظ البيانات التلقائي (كل 5 ثوانٍ)
  useEffect(() => {
    if (!db || !userId || !gameState) return;
    
    const saveToFirestore = async () => {
        const userDocRef = doc(db, 'artifacts', appId, 'users', userId, 'gameData', 'cityData');
        try {
             await setDoc(userDocRef, { gameState: gameState }); 
        } catch (error) {
            console.error("Error saving data to Firestore:", error);
        }
    };
    
    const id = setInterval(saveToFirestore, 5000); 
    return () => clearInterval(id);
    
  }, [gameState, userId]); 
  
  // ----------------------------------------------------
  // نهاية منطق Firebase
  // ----------------------------------------------------

  const toggleShop = (forceOpen = null) => {
    const isCurrentlyOpen = shopVisible;
    const nextOpen = forceOpen !== null ? forceOpen : !isCurrentlyOpen;

    const targetY = nextOpen 
        ? MIN_SHOP_HEIGHT - MAX_SHOP_HEIGHT 
        : 0; 

    setShopVisible(nextOpen); 
    
    Animated.timing(shopPanelOffset, {
        toValue: targetY,
        duration: 300,
        useNativeDriver: true,
    }).start();
  };
  
  const startPlacing = (type) => {
      toggleShop(false);
      handleAddBuildingFromUI(type); 
  };

  // تحميل الموارد والأصوات 
  useEffect(() => {
    let active = true;
    
    async function init() {
      try {
        await SplashScreen.preventAutoHideAsync();

        // تحميل الصور
        await Promise.all(
          IMAGE_ASSETS.map((img) => Asset.fromModule(img).downloadAsync())
        );

        // الأصوات (expo-av)
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
        console.warn("Init error:", e);
      } finally {
        if (active) {
          setReady(true);
          await SplashScreen.hideAsync();
        }
      }
    }

    init();

    return () => {
      active = false;
      (async () => {
        try {
          await bgSound.current?.unloadAsync();
          await clickSound.current?.unloadAsync();
          await placeSound.current?.unloadAsync();
          await collectSound.current?.unloadAsync();
        } catch {}
      })();
    };
  }, []); 


  // toggle الصوت
  const toggleSound = async () => {
    const next = !soundOn;
    setSoundOn(next);
    try {
      if (next) await bgSound.current?.playAsync();
      else await bgSound.current?.pauseAsync();
    } catch {}
  };

  const playClick = () => soundOn && clickSound.current?.replayAsync?.();
  const playPlace = () => soundOn && placeSound.current?.replayAsync?.();
  const playCollect = () => soundOn && collectSound.current?.replayAsync?.();

  // مساعدة: إيجاد مكان فارغ بسيط داخل الشبكة 
  const findFreeSpot = () => {
    const maxX = MAP_TILES_X;
    const maxY = MAP_TILES_Y;
    
    for (let x = 0; x < maxX; x++) {
      for (let y = 0; y < maxY; y++) {
        const collision = (gameState?.buildings || []).some((b) => b.x === x && b.y === y);
        if (!collision) return { x, y };
      }
    }
    return null;
  };

  // غلاف لإضافة المبنى 
  const handleAddBuildingFromUI = (type) => {
    const spot = findFreeSpot();
    if (!spot) {
      console.warn("No free spot to place building");
      return;
    }
    addBuilding(type, spot.x, spot.y, null, 0);
    playPlace();
  };

  // 🛑 يجب انتظار جاهزية التحميل والمصادقة
  if (!ready || !gameState || !isAuthReady) {
    const displayId = userId ? `User ID: ${userId}` : 'Authenticating...';
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        {/* 🛑 يجب استخدام <Text> لعرض النص */}
        <Text style={{ marginTop: 10, fontSize: 12 }}>{displayId}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden={false} />
        {/* 🛑 عرض ID المستخدم (مهم جداً للتطبيقات التعاونية) 🛑 */}
        <Text style={styles.userIdDisplay}>User ID: {userId}</Text>

        {/* 🛑 تم تطبيق النمط resourceBarFixed لجعله يطفو 🛑 */}
        <ResourceBar
          resources={gameState.resources}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onCollect={() => {
            collectResources({ Cobalt: 10, Elixir: 5 });
            playCollect();
          }}
          style={styles.resourceBarFixed}
        />

        <Map
          gameState={gameState}
          onAddBuilding={(type) => handleAddBuildingFromUI(type)}
          onStartUpgrade={startUpgrade}
          onMoveBuilding={moveBuilding}
          onPlayClick={playClick}
          onOpenShop={toggleShop} 
        />

        <UpgradePopup
          onConfirmUpgrade={(id, duration, cost) =>
            startUpgrade(id, duration, cost)
          }
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
  container: {
    flex: 1,
    backgroundColor: "#1b4d2e",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  userIdDisplay: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 10,
    color: '#fff',
    zIndex: 1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  // 🛑🛑🛑 النمط الجديد لتثبيت شريط الموارد وجعله يطفو 🛑🛑🛑
  resourceBarFixed: {
    position: 'absolute', // لجعله يطفو فوق العناصر الأخرى
    top: 0, // تثبيته في أعلى الشاشة
    left: 0, 
    right: 0, 
    zIndex: 100, // قيمة عالية لضمان ظهوره فوق الخريطة (الحل لمشكلة التغطية)
  },
});
          
