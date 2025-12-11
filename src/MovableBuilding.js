// src/MovableBuilding.js - الإصدار المصحح
import React, { useRef, useEffect, useState } from 'react';
import { View, Image, Animated, Text, StyleSheet, Alert } from 'react-native';
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
    onPress,
    isSelected = false,
    isMoving = false,
    style,
    gameBuildings = [], // ✅ إضافة: قائمة المباني الأخرى للتحقق من التداخل
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

    const buildingSize = ((buildingData.size || building.size) || 1) * tileSize;

    const MAX_X = mapWidth - buildingSize;
    const MAX_Y = mapHeight - buildingSize;
    const MIN_X = 0;
    const MIN_Y = 0;

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
    // ✅ إصلاح مشكلة موقت الترقية - تحديث مستمر
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

        // تحديث فوري أول مرة
        updateRemainingTime();

        // تحديث كل ثانية إذا كان هناك وقت متبقي
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
        // تحويل الإحداثيات إلى مربعات
        const newLeft = x / tileSize;
        const newTop = y / tileSize;
        const newRight = newLeft + size;
        const newBottom = newTop + size;

        // التحقق مع كل مبنى آخر
        for (const otherBuilding of gameBuildings) {
            if (otherBuilding.id === excludeId) continue;

            const otherSize = BUILDINGS[otherBuilding.type]?.size || otherBuilding.size || 1;
            const otherLeft = otherBuilding.x;
            const otherTop = otherBuilding.y;
            const otherRight = otherLeft + otherSize;
            const otherBottom = otherTop + otherSize;

            // التحقق من التداخل
            if (newLeft < otherRight &&
                newRight > otherLeft &&
                newTop < otherBottom &&
                newBottom > otherTop) {
                return { overlap: true, building: otherBuilding };
            }
        }

        return { overlap: false, building: null };
    };

    // -----------------------------------------------------------
    // ✅ إصلاح مشكلة السحب والتحرير
    // -----------------------------------------------------------
    const longPress = Gesture.LongPress()
        .minDuration(250)
        .onStart(() => {
            draggingRef.current = true;
            setIsDragging(true);
            setShowInfo(false);
            setHasMoved(false);
            
            if (onMoveStart) onMoveStart(building.id);

            // ✅ حفظ الموقع الصالح الحالي
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

            // ✅ تنسيق مع الشبكة
            const snappedX = clamp(Math.round(finalXValue / tileSize) * tileSize, MIN_X, MAX_X);
            const snappedY = clamp(Math.round(finalYValue / tileSize) * tileSize, MIN_Y, MAX_Y);

            const newTileX = snappedX / tileSize;
            const newTileY = snappedY / tileSize;

            // ✅ التحقق من التداخل مع المباني الأخرى
            const buildingSizeTiles = buildingData.size || building.size || 1;
            const overlapResult = checkOverlap(snappedX, snappedY, buildingSizeTiles);

            if (overlapResult.overlap) {
                // ❌ الموقع غير صالح - العودة للموقع السابق
                Alert.alert(
                    "لا يمكن وضع المبنى هنا",
                    `يتداخل مع ${overlapResult.building ? 'مبنى آخر' : 'شيء ما'}`,
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

                    // ✅ إخطار بالعودة للموقع الأصلي
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
                // ✅ الموقع صالح - تأكيد التحرير
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

                // ✅ تحديث الموقع الصالح
                lastValidPosition.current = { x: snappedX, y: snappedY };
            }
        })
        .runOnJS(true);

    // ✅ النقر البسيط لعرض المعلومات
    const tap = Gesture.Tap()
        .maxDuration(180)
        .maxDistance(10)
        .numberOfTaps(1)
        .onEnd(() => {
            if (draggingRef.current) return;
            if (onPress) onPress(building);

            // ✅ تبديل عرض المعلومات
            setShowInfo(!showInfo);

            // ✅ إخفاء المعلومات بعد 3 ثواني
            if (!showInfo) {
                setTimeout(() => {
                    setShowInfo(false);
                }, 3000);
            }
        })
        .runOnJS(true);

    // ✅ دمج الإيماءات
    const composed = Gesture.Exclusive(
        tap,
        Gesture.Simultaneous(longPress, pan)
    );

    // مزامنة التحديثات الخارجية
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

        // ✅ تحديث الموقع الصالح
        lastValidPosition.current = { x: targetX, y: targetY };
    }, [building.x, building.y, tileSize]);

    // ✅ الأنيميشن المحسنة
    const animatedStyle = {
        transform: [{ translateX: currentX }, { translateY: currentY }],
        opacity,
        zIndex: isSelected ? 100 : (isDragging ? 1000 : 10),
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
                    <View style={[styles.dragIndicator, { width: buildingSize + 10, height: buildingSize + 10 }]} />
                )}

                {/* ✅ مؤشر التحديد */}
                {isSelected && !isDragging && (
                    <View style={[styles.selectionIndicator, { width: buildingSize + 8, height: buildingSize + 8 }]} />
                )}

                {/* ✅ موقت البناء/الترقية - مع إصلاح */}
                {(building.isBuilding || building.isUpgrading) && remainingSec > 0 && (
                    <View style={[styles.timerWrap, { width: buildingSize, top: -25 }]}>
                        <TimerDisplay
                            duration={remainingSec}
                            autoStart={true} // ✅ تغيير إلى true
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
                            borderWidth: isSelected ? 2 : 0,
                            shadowColor: isSelected ? '#FFD700' : (isDragging ? '#3498db' : 'transparent'),
                            shadowOffset: isSelected ? { width: 0, height: 0 } : { width: 0, height: 0 },
                            shadowOpacity: isSelected ? 0.8 : (isDragging ? 0.5 : 0),
                            shadowRadius: isSelected ? 10 : (isDragging ? 8 : 0),
                        }
                    ]}
                />

                {/* ✅ معلومات المبنى (تظهر عند النقر فقط) */}
                {showInfo && !isDragging && (
                    <View style={[styles.infoCard, { bottom: -buildingSize * 0.3 }]}>
                        <Text style={styles.infoTitle}>
                            {buildingData.name || building.type}
                        </Text>
                        <Text style={styles.infoLevel}>
                            المستوى: {building.level || 1}
                        </Text>
                        {buildingData.production && (
                            <Text style={styles.infoProduction}>
                                ⚡ {buildingData.production}/ساعة
                            </Text>
                        )}
                        {buildingData.capacity && (
                            <Text style={styles.infoCapacity}>
                                📦 {buildingData.capacity}
                            </Text>
                        )}
                    </View>
                )}

                {/* ✅ مؤشر مستوى المبنى (صغير ودائم) */}
                {!showInfo && (
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelText}>{building.level || 1}</Text>
                    </View>
                )}
            </Animated.View>
        </GestureDetector>
    );
}

