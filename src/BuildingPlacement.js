// src/BuildingInfoPanel.js
// نافذة معلومات المبنى — تعرض التفاصيل، الإنتاج الحالي، والزر لبدء الترقية.
// مبنية لتتوافق مع useGameLogic.startUpgrade(buildingId, durationSeconds, costObj)

import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as TimeUtils from "./TimeUtils";
import BUILDINGS from "./BuildingData";

export default function BuildingInfoPanel({
  building,
  onClose = () => {},
  onStartUpgrade = () => {},
  currentResources = {},
}) {
  if (!building) return null;

  const data = BUILDINGS[building.type];
  const currentLevel = building.level || 1;
  const levelData = data && data.levels && data.levels[currentLevel];
  const nextLevel = currentLevel + 1;
  const nextLevelData = data && data.levels && data.levels[nextLevel];

  const productionInfo = levelData && levelData.production ? levelData.production : null;

  const canUpgrade = useMemo(() => {
    if (!nextLevelData) return false;
    const cost = nextLevelData.cost;
    if (!cost) return false;
    const resAmount = currentResources[cost.type] || 0;
    return resAmount >= cost.amount;
  }, [nextLevelData, currentResources]);

  const upgradeCost = nextLevelData ? nextLevelData.cost : null;
  const upgradeTime = nextLevelData ? (nextLevelData.buildTime || nextLevelData.time || 0) : 0; // seconds

  // حساب الوقت المتبقي إن كان قيد الترقية
  const remainingSeconds = building.upgradeFinishTime ? Math.max(0, building.upgradeFinishTime - TimeUtils.now()) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{data ? (data.name_ar || data.name) : building.type}</Text>
        <Text style={styles.level}>مستوى {currentLevel}</Text>
      </View>

      <View style={styles.body}>
        {productionInfo ? (
          <View style={styles.row}>
            <Text style={styles.label}>الإنتاج:</Text>
            {productionInfo.rate && productionInfo.type ? (
              <Text style={styles.value}>
                {productionInfo.rate} / ثانية من {productionInfo.type}
              </Text>
            ) : (
              Object.keys(productionInfo).map((k) => (
                <Text key={k} style={styles.value}>
                  {productionInfo[k]} / ثانية — {k}
                </Text>
              ))
            )}
          </View>
        ) : (
          <Text style={styles.note}>لا يوجد إنتاج لهذا المبنى.</Text>
        )}

        {building.isUpgrading ? (
          <View style={styles.row}>
            <Text style={styles.label}>الترقية قيد التنفيذ:</Text>
            <Text style={styles.value}>{TimeUtils.formatTime(remainingSeconds)}</Text>
          </View>
        ) : null}

        <View style={styles.row}>
          <Text style={styles.label}>الترقية التالية:</Text>
          {nextLevelData ? (
            <Text style={styles.value}>
              تكلفة: {upgradeCost.amount} {upgradeCost.type} — مدة: {TimeUtils.formatTime(upgradeTime)}
            </Text>
          ) : (
            <Text style={styles.value}>الحد الأقصى للمستوى</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onClose} style={[styles.button, styles.closeButton]}>
          <Text style={styles.buttonText}>إغلاق</Text>
        </TouchableOpacity>

        {nextLevelData && !building.isUpgrading && (
          <TouchableOpacity
            onPress={() => {
              // تمرير (id, durationSeconds, costObj) كما يتطلب useGameLogic.startUpgrade
              onStartUpgrade(building.id, upgradeTime, upgradeCost);
            }}
            style={[styles.button, canUpgrade ? styles.upgradeButton : styles.disabledButton]}
            disabled={!canUpgrade}
          >
            <Text style={styles.buttonText}>{canUpgrade ? `ترقية إلى ${nextLevel}` : "لا تكفي الموارد"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 110,
    left: 20,
    right: 20,
    backgroundColor: "#1f2a33",
    borderRadius: 12,
    padding: 12,
    elevation: 10,
  },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  title: { color: "#fff", fontSize: 16, fontWeight: "700" },
  level: { color: "#ddd", fontSize: 14 },
  body: { marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 4 },
  label: { color: "#bbb", fontSize: 13 },
  value: { color: "#fff", fontSize: 13, fontWeight: "600" },
  note: { color: "#ccc", fontSize: 13 },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  closeButton: { backgroundColor: "#444" },
  upgradeButton: { backgroundColor: "#27ae60" },
  disabledButton: { backgroundColor: "#666" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
