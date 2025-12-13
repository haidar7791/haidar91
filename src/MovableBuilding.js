// src/MovableBuilding.js - النسخة النهائية
import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Animated, Text, StyleSheet, Alert } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import TimerDisplay from './TimerDisplay';
import { BUILDINGS } from './BuildingData';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ✅ دالة للتحقق من التداخل المسموح (النصف السفلي فقط)
const isOverlapAllowed = (x1, y1, size1, x2, y2, size2) => {
  // مسموح بالتداخل في النصف السفلي فقط (50%) من المباني
  const overlapThreshold = 0.5;
  
  // إحداثيات المباني
  const top1 = y1;
  const bottom1 = y1 + size1;
  const top2 = y2;
  const bottom2 = y2 + size2;
  
  // نقطة منتصف كل مبنى
  const mid1 = top1 + (size1 / 2);
  const mid2 = top2 + (size2 / 2);
  
  // إذا كان التداخل في النصف السفلي فقط
  // النقطة الوسطى للمبنى 1 يجب أن تكون أعلى من النقطة الوسطى للمبنى 2
  // (المبنى الأقرب للشاشة يظهر فوق المبنى الأبعد)
  if (mid1 < mid2) {
    // المبنى 1 أقرب للشاشة (y أصغر)، يظهر فوق المبنى 2
    return true;
  }
  
  return false;
};

// ✅ دالة لتحديد z-index بناءً على الموقع
const calculateZIndex = (y, size) => {
  // المباني الأعلى (y أصغر) تحصل على z-index أعلى
  return Math.max(1, 1000 - Math.floor(y / size));
};

