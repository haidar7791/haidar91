import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function UpgradePopup({
  building,
  buildingData,
  onClose,
  onUpgrade,
  currentResources,
  currentTime,
}) {
  if (!building) return null;

  // بيانات المستوى الحالي
  const levelInfo = buildingData.levels[building.level] || {};
  const nextLevelInfo = buildingData.levels[building.level + 1] || null;

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>

        {/* اسم المبنى */}
        <Text style={styles.title}>{buildingData.name}</Text>

        {/* المستوى */}
        <Text style={styles.level}>Level: {building.level}</Text>

        {/* الإنتاج (إن وجد) */}
        {levelInfo.productionPerHour !== undefined && (
          <Text style={styles.info}>
            Production: {levelInfo.productionPerHour}/hour
          </Text>
        )}

        {/* سعة التخزين (إن وجدت) */}
        {levelInfo.capacity !== undefined && (
          <Text style={styles.info}>Capacity: {levelInfo.capacity}</Text>
        )}

        {/* تكلفة الترقية */}
        {nextLevelInfo ? (
          <>
            <Text style={styles.sectionTitle}>Next Level</Text>
            <Text style={styles.info}>Upgrade Cost:</Text>
            {nextLevelInfo.cost &&
              Object.entries(nextLevelInfo.cost).map(([res, amount]) => (
                <Text style={styles.cost} key={res}>
                  {res}: {amount}
                </Text>
              ))}

            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => onUpgrade(building.id)}
            >
              <Text style={styles.btnText}>Upgrade</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.maxed}>MAX LEVEL</Text>
        )}

        {/* زر الإغلاق */}
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
    width: 260,
    backgroundColor: "#222",
    padding: 18,
    borderRadius: 10,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  level: { fontSize: 16, color: "#ddd", marginBottom: 10 },
  info: { color: "#ccc", marginBottom: 4 },
  sectionTitle: {
    marginTop: 10,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  cost: { color: "#ffcc00" },
  maxed: { color: "#00ff99", textAlign: "center", marginVertical: 10 },
  upgradeBtn: {
    backgroundColor: "#28a745",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  closeBtn: {
    backgroundColor: "#d9534f",
    padding: 10,
    borderRadius: 6,
    marginTop: 10,
  },
  btnText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});
