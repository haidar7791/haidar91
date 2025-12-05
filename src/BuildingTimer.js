// src/BuildingTimer.js (مُعدل)

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function BuildingTimer({
  finishTime,
  durationSeconds, // 🛑 يجب تمرير المدة الأصلية للبناء
  size = 55,
  strokeWidth = 6,
}) {
  // استخدام Date.now() بالمللي ثانية ليتناسب مع finishTime (يفترض أنه بالمللي ثانية)
  // إذا كانت finishTime بالثواني، يجب ضربها في 1000: (finishTime * 1000 - Date.now())
  const getRemaining = () =>
    Math.max(0, Math.floor((finishTime * 1000 - Date.now()) / 1000)); // 🛑 تم تعديل finishTime

  const [timeLeft, setTimeLeft] = useState(getRemaining());

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // ------------------------------------------------------------------
  // تحديث الوقت كل ثانية
  useEffect(() => {
    const interval = setInterval(() => {
      const t = getRemaining();
      setTimeLeft(t);

      if (t <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [finishTime]);
  // ------------------------------------------------------------------
  
  // 🛑 حساب التقدم الصحيح باستخدام المدة الأصلية
  const elapsed = durationSeconds - timeLeft;
  const progressFraction = Math.max(0, Math.min(1, elapsed / durationSeconds));
  
  // Offset = محيط الدائرة * (1 - نسبة التقدم)
  const progressOffset = circumference * (1 - progressFraction);

  // عرض الوقت (دقائق : ثواني)
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      {/* مطرقة البناء */}
      <Image
        source={require("../assets/images/hammer.png")}
        style={{
          width: size * 0.45,
          height: size * 0.45,
          position: "absolute",
          top: -size * 0.25,
          zIndex: 5,
        }}
      />

      {/* دائرة SVG */}
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* الخلفية */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#333"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* التقدم */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#FFD700"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset} // 🛑 تم استخدام القيمة الصحيحة
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* الوقت */}
      <Text style={[styles.text, { fontSize: size / 3 }]}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "#fff",
    fontWeight: "bold",
  },
});

