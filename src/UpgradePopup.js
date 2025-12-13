// src/UpgradePopup.js - النسخة المصححة
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { getRequiredTownHallLevel, canUpgradeBuilding } from "./BuildingData";

export default function UpgradePopup({
  building,
  buildingData,
  onClose,
  onUpgrade,
  currentResources = {},
  currentTime = Date.now(),
  townHallLevel = 1, // ✅ إضافة مستوى القلعة
}) {
  if (!building || !buildingData) return null;

  const levelInfo = buildingData.levels[building.level] || {};
  const nextLevelInfo = buildingData.levels[building.level + 1] || null;

  // ✅ تحويل التكلفة إلى مصفوفة
  const costLines = useMemo(() => {
    if (!nextLevelInfo || !nextLevelInfo.cost) return [];
    const c = nextLevelInfo.cost;

    if (c.type && (c.amount !== undefined)) {
      return [{ resource: c.type, amount: c.amount }];
    }

    if (typeof c === "object") {
      return Object.entries(c).map(([resource, amount]) => ({
        resource,
        amount
      }));
    }

    return [];
  }, [nextLevelInfo]);

  // ✅ التحقق من توفر الموارد
  const affordable = useMemo(() => {
    if (!costLines.length) return false;
    return costLines.every(({ resource, amount }) =>
      (currentResources[resource] || 0) >= amount
    );
  }, [costLines, currentResources]);

  // ✅ التحقق من مستوى القلعة المطلوب للترقية
  const requiredTownHallLevel = useMemo(() => {
    if (!nextLevelInfo) return 0;
    return getRequiredTownHallLevel(building.type, building.level + 1);
  }, [nextLevelInfo, building.type, building.level]);

  // ✅ هل يمكن الترقية بناءً على مستوى القلعة؟
  const canUpgradeByTownHall = useMemo(() => {
    // ✅ استثناء مبنى القاعدة - يمكن ترقيته دائمًا
    if (building.type === "Town_Hall") {
      return true;
    }
    return canUpgradeBuilding(building.level + 1, townHallLevel);
  }, [building.type, building.level, townHallLevel]); // ✅ تصحيح الخطأ: Town_HallLevel -> townHallLevel

  const isUpgrading = !!building.isUpgrading;
  const isBuilding = !!building.isBuilding;

  // ✅ حساب الوقت المتبقي
  const remainingMs = useMemo(() => {
    if (isUpgrading && building.upgradeFinishTime) {
      return Math.max(0, (building.upgradeFinishTime || 0) - currentTime);
    }
    if (isBuilding && building.buildFinishTime) {
      return Math.max(0, (building.buildFinishTime || 0) - currentTime);
    }
    return 0;
  }, [building, currentTime, isUpgrading, isBuilding]);

  // ✅ تنسيق الوقت
  const formatMs = (ms) => {
    if (ms <= 0) return "0s";
    const totalSec = Math.ceil(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;

    if (hrs > 0) return `${hrs}س ${mins}د`;
    if (mins > 0) return `${mins}د ${secs}ث`;
    return `${secs}ث`;
  };

  // ✅ دالة الترقية
  const handleUpgrade = () => {
    if (!nextLevelInfo) return;

    // ✅ استثناء مبنى القاعدة - يمكن ترقيته دائمًا
    if (building.type === "Town_Hall") {
      // فقط تحقق من الموارد
      if (!affordable) {
        Alert.alert(
          "💰 موارد غير كافية",
          "تحتاج إلى مزيد من الموارد لترقية القلعة",
          [{ text: "حسناً", style: "cancel" }]
        );
        return;
      }
    } else {
      // ✅ للباقي: التحقق من مستوى القلعة أولاً
      if (!canUpgradeByTownHall) {
        Alert.alert(
          "🔒 مطلوب ترقية القلعة",
          `تحتاج قلعة مستوى ${requiredTownHallLevel} لترقية هذا المبنى للمستوى ${building.level + 1}\n(مستوى قلعتك الحالي: ${townHallLevel})`,
          [{ text: "حسناً", style: "cancel" }]
        );
        return;
      }
    }

    // ✅ التحقق من الموارد
    if (!affordable) {
      Alert.alert(
        "💰 موارد غير كافية",
        "تحتاج إلى مزيد من الموارد للترقية",
        [{ text: "حسناً", style: "cancel" }]
      );
      return;
    }

    const seconds = nextLevelInfo.buildTime || nextLevelInfo.constructionTime || 0;
    const durationMs = seconds * 1000;

    // ✅ اختيار شكل التكلفة
    if (!nextLevelInfo.cost) return;

    if (nextLevelInfo.cost.type && (nextLevelInfo.cost.amount !== undefined)) {
      onUpgrade && onUpgrade(
        building.id,
        durationMs,
        { type: nextLevelInfo.cost.type, amount: nextLevelInfo.cost.amount }
      );
    } else if (typeof nextLevelInfo.cost === "object") {
      onUpgrade && onUpgrade(building.id, durationMs, nextLevelInfo.cost);
    }
  };

  // ✅ رأس النافذة مع إظهار مستوى القلعة
  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>{buildingData.name_ar || buildingData.name}</Text>
      <Text style={styles.level}>المستوى: {building.level}</Text>
      <Text style={styles.currentTownHall}>🏰 مستوى القلعة: {townHallLevel}</Text>
      {buildingData.maxLevel && (
        <Text style={styles.maxLevel}>أقصى مستوى: {buildingData.maxLevel}</Text>
      )}
    </View>
  );

  // ✅ معلومات المستوى الحالي
  const renderCurrentLevelInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>المعلومات الحالية</Text>

      {levelInfo.production && Object.keys(levelInfo.production).length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>⚡ الإنتاج:</Text>
          <Text style={styles.infoValue}>
            {Object.entries(levelInfo.production).map(([r, v]) => `${v}/ساعة`).join(", ")}
          </Text>
        </View>
      )}

      {levelInfo.storage && Object.keys(levelInfo.storage).length > 0 && (
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📦 السعة:</Text>
          <Text style={styles.infoValue}>
            {Object.entries(levelInfo.storage).map(([r, v]) => `${v}`).join(", ")}
          </Text>
        </View>
      )}
    </View>
  );

  // ✅ مؤشر الترقية قيد التنفيذ
  const renderProgress = () => {
    if (remainingMs <= 0) return null;

    return (
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          {isUpgrading ? "🔄 جاري الترقية" : (isBuilding ? "🛠️ جاري البناء" : "")}
        </Text>
        <Text style={styles.timerText}>الوقت المتبقي: {formatMs(remainingMs)}</Text>
      </View>
    );
  };

  // ✅ قسم الترقية التالية
  const renderNextLevel = () => {
    if (!nextLevelInfo) {
      return (
        <View style={styles.maxedSection}>
          <Text style={styles.maxedText}>🎉 وصلت لأقصى مستوى!</Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الترقية للمستوى {building.level + 1}</Text>

        {/* ✅ تكلفة الترقية */}
        <View style={styles.costSection}>
          <Text style={styles.costTitle}>التكلفة:</Text>
          {costLines.map(({ resource, amount }) => (
            <View key={resource} style={styles.costRow}>
              <Text style={styles.resourceName}>
                {resource === "Cobalt" ? "كوبالت" :
                 resource === "Elixir" ? "إكسير" :
                 resource === "Crystal" ? "كريستال" : resource}
              </Text>
              <Text style={[
                styles.costAmount,
                { color: (currentResources[resource] || 0) >= amount ? '#4CAF50' : '#f44336' }
              ]}>
                {amount} (لديك: {currentResources[resource] || 0})
              </Text>
            </View>
          ))}
        </View>

        {/* ✅ معلومات مستوى القلعة المطلوب */}
        {/* استثناء مبنى القاعدة من عرض متطلبات القلعة */}
        {building.type !== "Town_Hall" && (
          <View style={styles.requirementSection}>
            <Text style={styles.requirementTitle}>متطلبات الترقية:</Text>
            <Text style={[
              styles.requirementText,
              { color: canUpgradeByTownHall ? '#4CAF50' : '#f44336' }
            ]}>
              🏰 قلعة مستوى {requiredTownHallLevel}
              {!canUpgradeByTownHall && ` (مستواك: ${townHallLevel})`}
            </Text>
            <Text style={styles.timeText}>
              ⏰ وقت البناء: {formatMs((nextLevelInfo.buildTime || 0) * 1000)}
            </Text>
          </View>
        )}

        {/* لمبنى القاعدة، نعرض فقط وقت البناء */}
        {building.type === "Town_Hall" && (
          <View style={styles.requirementSection}>
            <Text style={styles.requirementTitle}>معلومات الترقية:</Text>
            <Text style={styles.timeText}>
              ⏰ وقت البناء: {formatMs((nextLevelInfo.buildTime || 0) * 1000)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  // ✅ أزرار التحكم
  const renderButtons = () => (
    <View style={styles.buttonsSection}>
      {nextLevelInfo && (
        <TouchableOpacity
          style={[
            styles.upgradeBtn,
            (!affordable || isUpgrading || isBuilding) ? styles.disabledBtn : null
          ]}
          onPress={handleUpgrade}
          disabled={!affordable || isUpgrading || isBuilding}
        >
          <Text style={styles.btnText}>
            {isUpgrading ? "جاري الترقية..." :
             !affordable ? "موارد غير كافية" :
             "💎 ترقية"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.btnText}>إغلاق</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        {renderHeader()}
        {renderCurrentLevelInfo()}
        {renderProgress()}
        {renderNextLevel()}
        {renderButtons()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 1000,
  },
  popup: {
    width: 320,
    backgroundColor: "#1E293B",
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#334155",
    maxHeight: "80%",
  },
  header: {
    alignItems: "center",
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 5,
    textAlign: "center",
  },
  level: {
    fontSize: 16,
    color: "#F1C40F",
    fontWeight: "600",
  },
  currentTownHall: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 3,
  },
  maxLevel: {
    fontSize: 12,
    color: "#95A5A6",
    marginTop: 3,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#3498DB",
    paddingLeft: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  infoLabel: {
    color: "#95A5A6",
    fontSize: 14,
  },
  infoValue: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  progressSection: {
    backgroundColor: "rgba(52, 152, 219, 0.1)",
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: "center",
  },
  progressText: {
    color: "#3498DB",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  timerText: {
    color: "#F1C40F",
    fontSize: 14,
    fontWeight: "600",
  },
  maxedSection: {
    backgroundColor: "rgba(46, 204, 113, 0.1)",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 15,
  },
  maxedText: {
    color: "#2ECC71",
    fontSize: 18,
    fontWeight: "bold",
  },
  costSection: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  costTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 5,
  },
  resourceName: {
    color: "#95A5A6",
    fontSize: 14,
  },
  costAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  requirementSection: {
    backgroundColor: "rgba(155, 89, 182, 0.1)",
    padding: 12,
    borderRadius: 8,
  },
  requirementTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 5,
  },
  timeText: {
    color: "#F1C40F",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonsSection: {
    marginTop: 15,
  },
  upgradeBtn: {
    backgroundColor: "#2ECC71",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  disabledBtn: {
    backgroundColor: "#7F8C8D",
    opacity: 0.7,
  },
  closeBtn: {
    backgroundColor: "#E74C3C",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  btnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
