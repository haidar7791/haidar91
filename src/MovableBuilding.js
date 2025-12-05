// src/MovableBuilding.js (النسخة الأكثر استقرارًا)

import React, { useRef, useEffect } from 'react';
import { Image, Dimensions, Animated } from 'react-native'; 
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const clamp = (v, a, b) => {
    return Math.max(a, Math.min(b, v));
};

export default function MovableBuilding({
    building,
    buildingData,
    tileSize = 50,
    mapWidth = 600,
    mapHeight = 800,
    onMoveStart,
    onMoveEnd,
    isSelected = false,
    isMoving = false,
}) {
    if (!buildingData) {
        return null;
    }

    const initialX = building.x * tileSize;
    const initialY = building.y * tileSize;

    const currentX = useRef(new Animated.Value(initialX)).current;
    const currentY = useRef(new Animated.Value(initialY)).current;
    const opacity = useRef(new Animated.Value(isMoving ? 0.6 : 1)).current;
    
    const startOffset = useRef({ x: initialX, y: initialY }); 

    const buildingSize = buildingData.size * tileSize;

    const MAX_X = mapWidth - buildingSize;
    const MAX_Y = mapHeight - buildingSize;
    const MIN_X = 0;
    const MIN_Y = 0;

    const initialTileX = building.x;
    const initialTileY = building.y;

    // -----------------------------------------------------------
    // ✋ Pan Gesture (تم تثبيت الحركة)
    // -----------------------------------------------------------
    const pan = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .onStart((e) => {
            startOffset.current = {
                x: currentX.__getValue(),
                y: currentY.__getValue(),
            };

            if (onMoveStart) onMoveStart(building.id);

            Animated.timing(opacity, {
                toValue: 0.6,
                duration: 150,
                useNativeDriver: false,
            }).start();
        })
        .onUpdate((e) => {
            const newX = startOffset.current.x + e.translationX;
            const newY = startOffset.current.y + e.translationY;

            const clampedX = clamp(newX, MIN_X, MAX_X);
            const clampedY = clamp(newY, MIN_Y, MAX_Y);

            currentX.setValue(clampedX);
            currentY.setValue(clampedY);
        })
        .onEnd((e) => {
            const finalXValue = currentX.__getValue();
            const finalYValue = currentY.__getValue();

            const snappedX = clamp(
                Math.round(finalXValue / tileSize) * tileSize,
                MIN_X,
                MAX_X
            );
            const snappedY = clamp(
                Math.round(finalYValue / tileSize) * tileSize,
                MIN_Y,
                MAX_Y
            );

            // الحركة أولاً
            Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: false }).start();
            
            Animated.spring(currentX, { 
                toValue: snappedX, 
                useNativeDriver: false,
                tension: 40, 
                friction: 7, 
            }).start();
            Animated.spring(currentY, { 
                toValue: snappedY, 
                useNativeDriver: false,
                tension: 40,
                friction: 7,
            }).start(() => {
                // 🛑 الحل: تأجيل استدعاء onMoveEnd باستخدام setTimeout
                if (onMoveEnd) {
                    setTimeout(() => {
                         onMoveEnd({
                            id: building.id,
                            newX: snappedX / tileSize,
                            newY: snappedY / tileSize,
                            oldX: initialTileX,
                            oldY: initialTileY
                        });
                    }, 50); 
                }
            });
        })
        // 🛑 التعديل الأخير للثبات
        .runOnJS(true);
        
    // -----------------------------------------------------------
    // 🎨 النمط المتحرك
    // -----------------------------------------------------------
    const animatedStyle = {
        transform: [
            { translateX: currentX },
            { translateY: currentY },
        ],
        opacity: opacity,
        zIndex: isMoving ? 1000 : building.y,
    };
    
    // 🛑 useEffect لإعادة تعيين الموقع عندما يتغير موضع المبنى (بسبب الحفظ)
    useEffect(() => {
        const currentRefX = currentX.__getValue();
        const currentRefY = currentY.__getValue();
        const targetX = building.x * tileSize;
        const targetY = building.y * tileSize;

        if (currentRefX !== targetX || currentRefY !== targetY) {
            Animated.spring(currentX, {
                toValue: targetX,
                useNativeDriver: false,
                tension: 40,
                friction: 7,
            }).start();
            Animated.spring(currentY, {
                toValue: targetY,
                useNativeDriver: false,
                tension: 40,
                friction: 7,
            }).start();
        }

    }, [building.x, building.y, tileSize]);
    
    return (
        <GestureDetector gesture={pan}>
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
                        transform: [{ rotate: '-10deg' }], 
                        borderColor: isSelected ? 'yellow' : 'transparent',
                        borderWidth: isSelected ? 2 : 0,
                    }}
                />
            </Animated.View>
        </GestureDetector>
    );
}

