// src/BuildingInfoPanel.js
// لوحة معلومات تظهر عند النقر على مبنى، وتعرض خيارات الترقية والحركة.

import React, { useMemo } from "react";
// 🛑🛑🛑 تم استبدال Animatable بـ Animated 🛑🛑🛑
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native";

// 🛑🛑🛑 الاستيراد من ملف الإدارة المركزي 🛑🛑🛑
import {
  TimeUtils,
  RESOURCE_TYPES,
} from "./exports"; 
// 🛑🛑🛑 نهاية الاستيراد المركزي 🛑🛑🛑

const ARABIC_NAMES = {
  [RESOURCE_TYPES.COBALT]: "كوبالت",
  [RESOURCE_TYPES.ELIXIR]: "إكسير",
  [RESOURCE_TYPES.CRYSTAL]: "جواهر",
  upgradeDuration: "مدة الترقية",
  currentLevel: "المستوى الحالي",
};

export default function BuildingInfoPanel({
  building,
  buildingData,
  currentResources,
  onClose,
  onStartMove,
  onStartUpgrade,
  currentTime,
}) {
  const currentLevelData = buildingData.levels[building.level];
  const maxLevel = buildingData.maxLevel;
  const isMaxLevel = building.level >= maxLevel;

  // حالة الرسوم المتحركة للظهور (استخدام Animated بدلاً من Animatable)
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);


  // بيانات المستوى التالي
  const nextLevelData = isMaxLevel
    ? null
    : buildingData.levels[building.level + 1];
    
  const upgradeCost = nextLevelData ? nextLevelData.cost : null;
  const upgradeDuration = nextLevelData ? nextLevelData.upgradeDuration : 0;
  const canAfford = upgradeCost
    ? currentResources[upgradeCost.type] >= upgradeCost.amount
    : false;

  // حساب الوقت المتبقي للترقية
  const remainingTime = useMemo(() => {
    if (!building.isUpgrading || !building.upgradeFinishTime) return 0;
    return Math.max(0, building.upgradeFinishTime - currentTime);
  }, [building.isUpgrading, building.upgradeFinishTime, currentTime]);


  const renderUpgradeButton = () => {
    if (building.isUpgrading) {
      return (
        <View style={[styles.button, styles.upgradingButton]}>
          <Text style={styles.buttonText}>
            الترقية قيد التنفيذ: {TimeUtils.formatDuration(remainingTime / 1000)}
          </Text>
        </View>
      );
    }
    
    if (isMaxLevel) {
      return (
        <View style={[styles.button, styles.maxLevelButton]}>
          <Text style={styles.buttonText}>الحد الأقصى للمستوى</Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.button, canAfford ? styles.upgradeButton : styles.disabledButton]}
        onPress={() => onStartUpgrade(building)}
        disabled={!canAfford}
      >
        <Text style={styles.buttonText}>ترقية إلى مستوى {building.level + 1}</Text>
        {upgradeCost && (
          <Text style={styles.costText}>
            التكلفة: {upgradeCost.amount} {ARABIC_NAMES[upgradeCost.type]}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim, // تطبيق التلاشي
          transform: [{
            translateY: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0] // يبدأ من الأسفل وينتقل للأعلى
            })
          }]
        }
      ]}
    >
      {/* رأس اللوحة */}
      <View style={styles.header}>
        <Text style={styles.title}>{buildingData.name_ar}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✖️</Text>
        </TouchableOpacity>
      </View>

      {/* تفاصيل المستوى */}
      <View style={styles.detailsContainer}>
        <Text style={styles.detailText}>
          {ARABIC_NAMES.currentLevel}: {building.level} / {maxLevel}
        </Text>
        
        {/* معلومات الإنتاج / الدفاع (افتراضية) */}
        {buildingData.type === 'resource_collector' && (
             <Text style={styles.detailText}>
                معدل الإنتاج: {currentLevelData.production.rate} / دقيقة
            </Text>
        )}
        {buildingData.type === 'defense' && (
             <Text style={styles.detailText}>
                قوة الضرر: {currentLevelData.damage}
            </Text>
        )}

        {/* تفاصيل الترقية */}
        {nextLevelData && !isMaxLevel && (
            <Text style={styles.detailText}>
                {ARABIC_NAMES.upgradeDuration}: {TimeUtils.formatDuration(upgradeDuration)}
            </Text>
        )}
      </View>

      {/* الأزرار */}
      <View style={styles.actionsContainer}>
        {renderUpgradeButton()}
        
        <TouchableOpacity 
            style={[styles.button, styles.moveButton]}
            onPress={() => onStartMove(building)}
            disabled={building.isUpgrading} // لا يمكن تحريك المبنى أثناء الترقية
        >
          <Text style={styles.buttonText}>نقل المبنى</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 120, // فوق شريط المتجر
    left: "5%",
    width: "90%",
    backgroundColor: "#2C3E50",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    zIndex: 150,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#34495E",
    paddingBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ECF0F1",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: "#ECF0F1",
    fontSize: 18,
    fontWeight: "bold",
  },
  detailsContainer: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: "#BDC3C7",
    marginBottom: 5,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  upgradeButton: {
    backgroundColor: "#27AE60",
  },
  disabledButton: {
    backgroundColor: "#95A5A6",
  },
  maxLevelButton: {
    backgroundColor: "#F39C12",
  },
  upgradingButton: {
    backgroundColor: "#2980B9",
  },
  moveButton: {
    backgroundColor: "#3498DB",
  },
  buttonText: {
    color: "#ECF0F1",
    fontWeight: "bold",
    fontSize: 14,
  },
  costText: {
    color: "#FFD700",
    fontSize: 10,
    marginTop: 3,
  }
});
