// src/Camera.js (النسخة الآمنة باستخدام Animated القياسية)

import React, { useCallback, useRef, useEffect } from "react";
import { Dimensions, Animated } from "react-native"; 
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const { width: screenW, height: screenH } = Dimensions.get("window");

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export default function Camera({
  mapWidth,
  mapHeight,
  children,
  onCameraOffsetChange,
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  
  const initialTx = useRef(0);
  const initialTy = useRef(0);
  const initialScale = useRef(1);

  const MIN_SCALE = 1;
  const MAX_SCALE = 2.5;

  const getBounds = (s) => {
    const scaledWidth = mapWidth * s;
    const scaledHeight = mapHeight * s;

    const minX = screenW - scaledWidth;
    const minY = screenH - scaledHeight;
    const maxX = 0;
    const maxY = 0;

    return { 
      minX: Math.min(0, minX), 
      maxX: maxX, 
      minY: Math.min(0, minY), 
      maxY: maxY 
    };
  };

  const updateOffset = useCallback(
    (x, y) => {
      if (onCameraOffsetChange) {
        onCameraOffsetChange({ x, y });
      }
    },
    [onCameraOffsetChange]
  );
  
  useEffect(() => {
    // مراقبة التغييرات في tx و ty وإرسالها إلى خيط JS
    const listener = Animated.add(tx, ty).addListener(() => {
      const currentX = tx.__getValue();
      const currentY = ty.__getValue();
      updateOffset(currentX, currentY);
    });
    return () => tx.removeListener(listener); // إزالة المستمع عند تفكيك المكون
  }, [updateOffset]);


  // -----------------------------------------------------------
  // ✋ Pan Gesture
  // -----------------------------------------------------------
  const pan = Gesture.Pan()
    .onStart(() => {
      initialTx.current = tx.__getValue();
      initialTy.current = ty.__getValue();
    })
    .onUpdate((e) => {
      const currentScale = scale.__getValue();
      const b = getBounds(currentScale);

      const newX = initialTx.current + e.translationX;
      const newY = initialTy.current + e.translationY;
      
      tx.setValue(clamp(newX, b.minX, b.maxX));
      ty.setValue(clamp(newY, b.minY, b.maxY));
    })
    .onEnd(() => {
      const currentScale = scale.__getValue();
      const b = getBounds(currentScale);
      
      Animated.timing(tx, { toValue: clamp(tx.__getValue(), b.minX, b.maxX), duration: 160, useNativeDriver: false }).start();
      Animated.timing(ty, { toValue: clamp(ty.__getValue(), b.minY, b.maxY), duration: 160, useNativeDriver: false }).start();
    })
    // 🛑 التعديل الأخير للثبات
    .runOnJS(true);

  // -----------------------------------------------------------
  // 🤏 Pinch Gesture
  // -----------------------------------------------------------
  const pinch = Gesture.Pinch()
    .onStart(() => {
      initialScale.current = scale.__getValue();
    })
    .onUpdate((e) => {
      const nextScale = clamp(initialScale.current * e.scale, MIN_SCALE, MAX_SCALE);
      scale.setValue(nextScale);
      
      const b = getBounds(scale.__getValue());
      tx.setValue(clamp(tx.__getValue(), b.minX, b.maxX));
      ty.setValue(clamp(ty.__getValue(), b.minY, b.maxY));
    })
    .onEnd(() => {
      const b = getBounds(scale.__getValue());
      
      Animated.timing(tx, { toValue: clamp(tx.__getValue(), b.minX, b.maxX), duration: 160, useNativeDriver: false }).start();
      Animated.timing(ty, { toValue: clamp(ty.__getValue(), b.minY, b.maxY), duration: 160, useNativeDriver: false }).start();
    })
    // 🛑 التعديل الأخير للثبات
    .runOnJS(true);

  const gesture = Gesture.Simultaneous(pan, pinch);

  const anim = {
    transform: [
      { translateX: tx },
      { translateY: ty },
      { scale: scale },
    ],
  };

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          { 
            width: mapWidth, 
            height: mapHeight,
          },
          anim,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