export default function MovableBuilding({
    building,
    buildingData,
    tileSize = 50,
    mapWidth = 600,
    mapHeight = 800,
    onMoveStart,
    onMoveEnd,
    onPress,
    isSelected = false,
    isMoving = false,
    style,
    gameBuildings = [],
}) {
    if (!buildingData) return null;

    const initialX = (typeof building.x === 'number' ? building.x : 0) * tileSize;
    const initialY = (typeof building.y === 'number' ? building.y : 0) * tileSize;

    const currentX = useRef(new Animated.Value(initialX)).current;
    const currentY = useRef(new Animated.Value(initialY)).current;
    const opacity = useRef(new Animated.Value(isMoving ? 0.6 : 1)).current;

    const [showInfo, setShowInfo] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);

    const startOffset = useRef({ x: initialX, y: initialY });
    const draggingRef = useRef(false);
    const lastValidPosition = useRef({ x: initialX, y: initialY });

    const buildingSizeTiles = buildingData.size || building.size || 1;
    const buildingSize = buildingSizeTiles * tileSize;

    // ✅ السماح بالمباني أن تكون بجوار بعضها (مسافة 10% فقط)
    const PADDING = tileSize * 0.1;

    const MAX_X = mapWidth - buildingSize + PADDING;
    const MAX_Y = mapHeight - buildingSize + PADDING;
    const MIN_X = -PADDING;
    const MIN_Y = -PADDING;

    const initialTileX = building.x;
    const initialTileY = building.y;

    // ✅ تحديد الصورة المعروضة
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
    // ✅ تحديث الوقت المتبقي
    // -----------------------------------------------------------
    const [remainingSec, setRemainingSec] = useState(() => {
        const finish = building.isBuilding ? building.buildFinishTime :
            (building.isUpgrading ? building.upgradeFinishTime : null);

        if (!finish) return 0;
        const now = Date.now();
        const diff = finish - now;
        return diff > 0 ? Math.ceil(diff / 1000) : 0;
    });

    useEffect(() => {
        const updateRemainingTime = () => {
            const finish = building.isBuilding ? building.buildFinishTime :
                (building.isUpgrading ? building.upgradeFinishTime : null);

            if (!finish) {
                setRemainingSec(0);
                return;
            }

            const now = Date.now();
            const diff = finish - now;
            const seconds = diff > 0 ? Math.ceil(diff / 1000) : 0;
            setRemainingSec(seconds);
        };

        updateRemainingTime();

        const finishTime = building.isBuilding ? building.buildFinishTime :
            (building.isUpgrading ? building.upgradeFinishTime : null);

        if (finishTime && finishTime > Date.now()) {
            const interval = setInterval(updateRemainingTime, 1000);
            return () => clearInterval(interval);
        }
    }, [building.isBuilding, building.isUpgrading, building.buildFinishTime, building.upgradeFinishTime]);

    // -----------------------------------------------------------
    // ✅ دالة التحقق من التداخل مع المباني الأخرى
    // -----------------------------------------------------------
    const checkOverlap = (x, y, size, excludeId = building.id) => {
        const newLeft = x / tileSize;
        const newTop = y / tileSize;
        const newRight = newLeft + size;
        const newBottom = newTop + size;

        for (const otherBuilding of gameBuildings) {
            if (otherBuilding.id === excludeId) continue;

            const otherSize = BUILDINGS[otherBuilding.type]?.size || otherBuilding.size || 1;
            const otherLeft = otherBuilding.x;
            const otherTop = otherBuilding.y;
            const otherRight = otherLeft + otherSize;
            const otherBottom = otherTop + otherSize;

            // ✅ التحقق من التداخل
            if (newLeft < otherRight &&
                newRight > otherLeft &&
                newTop < otherBottom &&
                newBottom > otherTop) {
                
                // ✅ التحقق إذا كان التداخل مسموحاً به (النصف السفلي فقط)
                if (isOverlapAllowed(newTop, newBottom, size, otherTop, otherBottom, otherSize)) {
                    // مسموح بالتداخل - المبنى الأقرب للشاشة يظهر فوق الآخر
                    continue;
                }
                
                return { overlap: true, building: otherBuilding };
            }
        }

        return { overlap: false, building: null };
    };

    // -----------------------------------------------------------
    // ✅ الإيماءات
    // -----------------------------------------------------------
    const longPress = Gesture.LongPress()
        .minDuration(250)
        .onStart(() => {
            draggingRef.current = true;
            setIsDragging(true);
            setShowInfo(false);
            setHasMoved(false);

            if (onMoveStart) onMoveStart(building.id);

            lastValidPosition.current = {
                x: currentX.__getValue(),
                y: currentY.__getValue()
            };

            Animated.timing(opacity, {
                toValue: 0.7,
                duration: 120,
                useNativeDriver: false
            }).start();

            startOffset.current = {
                x: currentX.__getValue(),
                y: currentY.__getValue()
            };
        })
        .runOnJS(true);

    const pan = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .onStart(() => {
            startOffset.current = {
                x: currentX.__getValue(),
                y: currentY.__getValue()
            };
        })
        .onUpdate((e) => {
            if (!draggingRef.current) return;

            const newX = startOffset.current.x + e.translationX;
            const newY = startOffset.current.y + e.translationY;
            const clampedX = clamp(newX, MIN_X, MAX_X);
            const clampedY = clamp(newY, MIN_Y, MAX_Y);

            currentX.setValue(clampedX);
            currentY.setValue(clampedY);
            setHasMoved(true);
        })
        .onEnd((e) => {
            if (!draggingRef.current) return;

            Animated.timing(opacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: false
            }).start();

            const finalXValue = currentX.__getValue();
            const finalYValue = currentY.__getValue();

            // ✅ تنسيق مع الشبكة مع مسافات أقل
            const snappedX = clamp(
                Math.round(finalXValue / (tileSize * 0.5)) * (tileSize * 0.5),
                MIN_X, 
                MAX_X
            );
            const snappedY = clamp(
                Math.round(finalYValue / (tileSize * 0.5)) * (tileSize * 0.5),
                MIN_Y, 
                MAX_Y
            );

            const newTileX = snappedX / tileSize;
            const newTileY = snappedY / tileSize;

            // ✅ التحقق من التداخل
            const overlapResult = checkOverlap(snappedX, snappedY, buildingSizeTiles);

            if (overlapResult.overlap && overlapResult.building) {
                Alert.alert(
                    "⚠️ تداخل",
                    `لا يمكن وضع المبنى هنا`,
                    [{ text: "حسناً", style: "cancel" }]
                );

                Animated.spring(currentX, {
                    toValue: lastValidPosition.current.x,
                    useNativeDriver: false
                }).start();

                Animated.spring(currentY, {
                    toValue: lastValidPosition.current.y,
                    useNativeDriver: false
                }).start(() => {
                    draggingRef.current = false;
                    setIsDragging(false);

                    if (onMoveEnd && hasMoved) {
                        onMoveEnd({
                            id: building.id,
                            newX: lastValidPosition.current.x / tileSize,
                            newY: lastValidPosition.current.y / tileSize,
                            oldX: initialTileX,
                            oldY: initialTileY,
                            cancelled: true
                        });
                    }
                });
            } else {
                Animated.spring(currentX, {
                    toValue: snappedX,
                    useNativeDriver: false
                }).start();

                Animated.spring(currentY, {
                    toValue: snappedY,
                    useNativeDriver: false
                }).start(() => {
                    if (onMoveEnd && hasMoved) {
                        onMoveEnd({
                            id: building.id,
                            newX: newTileX,
                            newY: newTileY,
                            oldX: initialTileX,
                            oldY: initialTileY,
                            cancelled: false
                        });
                    }
                    draggingRef.current = false;
                    setIsDragging(false);
                });

                lastValidPosition.current = { x: snappedX, y: snappedY };
            }
        })
        .runOnJS(true);

    const tap = Gesture.Tap()
        .maxDuration(180)
        .maxDistance(10)
        .numberOfTaps(1)
        .onEnd(() => {
            if (draggingRef.current) return;
            if (onPress) onPress(building);

            setShowInfo(!showInfo);

            if (!showInfo) {
                setTimeout(() => {
                    setShowInfo(false);
                }, 3000);
            }
        })
        .runOnJS(true);

    const composed = Gesture.Exclusive(
        tap,
        Gesture.Simultaneous(longPress, pan)
    );

    // ✅ مزامنة التحديثات الخارجية
    useEffect(() => {
        const targetX = (typeof building.x === 'number' ? building.x : 0) * tileSize;
        const targetY = (typeof building.y === 'number' ? building.y : 0) * tileSize;

        if (Math.abs(currentX.__getValue() - targetX) > 1) {
            Animated.spring(currentX, {
                toValue: targetX,
                useNativeDriver: false
            }).start();
        }
        if (Math.abs(currentY.__getValue() - targetY) > 1) {
            Animated.spring(currentY, {
                toValue: targetY,
                useNativeDriver: false
            }).start();
        }

        lastValidPosition.current = { x: targetX, y: targetY };
    }, [building.x, building.y, tileSize]);

    // ✅ حساب z-index بناءً على الموقع
    const zIndexValue = calculateZIndex(currentY.__getValue(), buildingSize);

    const animatedStyle = {
        transform: [{ translateX: currentX }, { translateY: currentY }],
        opacity,
        zIndex: isSelected ? 1000 : (isDragging ? 2000 : zIndexValue),
        elevation: isSelected ? 10 : (isDragging ? 20 : 5),
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
                    style,
                ]}
            >
                {/* ✅ مؤشر السحب */}
                {isDragging && (
                    <View style={[styles.dragIndicator, { 
                        width: buildingSize + 5,
                        height: buildingSize + 5 
                    }]} />
                )}

                {/* ✅ مؤشر التحديد */}
                {isSelected && !isDragging && (
                    <View style={[styles.selectionIndicator, { 
                        width: buildingSize + 4,
                        height: buildingSize + 4 
                    }]} />
                )}

                {/* ✅ موقت البناء/الترقية */}
                {(building.isBuilding || building.isUpgrading) && remainingSec > 0 && (
                    <View style={[styles.timerWrap, { 
                        width: buildingSize, 
                        top: -20
                    }]}>
                        <TimerDisplay
                            duration={remainingSec}
                            autoStart={true}
                            style={styles.timerText}
                            showIcon={building.isUpgrading ? '⬆️' : '🛠️'}
                        />
                        <Text style={styles.timerLabel}>
                            {building.isBuilding ? 'بناء' : 'ترقية'}
                        </Text>
                    </View>
                )}

                {/* ✅ شارات الحالة */}
                {building.isUpgrading && !building.isBuilding && (
                    <View style={styles.upgradeBadge}>
                        <Text style={styles.upgradeText}>⬆️</Text>
                    </View>
                )}

                {building.isBuilding && (
                    <View style={styles.buildBadge}>
                        <Text style={styles.buildText}>🛠️</Text>
                    </View>
                )}

                {/* ✅ صورة المبنى */}
                <Image
                    source={imageSource}
                    style={[
                        styles.buildingImage,
                        {
                            borderColor: isSelected ? '#FFD700' : 'transparent',
                            borderWidth: isSelected ? 1 : 0,
                        }
                    ]}
                />

                {/* ✅ معلومات المبنى */}
                {showInfo && !isDragging && (
                    <View style={[styles.infoCard, { 
                        bottom: -buildingSize * 0.25,
                        padding: 6,
                    }]}>
                        <Text style={styles.infoTitle}>
                            {buildingData.name_ar || building.type}
                        </Text>
                        <Text style={styles.infoLevel}>
                            المستوى: {building.level || 1}
                        </Text>
                    </View>
                )}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    dragIndicator: {
        position: 'absolute',
        top: -2.5,
        left: -2.5,
        borderWidth: 1.5,
        borderColor: '#3498db',
        borderRadius: 4,
        borderStyle: 'dashed',
        opacity: 0.6,
    },
    selectionIndicator: {
        position: 'absolute',
        top: -2,
        left: -2,
        borderWidth: 1.5,
        borderColor: '#FFD700',
        borderRadius: 3,
        borderStyle: 'solid',
    },
    buildingImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 2,
    },
    timerWrap: {
        position: 'absolute',
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f1c40f',
        zIndex: 200,
    },
    timerText: {
        fontSize: 10,
        fontWeight: '800',
        color: '#fff',
        fontFamily: 'monospace',
    },
    timerLabel: {
        fontSize: 8,
        color: '#f1c40f',
        marginTop: 1,
        fontWeight: '600',
    },
    infoCard: {
        position: 'absolute',
        left: -15,
        right: -15,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#34495e',
        alignItems: 'center',
        zIndex: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
    infoTitle: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 1,
    },
    infoLevel: {
        color: '#f1c40f',
        fontSize: 9,
        fontWeight: '600',
        marginBottom: 1,
    },
    upgradeBadge: {
        position: 'absolute',
        top: 1,
        left: 1,
        backgroundColor: '#9b59b6',
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    upgradeText: {
        color: '#fff',
        fontSize: 8,
    },
    buildBadge: {
        position: 'absolute',
        top: 1,
        left: 1,
        backgroundColor: '#e74c3c',
        width: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    buildText: {
        fontSize: 7,
    },
});
