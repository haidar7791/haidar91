// src/UpgradePopup.js
import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function UpgradePopup({
  building,
  buildingData,
  onClose,
  onUpgrade,
  currentResources = {},
  currentTime = Date.now(),
}) {
  if (!building || !buildingData) return null;

  // مستوى الحالي والمستوى التالي (قد لا يوجد التالي)
  const levelInfo = buildingData.levels[building.level] || {};
  const nextLevelInfo = buildingData.levels[building.level + 1] || null;

  // normalize cost: accept either { type:'Cobalt', amount:50 } or { Cobalt: 50, ... }
  const normalizedNextCost = useMemo(() => {
    if (!nextLevelInfo || !nextLevelInfo.cost) return null;

    const c = nextLevelInfo.cost;
    // already in { type, amount } shape
    if (c.type && (c.amount !== undefined)) {
      return { type: c.type, amount: c.amount };
    }
    // maybe given as map { Cobalt: 50, Elixir: 10 }
    if (typeof c === "object") {
      const entries = Object.entries(c);
      if (entries.length === 1) {
        const [res, amt] = entries[0];
        return { type: res, amount: amt };
      } else {
        // if multiple resource types, pick first for compatibility (UI will show all)
        const [res, amt] = entries[0];
        return { type: res, amount: amt };
      }
    }
    return null;
  }, [nextLevelInfo]);

  // helper: produce array of cost lines for display (handles both shapes)
  const costLines = useMemo(() => {
    if (!nextLevelInfo || !nextLevelInfo.cost) return [];
    const c = nextLevelInfo.cost;
    if (c.type && (c.amount !== undefined)) {
      return [{ resource: c.type, amount: c.amount }];
    }
    if (typeof c === "object") {
      return Object.entries(c).map(([res, amt]) => ({ resource: res, amount: amt }));
    }
    return [];
  }, [nextLevelInfo]);

  // affordability check (requires normalizedNextCost or costLines)
  const affordable = useMemo(() => {
    if (!nextLevelInfo || !costLines.length) return false;
    return costLines.every(({ resource, amount }) => {
      const have = currentResources[resource] || 0;
      return have >= amount;
    });
  }, [nextLevelInfo, currentResources, costLines]);

  // determine if upgrading is allowed from UI POV
  const isUpgrading = !!building.isUpgrading;
  const upgradeDisabled = !nextLevelInfo || isUpgrading || !affordable;

  // compute remaining upgrade/build time (if any)
  const remainingMs = useMemo(() => {
    if (isUpgrading && building.upgradeFinishTime) {
      return Math.max(0, (building.upgradeFinishTime || 0) - currentTime);
    }
    if (building.isBuilding && building.buildFinishTime) {
      return Math.max(0, (building.buildFinishTime || 0) - currentTime);
    }
    return 0;
  }, [building, currentTime, isUpgrading]);

  const formatMs = (ms) => {
    if (ms <= 0) return "0s";
    const totalSec = Math.ceil(ms / 1000);
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const handleUpgradePress = () => {
    if (!nextLevelInfo || !normalizedNextCost) return;
    // buildTime in BuildingData is seconds — convert to ms
    const seconds = nextLevelInfo.buildTime || nextLevelInfo.constructionTime || 0;
    const durationMs = seconds * 1000;
    // call parent onUpgrade with (buildingId, durationMs, costObj)
    onUpgrade && onUpgrade(building.id, durationMs, { type: normalizedNextCost.type, amount: normalizedNextCost.amount });
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.title}>{buildingData.name}</Text>
        <Text style={styles.level}>Level: {building.level}</Text>

        {/* إنتاج / سعة */}
        {levelInfo.production && Object.keys(levelInfo.production).length > 0 && (
          <Text style={styles.info}>
            Production: {Object.entries(levelInfo.production).map(([r, v]) => `${r}: ${v}`).join(", ")}
          </Text>
        )}
        {levelInfo.storage && Object.keys(levelInfo.storage).length > 0 && (
          <Text style={styles.info}>
            Storage: {Object.entries(levelInfo.storage).map(([r, v]) => `${r}: ${v}`).join(", ")}
          </Text>
        )}

        {/* حالة البناء/الترقية الجارية */}
        {remainingMs > 0 && (
          <Text style={styles.info}>
            {isUpgrading ? "Upgrading — remaining: " : (building.isBuilding ? "Building — remaining: " : "")}
            {formatMs(remainingMs)}
          </Text>
        )}

        {/* التكلفة للمستوى التالي */}
        {nextLevelInfo ? (
          <>
            <Text style={styles.sectionTitle}>Next Level</Text>
            <Text style={styles.info}>Upgrade Cost:</Text>
            {costLines.map(({ resource, amount }) => (
              <Text style={styles.cost} key={resource}>
                {resource}: {amount} (You have: {currentResources[resource] || 0})
              </Text>
            ))}

            <TouchableOpacity
              style={[styles.upgradeBtn, upgradeDisabled ? styles.disabledBtn : null]}
              onPress={handleUpgradePress}
              disabled={upgradeDisabled}
            >
              <Text style={styles.btnText}>
                {isUpgrading ? "Upgrading..." : (affordable ? "Upgrade" : "Not enough resources")}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.maxed}>MAX LEVEL</Text>
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.btnText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  popup: {
    width: 300,
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  level: { fontSize: 16, color: "#ddd", marginBottom: 10 },
  info: { color: "#ccc", marginBottom: 6 },
  sectionTitle: {
    marginTop: 10,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 6,
  },
  cost: { color: "#ffcc00", marginBottom: 4 },
  maxed: { color: "#00ff99", textAlign: "center", marginVertical: 10 },
  upgradeBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: "#555",
  },
  closeBtn: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
