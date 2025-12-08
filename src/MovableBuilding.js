// src/MovableBuilding.js
import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Animated, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import TimerDisplay from './TimerDisplay';
import { BUILDINGS } from './BuildingData';

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

    const initialX = (typeof building.x === 'number' ? building.x : 0) * tileSize;
    const initialY = (typeof building.y === 'number' ? building.y : 0) * tileSize;

    const currentX = useRef(new Animated.Value(initialX)).current;
    const currentY = useRef(new Animated.Value(initialY)).current;
    const opacity = useRef(new Animated.Value(isMoving ? 0.6 : 1)).current;

    const startOffset = useRef({ x: initialX, y: initialY });
    const draggingRef = useRef(false);

    const buildingSize = ((buildingData.size || building.size) || 1) * tileSize;

    const MAX_X = mapWidth - buildingSize;
    const MAX_Y = mapHeight - buildingSize;
    const MIN_X = 0;
    const MIN_Y = 0;

    const initialTileX = building.x;
    const initialTileY = building.y;

    // determine which image to display:
    // - if building is upgrading, show next level's image (if available) so player sees the new appearance
    // - otherwise show current level image (falls back to buildingData.image)
    const levelToShow = (() => {
      if (building.isUpgrading) {
        const next = (building.level || 1) + 1;
        const nextInfo = BUILDINGS[building.type]?.levels?.[next];
        if (nextInfo && nextInfo.image) return next;
      }
      return building.level || 1;
    })();

    const imageSource = (BUILDINGS[building.type]?.levels?.[levelToShow]?.image) || buildingData.image;

    // -----------------------------------------------------------
    // timer state: remaining seconds for build/upgrade (computed from finishTime)
    // keeps updating every second to show live timer above building
    // -----------------------------------------------------------
    const [remainingSec, setRemainingSec] = useState(() => {
      const finish = building.isBuilding ? building.buildFinishTime : (building.isUpgrading ? building.upgradeFinishTime : null);
      if (!finish) return 0;
      return Math.max(0, Math.ceil((finish - Date.now()) / 1000));
    });

    useEffect(() => {
      // recompute immediately when building changes (start/stop)
      const finish = building.isBuilding ? building.buildFinishTime : (building.isUpgrading ? building.upgradeFinishTime : null);
      setRemainingSec(finish ? Math.max(0, Math.ceil((finish - Date.now()) / 1000)) : 0);

      let t = null;
      if (finish) {
        t = setInterval(() => {
          const rem = Math.max(0, Math.ceil((finish - Date.now()) / 1000));
          setRemainingSec(rem);
          if (rem <= 0) {
            clearInterval(t);
          }
        }, 1000);
      }
      return () => {
        if (t) clearInterval(t);
      };
    }, [building.isBuilding, building.isUpgrading, building.buildFinishTime, building.upgradeFinishTime]);

    // -----------------------------------------------------------
    // LongPress: if triggered, set draggingRef and call onMoveStart
    // -----------------------------------------------------------
    const longPress = Gesture.LongPress()
      .minDuration(250)
      .onStart(() => {
        draggingRef.current = true;
        if (onMoveStart) onMoveStart(building.id);
        Animated.timing(opacity, { toValue: 0.7, duration: 120, useNativeDriver: false }).start();
        startOffset.current = { x: currentX.__getValue(), y: currentY.__getValue() };
      })
      .runOnJS(true);

    // Pan: only moves while draggingRef is true (i.e., after long press)
    const pan = Gesture.Pan()
      .minPointers(1)
      .maxPointers(1)
      .onStart(() => {
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
        if (draggingRef.current) return;
        if (onPress) onPress(building);
      })
      .runOnJS(true);

    // Combine gestures: longPress+pan for dragging, tap for info.
    const composed = Gesture.Exclusive(tap, Gesture.Simultaneous(longPress, pan));

    // sync external updates to animated values
    useEffect(() => {
      const targetX = (typeof building.x === 'number' ? building.x : 0) * tileSize;
      const targetY = (typeof building.y === 'number' ? building.y : 0) * tileSize;
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
      zIndex: isMoving ? 1000 : building.y || 0,
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
          {/* Timer overlay: appears centered above the building when building/upgrading */}
          {(building.isBuilding || building.isUpgrading) && (
            <View style={[styles.timerWrap, { width: buildingSize, transform: [{ translateY: -10 }] }]}>
              {/* use TimerDisplay for formatted styling, but pass the live remainingSec so it shows accurate time */}
              <TimerDisplay duration={Math.max(0, remainingSec)} autoStart={true} style={styles.timerText} />
            </View>
          )}

          <Image
            source={imageSource}
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

const styles = StyleSheet.create({
  timerWrap: {
    position: 'absolute',
    top: -26,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // small background pill for readability
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
});
