// src/BuildingPlacement.js - التعديلات الأساسية
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  Image,
  Text,
  Animated
} from "react-native";
import BUILDINGS from "./BuildingData";
import { MAP_TILES_X, MAP_TILES_Y } from "./MapConfig";
import { 
  suggestBestPlacement, 
  snapToGrid,
  findFreePlacement,
  getAdjacentEmptySpots 
} from "./placementUtils";
import { isOverlappingAny } from "./collisionUtils";

export default function BuildingPlacement({
  buildingType,
  gameState,
  onConfirmPlacement,
  onCancelPlacement,
  tileSize = 32,
  cameraOffset = { x: 0, y: 0 }
}) {
  const [gridPos, setGridPos] = useState({ x: -1, y: -1 });
  const [autoPlacementUsed, setAutoPlacementUsed] = useState(false);
  const containerRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const buildingData = BUILDINGS[buildingType];
  const size = buildingData?.size || 1;

  // ✅ تأثير النبض بدون useNativeDriver
  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.8,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    };
    
    pulse();
    return () => pulseAnim.stopAnimation();
  }, []);

  // ✅ البحث الذكي عن مكان فارغ - تحسين الخوارزمية
  useEffect(() => {
    const findBestPosition = () => {
      // 1. أولاً: حاول العثور على مكان بالقرب من مباني مشابهة
      const similarBuildings = (gameState.buildings || [])
        .filter(b => BUILDINGS[b.type]?.size === size);
      
      if (similarBuildings.length > 0) {
        // ابحث حول آخر مبنى مشابه
        const lastSimilar = similarBuildings[similarBuildings.length - 1];
        const adjacentSpots = getAdjacentEmptySpots(
          gameState.buildings || [],
          lastSimilar,
          MAP_TILES_X,
          MAP_TILES_Y
        );
        
        if (adjacentSpots.length > 0) {
          setGridPos(adjacentSpots[0]);
          setAutoPlacementUsed(true);
          return;
        }
      }
      
      // 2. ثانياً: استخدم البحث الذكي
      const suggested = findFreePlacement(
        gameState.buildings || [],
        size,
        MAP_TILES_X,
        MAP_TILES_Y
      );
      
      if (suggested) {
        setGridPos(suggested);
        setAutoPlacementUsed(true);
      } else {
        // 3. أخيراً: ضع في مكان عشوائي فارغ
        const startX = Math.floor(Math.random() * (MAP_TILES_X - size - 5)) + 2;
        const startY = Math.floor(Math.random() * (MAP_TILES_Y - size - 5)) + 2;
        
        // تأكد من أنه ليس في الزاوية اليمنى العليا
        let x = startX;
        let y = startY;
        
        if (x > MAP_TILES_X - 5 && y < 5) {
          x = Math.max(2, MAP_TILES_X - size - 10);
          y = Math.max(2, 10);
        }
        
        setGridPos({ x, y });
      }
    };
    
    findBestPosition();
  }, [buildingType, size]);

  // ✅ دالة التحقق من الصلاحية مع مسافات
  const checkPlacement = (x, y) => {
    // التحقق من الحدود
    if (x < 0 || y < 0 || x + size > MAP_TILES_X || y + size > MAP_TILES_Y) {
      return { valid: false, reason: "خارج الحدود" };
    }
    
    // التحقق من المسافة الدنيا (مربع واحد فارغ بين المباني)
    const minDistance = 1;
    const testBuilding = { x, y, size };
    
    // التحقق من التداخل المباشر
    const overlapResult = isOverlappingAny(gameState.buildings || [], testBuilding);
    if (overlapResult.overlap) {
      return { 
        valid: false, 
        reason: "يتداخل مع مبنى آخر" 
      };
    }
    
    // ✅ التحقق من المسافات الدنيا
    for (const building of gameState.buildings || []) {
      const bSize = building.size || 1;
      
      // حساب المسافة بين الحواف
      const distanceX = Math.abs((x + size/2) - (building.x + bSize/2));
      const distanceY = Math.abs((y + size/2) - (building.y + bSize/2));
      
      const minSpaceX = (size + bSize) / 2 + minDistance;
      const minSpaceY = (size + bSize) / 2 + minDistance;
      
      if (distanceX < minSpaceX && distanceY < minSpaceY) {
        return { valid: false, reason: "قريب جداً من مبنى آخر" };
      }
    }
    
    return { valid: true, reason: "الموقع صالح" };
  };

  const placementValidity = useMemo(() => {
    if (gridPos.x === -1) return { valid: false, reason: "غير محدد" };
    return checkPlacement(gridPos.x, gridPos.y);
  }, [gridPos, gameState.buildings, size]);

  const isColliding = !placementValidity.valid;

  // ✅ PanResponder محسن مع إرجاع عند الخطأ
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setAutoPlacementUsed(false);
      },
      onPanResponderMove: (evt, gesture) => {
        const { locationX, locationY } = evt.nativeEvent;
        const touchX = locationX - (cameraOffset.x || 0);
        const touchY = locationY - (cameraOffset.y || 0);
        
        const rawGx = touchX / tileSize;
        const rawGy = touchY / tileSize;
        const snapped = snapToGrid(rawGx, rawGy, 1);
        
        let gx = Math.max(0, Math.min(snapped.x, MAP_TILES_X - size));
        let gy = Math.max(0, Math.min(snapped.y, MAP_TILES_Y - size));
        
        setGridPos({ x: gx, y: gy });
      },
      onPanResponderRelease: () => {
        // إذا كان الموقع غير صالح، عد إلى الموقع السابق
        if (isColliding && autoPlacementUsed) {
          // اعرض رسالة تنبيه
          alert("لا يمكن وضع المبنى هنا. سيتم العودة للموقع السابق.");
          
          // أعد البحث عن موقع جديد
          const suggested = findFreePlacement(
            gameState.buildings || [],
            size,
            MAP_TILES_X,
            MAP_TILES_Y
          );
          
          if (suggested) {
            setGridPos(suggested);
            setAutoPlacementUsed(true);
          }
        }
      },
    })
  ).current;

  const confirm = () => {
    if (gridPos.x === -1 || isColliding) {
      alert(`❌ لا يمكن وضع المبنى:\n${placementValidity.reason}`);
      
      // حاول إيجاد موقع بديل
      const suggested = findFreePlacement(
        gameState.buildings || [],
        size,
        MAP_TILES_X,
        MAP_TILES_Y
      );
      
      if (suggested) {
        setGridPos(suggested);
        setAutoPlacementUsed(true);
        alert("✅ تم العثور على موقع بديل تلقائياً");
      }
      
      return;
    }
    
    onConfirmPlacement && onConfirmPlacement(buildingType, gridPos.x, gridPos.y);
  };

  const findBetterSpot = () => {
    const suggested = findFreePlacement(
      gameState.buildings || [],
      size,
      MAP_TILES_X,
      MAP_TILES_Y
    );

    if (suggested) {
      setGridPos(suggested);
      setAutoPlacementUsed(true);
      alert("✅ تم العثور على موقع أفضل");
    } else {
      alert("⚠️ لا توجد أماكن فارغة متاحة");
    }
  };

  // ✅ عرض الشبكة الوهمية
  const renderGridLines = () => {
    const lines = [];
    const gridSpacing = 5; // خط كل 5 مربعات
    
    // خطوط عمودية
    for (let i = 0; i <= MAP_TILES_X; i += gridSpacing) {
      lines.push(
        <View
          key={`v${i}`}
          style={[
            styles.gridLine,
            {
              left: i * tileSize,
              width: 1,
              height: MAP_TILES_Y * tileSize,
            }
          ]}
        />
      );
    }
    
    // خطوط أفقية
    for (let j = 0; j <= MAP_TILES_Y; j += gridSpacing) {
      lines.push(
        <View
          key={`h${j}`}
          style={[
            styles.gridLine,
            {
              top: j * tileSize,
              width: MAP_TILES_X * tileSize,
              height: 1,
            }
          ]}
        />
      );
    }
    
    return lines;
  };

  return (
    <View style={styles.overlay} {...panResponder.panHandlers} ref={containerRef}>
      {/* شبكة وهمية */}
      <View style={styles.gridContainer} pointerEvents="none">
        {renderGridLines()}
      </View>
      
      <View style={styles.touchLayer} />
      
      {/* تعليمات */}
      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          🏗️ {buildingData.name} | الحجم: {size}×{size}
        </Text>
        <Text style={styles.instructionSubText}>
          اسحب لتحريك • انقر "تأكيد" للوضع
        </Text>
      </View>

      {/* المبنى الشبح */}
      {gridPos.x !== -1 && (
        <Animated.View
          style={[
            styles.ghost,
            {
              left: gridPos.x * tileSize,
              top: gridPos.y * tileSize,
              width: size * tileSize,
              height: size * tileSize,
              transform: [{ scale: pulseAnim }],
              borderColor: isColliding ? '#ff4757' : '#2ed573',
              backgroundColor: isColliding 
                ? 'rgba(255, 71, 87, 0.25)' 
                : 'rgba(46, 213, 115, 0.25)',
              borderStyle: isColliding ? 'dashed' : 'solid',
            }
          ]}
        >
          {/* علامة التعارض */}
          {isColliding && (
            <View style={styles.collisionOverlay}>
              <Text style={styles.collisionText}>⚠️</Text>
              <Text style={styles.collisionReason}>
                {placementValidity.reason}
              </Text>
            </View>
          )}
          
          {/* صورة المبنى */}
          <Image
            source={buildingData.image}
            style={[
              styles.buildingImage,
              { 
                opacity: isColliding ? 0.5 : 0.8,
                tintColor: isColliding ? '#ff6b6b' : undefined
              }
            ]}
          />
          
          {/* إحداثيات الموقع */}
          <View style={styles.coordIndicator}>
            <Text style={styles.coordText}>
              [{gridPos.x}, {gridPos.y}]
            </Text>
          </View>
        </Animated.View>
      )}

      {/* أزرار التحكم */}
      <View style={styles.controls}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.autoButton]}
            onPress={findBetterSpot}
          >
            <Text style={styles.buttonText}>🔍 موقع تلقائي</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.infoButton]}
            onPress={() => alert(
              `معلومات ${buildingData.name}:\n` +
              `- الحجم: ${size}×${size}\n` +
              `- التكلفة: ${buildingData.cost} 💎\n` +
              `- الإنتاج: ${buildingData.production || 0}/ساعة\n` +
              `- التخزين: ${buildingData.capacity || 0}`
            )}
          >
            <Text style={styles.buttonText}>ℹ️ معلومات</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.button, 
              styles.confirmButton,
              isColliding && styles.disabledButton
            ]}
            onPress={confirm}
            disabled={isColliding}
          >
            <Text style={styles.buttonText}>
              {isColliding ? '❌ موقع غير صالح' : '✅ تأكيد الوضع'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => onCancelPlacement && onCancelPlacement()}
          >
            <Text style={styles.buttonText}>🚫 إلغاء</Text>
          </TouchableOpacity>
        </View>
        
        {/* حالة الموقع */}
        <View style={[
          styles.statusBox,
          { backgroundColor: isColliding ? 'rgba(255, 71, 87, 0.2)' : 'rgba(46, 213, 115, 0.2)' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: isColliding ? '#ff4757' : '#2ed573' }
          ]}>
            {isColliding ? '✗ ' : '✓ '}
            {placementValidity.reason}
          </Text>
          {autoPlacementUsed && (
            <Text style={styles.autoPlaceText}>
              ⚡ تم اختيار الموقع تلقائياً
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0, top: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
  },
  gridContainer: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  touchLayer: {
    position: 'absolute',
    left: 0, top: 0, right: 0, bottom: 0,
  },
  instructionBox: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructionSubText: {
    color: '#aaa',
    fontSize: 12,
  },
  ghost: {
    position: "absolute",
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buildingImage: {
    width: '85%',
    height: '85%',
    resizeMode: "contain"
  },
  collisionOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(255, 71, 87, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  collisionText: {
    color: '#fff',
    fontSize: 32,
    marginBottom: 5,
  },
  collisionReason: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  coordIndicator: {
    position: 'absolute',
    bottom: -18,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignItems: 'center',
  },
  coordText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  controls: {
    position: "absolute",
    bottom: 25,
    left: 15,
    right: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  confirmButton: {
    backgroundColor: "#2ed573",
  },
  cancelButton: {
    backgroundColor: "#ff4757",
  },
  autoButton: {
    backgroundColor: "#3498db",
  },
  infoButton: {
    backgroundColor: "#9b59b6",
  },
  disabledButton: {
    backgroundColor: "#7f8c8d",
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: 'center',
  },
  statusBox: {
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  autoPlaceText: {
    color: '#f1c40f',
    fontSize: 11,
    fontWeight: '600',
  },
});