const styles = StyleSheet.create({
    dragIndicator: {
        position: 'absolute',
        top: -5,
        left: -5,
        borderWidth: 2,
        borderColor: '#3498db',
        borderRadius: 8,
        borderStyle: 'dashed',
        opacity: 0.7,
    },
    selectionIndicator: {
        position: 'absolute',
        top: -4,
        left: -4,
        borderWidth: 2,
        borderColor: '#FFD700',
        borderRadius: 6,
        borderStyle: 'solid',
    },
    buildingImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        borderRadius: 4,
    },
    timerWrap: {
        position: 'absolute',
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#f1c40f',
        zIndex: 200,
    },
    timerText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#fff',
        fontFamily: 'monospace',
    },
    timerLabel: {
        fontSize: 9,
        color: '#f1c40f',
        marginTop: 2,
        fontWeight: '600',
    },
    infoCard: {
        position: 'absolute',
        left: -20,
        right: -20,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#34495e',
        alignItems: 'center',
        zIndex: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
    },
    infoTitle: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    infoLevel: {
        color: '#f1c40f',
        fontSize: 10,
        fontWeight: '600',
        marginBottom: 2,
    },
    infoProduction: {
        color: '#2ecc71',
        fontSize: 9,
    },
    infoCapacity: {
        color: '#3498db',
        fontSize: 9,
    },
    levelBadge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#f1c40f',
    },
    levelText: {
        color: '#fff',
        fontSize: 9,
        fontWeight: 'bold',
    },
    upgradeBadge: {
        position: 'absolute',
        top: 2,
        left: 2,
        backgroundColor: '#9b59b6',
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    upgradeText: {
        color: '#fff',
        fontSize: 9,
    },
    buildBadge: {
        position: 'absolute',
        top: 2,
        left: 2,
        backgroundColor: '#e74c3c',
        width: 16,
        height: 16,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
    },
    buildText: {
        fontSize: 8,
    },
});
