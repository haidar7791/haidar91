// src/LoadingScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import * as Font from "expo-font"; // هذا استيراد لمكتبة خارجية، يجب أن يبقى

// 🛑🛑🛑 استيراد الدوال المساعدة من ملف الإدارة المركزي 🛑🛑🛑
import {
  storage, // نستخدمه هنا ككائن فضاء اسم (Namespace Object)
} from "./exports"; 
// 🛑🛑🛑 نهاية الاستيراد المركزي 🛑🛑🛑

// نفترض أن useNavigation هي دالة خارجية من مكتبة React Navigation
import { useNavigation } from "@react-navigation/native"; 

export default function LoadingScreen() {
  const navigation = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    async function loadAssets() {
      try {
        setProgress(10);

        // تحميل الخطوط
        await Font.loadAsync({
          Cairo: require("././assets/fonts/Cairo-Regular.ttf"),
        });
        setProgress(40);

        // تحميل حالة اللعبة
        // 🛑🛑🛑 استخدام storage.loadGameState() 🛑🛑🛑
        await storage.loadGameState();
        setProgress(70);

        // تأخير بسيط ليظهر التحميل بشكل جميل
        setTimeout(() => {
          setProgress(100);
          navigation.replace("GameScreen");
        }, 800);

      } catch (e) {
        console.log("Loading Error:", e);
      }
    }

    loadAssets();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loading...</Text>
      <ActivityIndicator size="large" />
      <Text style={styles.progress}>{progress}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 24,
    marginBottom: 20,
  },
  progress: {
    marginTop: 10,
    color: "white",
    fontSize: 18,
  },
});
