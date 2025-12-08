// src/MovableBuilding.js
import React, { useRef, useEffect } from 'react';
import { Image, Animated } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export default function MovableBuilding({
    building,
    buildingData,
    tileSize = 50,
    mapWidth = 600,
    mapHeight = 800,
    onMoveStart,
    onMoveEnd,
    onPress,          // short tap => info
    isSelected = false,
    isMoving = false,
}) {
    if (!buildingData) return null;

    const initialX = building.x * tileSize;
    const initialY = building.y * tileSize;

    const currentX = useRef(new Animated.Value(initialX)).current;
    const currentY = useRef(new Animated.Value(initialY)).current;
    const opacity = useRef(new Animated.Value(isMoving ? 0.6 : 1)).current;

    const startOffset = useRef({ x: initialX, y: initialY });
    const draggingRef = useRef(false);

    const buildingSize = (buildingData.size || 1) * tileSize;

    const MAX_X = mapWidth - buildingSize;
    const MAX_Y = mapHeight - buildingSize;
    const MIN_X = 0;
    const MIN_Y = 0;

    const initialTileX = building.x;
    const initialTileY = building.y;

    // LongPress: if triggered, set draggingRef and call onMoveStart
    const longPress = Gesture.LongPress()
      .minDuration(250)
      .onStart(() => {
        draggingRef.current = true;
        if (onMoveStart) onMoveStart(building.id);
        Animated.timing(opacity, { toValue: 0.7, duration: 120, useNativeDriver: false }).start();
        startOffset.current = { x: currentX.__getValue(), y: currentY.__getValue() };
      })
      .onEnd(() => {
        // not used here
      })
      .runOnJS(true);

    // Pan: only moves while draggingRef is true (i.e., after long press)
    const pan = Gesture.Pan()
      .minPointers(1)
      .maxPointers(1)
      .onStart(() => {
        // capture starting offset
        startOffset.current = { x: currentX.__getValue(), y: currentY.__getValue() };
      })
      .onUpdate((e) => {
        if (!draggingRef.current) return;
        const newX = startOffset.current.x + e.translationX;
        const newY = startOffset.current.y + e.translationY;
        const clampedX = clamp(newX, MIN_X, MAX_X);
        const clampedY = clamp(newY, MIN_Y, MAX_Y);
        currentX.setValue(clampedX);
        currentY.setValue(clampedY);
      })
      .onEnd(() => {
        if (!draggingRef.current) return;
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: false }).start();

        const finalXValue = currentX.__getValue();
        const finalYValue = currentY.__getValue();

        const snappedX = clamp(Math.round(finalXValue / tileSize) * tileSize, MIN_X, MAX_X);
        const snappedY = clamp(Math.round(finalYValue / tileSize) * tileSize, MIN_Y, MAX_Y);

        Animated.spring(currentX, { toValue: snappedX, useNativeDriver: false }).start();
        Animated.spring(currentY, { toValue: snappedY, useNativeDriver: false }).start(() => {
          // call onMoveEnd after short delay to allow animation
          if (onMoveEnd) {
            setTimeout(() => {
              onMoveEnd({
                id: building.id,
                newX: snappedX / tileSize,
                newY: snappedY / tileSize,
                oldX: initialTileX,
                oldY: initialTileY,
              });
            }, 40);
          }
          draggingRef.current = false;
        });
      })
      .runOnJS(true);

    // Tap: short tap opens info (only when not dragging)
    const tap = Gesture.Tap()
      .maxDuration(180)
      .maxDistance(10)
      .onEnd(() => {
        // if currently dragging, ignore tap
        if (draggingRef.current) return;
        if (onPress) onPress(building);
      })
      .runOnJS(true);

    // Combine gestures: longPress+pan for dragging, tap for info. We use Simultaneous to allow longPress to start first.
    const composed = Gesture.Exclusive(tap, Gesture.Simultaneous(longPress, pan));

    // sync external updates to animated values
    useEffect(() => {
      const targetX = building.x * tileSize;
      const targetY = building.y * tileSize;
      if (Math.abs(currentX.__getValue() - targetX) > 1) {
        Animated.spring(currentX, { toValue: targetX, useNativeDriver: false }).start();
      }
      if (Math.abs(currentY.__getValue() - targetY) > 1) {
        Animated.spring(currentY, { toValue: targetY, useNativeDriver: false }).start();
      }
    }, [building.x, building.y, tileSize]);

    const animatedStyle = {
      transform: [{ translateX: currentX }, { translateY: currentY }],
      opacity,
      zIndex: isMoving ? 1000 : building.y,
    };

    return (
      <GestureDetector gesture={composed}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              width: buildingSize,
              height: buildingSize,
            },
            animatedStyle,
          ]}
        >
          <Image
            source={buildingData.image}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
              borderColor: isSelected ? 'yellow' : 'transparent',
              borderWidth: isSelected ? 2 : 0,
            }}
          />
        </Animated.View>
      </GestureDetector>
    );
}
