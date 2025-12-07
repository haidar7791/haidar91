// src/BuildingPlacement.js
// شاشة شفافة تظهر فوق الخريطة للسماح للمستخدم بوضع مبنى جديد
// يتم عرض شبح المبنى، ويتم التحقق من التصادمات قبل التأكيد.

import React, { useState, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  PanResponder, 
  Image, 
  Text,
} from "react-native";
import { 
  MAP_TILES_X, 
  MAP_TILES_Y, 
  placementUtils, 
  BUILDINGS,
} from "./exports"; 

const TILE_SIZE = 80;
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const BuildingPlacement = ({ buildingType, gameState, onConfirmPlacement, onCancelPlacement }) => {
  const buildingData = BUILDINGS[buildingType];
  const buildingSize = buildingData.size;
  
  // الحالة لتتبع موقع المبنى في شاشة الهاتف (بالبكسل)
  const [position, setPosition] = useState({ x: 60, y: 60 });
  // الحالة لتتبع موقع المبنى في شبكة الخريطة (بالبلاطة)
  const [gridPosition, setGridPosition] = useState({ x: -1, y: -1 });
  // حالة للتصادم
  const [isColliding, setIsColliding] = useState(true);

  // إزاحة الشاشة (يجب أن يتم تمريرها من Map.js لضمان الدقة، لكننا سنفترض هنا إزاحة صفرية كحل مؤقت)
  const cameraOffset = useRef({ x: 0, y: 0 }).current; 

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderMove: (evt, gestureState) => {
        // تحديث الموقع بالبكسل
        const newX = gestureState.moveX - (buildingSize.w * TILE_SIZE / 2);
        const newY = gestureState.moveY - (buildingSize.h * TILE_SIZE / 2);
        
        setPosition({ x: newX, y: newY });
        
        // حساب موقع الشبكة (Grid Position)
        // يجب عكس إزاحة الكاميرا للحصول على موقع البلاطة الصحيح
        const gridX = Math.floor((newX - cameraOffset.x) / TILE_SIZE);
        const gridY = Math.floor((newY - cameraOffset.y) / TILE_SIZE);
        
        // التحقق من أن الموقع داخل حدود الخريطة
        const withinBounds = placementUtils.checkBounds({
            x: gridX, y: gridY, width: buildingSize.w, height: buildingSize.h
        }, MAP_TILES_X, MAP_TILES_Y);
        
        if (withinBounds) {
            // التحقق من التصادم مع المباني الموجودة
            const collision = placementUtils.checkCollision(
                { x: gridX, y: gridY, width: buildingSize.w, height: buildingSize.h },
                gameState.buildings,
                MAP_TILES_X,
                MAP_TILES_Y,
                BUILDINGS
            );
            
            setIsColliding(collision);
            setGridPosition({ x: gridX, y: gridY });
        } else {
            setIsColliding(true);
            setGridPosition({ x: -1, y: -1 });
        }
      },

      onPanResponderRelease: () => {
        // لا يوجد منطق هنا، يتم الاعتماد على زر التأكيد
      },
    })
  ).current;
  
  const handleConfirm = () => {
      // يجب أن يكون داخل الحدود ولا يوجد تصادم
      if (gridPosition.x !== -1 && !isColliding) {
          onConfirmPlacement(gridPosition.x, gridPosition.y);
      } else {
          // رسالة خطأ بسيطة في الواجهة
          alert("لا يمكن البناء هنا! الموقع متصادم أو خارج الحدود.");
      }
  };

  // نحتاج إلى عرض المبنى في الموضع الحالي
  const ghostStyle = {
    left: position.x,
    top: position.y,
    width: buildingSize.w * TILE_SIZE,
    height: buildingSize.h * TILE_SIZE,
    opacity: 0.7,
    position: 'absolute',
    // إذا كان هناك تصادم أو خارج الحدود، استخدم اللون الأحمر
    backgroundColor: isColliding || gridPosition.x === -1 ? 'rgba(255, 0, 0, 0.5)' : 'rgba(0, 255, 0, 0.5)',
    borderRadius: 5,
    borderWidth: 2,
    borderColor: isColliding || gridPosition.x === -1 ? '#FF3333' : '#33FF33',
    zIndex: 999,
    justifyContent: 'center',
    alignItems: 'center',
  };

  return (
    <View style={styles.overlay} {...panResponder.panHandlers}>
      {/* 1. شبح المبنى المتحرك */}
      {gridPosition.x !== -1 && (
        <View style={ghostStyle}>
          <Image
            source={buildingData.levels[1].image} // صورة المستوى الأول
            style={{ width: '100%', height: '100%', opacity: 0.5 }}
            resizeMode="contain"
          />
        </View>
      )}

      {/* 2. أزرار التحكم */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancelPlacement}
        >
          <Text style={styles.buttonText}>إلغاء</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.confirmButton, (isColliding || gridPosition.x === -1) && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={isColliding || gridPosition.x === -1}
        >
          <Text style={styles.buttonText}>تأكيد البناء</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // خلفية شفافة قليلاً
    zIndex: 500, // يظهر فوق الخريطة وتحت شريط الموارد
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  confirmButton: {
    backgroundColor: '#4CAF50', // أخضر
  },
  cancelButton: {
    backgroundColor: '#F44336', // أحمر
  },
  disabledButton: {
    backgroundColor: '#9E9E9E', // رمادي
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default BuildingPlacement;

