// --------------------------------------------------------------
// ui/TroopTrainingPanel.js
// واجهة تدريب القوات
// --------------------------------------------------------------

import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

// 🛑🛑🛑 استيراد جميع البيانات والدوال المساعدة من ملف الإدارة المركزي 🛑🛑🛑
import {
  TROOPS_DATA,      // بيانات القوات (تم استيرادها بهذا الاسم من exports.js)
  troopsManager,    // إدارة تدريب القوات (كائن فضاء اسم)
  storage,          // دوال الحفظ والتحميل (كائن فضاء اسم)
  // تم تجاهل استيراد gameState لأنه غير مستخدم في المنطق الحالي.
} from "./exports"; // المسار الافتراضي لملف الإدارة

export default function TroopTrainingPanel({ onClose }) {
  // 🛑 تم تغيير TROOPS إلى TROOPS_DATA ليتوافق مع الاستيراد المركزي
  const [availableTroops, setAvailableTroops] = React.useState(TROOPS_DATA); 
  const [campStatus, setCampStatus] = React.useState(
    troopsManager.getCampStatus()
  );
  const [queue, setQueue] = React.useState(troopsManager.getTrainingQueue());

  // تحديث الشاشة كل ثانية
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCampStatus(troopsManager.getCampStatus());
      setQueue([...troopsManager.getTrainingQueue()]);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // أمر التدريب
  const train = (troopId) => {
    const result = troopsManager.trainTroop(troopId);

    if (!result.success) {
      // 🛑 تم استبدال alert() بـ console.error() 🛑
      console.error("Training Error:", result.error); 
    } else {
      storage.saveGame();
      setQueue([...troopsManager.getTrainingQueue()]);
    }
  };

  return (
    <View style={styles.container}>
      {/* عنوان */}
      <Text style={styles.title}>تدريب القوات</Text>

      {/* حالة المعسكر */}
      <Text style={styles.capacityText}>
        السعة: {campStatus.used} / {campStatus.total}
      </Text>

      {/* قائمة القوات */}
      <View style={styles.list}>
        {Object.keys(availableTroops).map((id) => {
          const troop = availableTroops[id];
          return (
            <View key={id} style={styles.troopCard}>
              <Image source={troop.image} style={styles.troopImage} />

              <View style={{ flex: 1 }}>
                <Text style={styles.troopName}>{troop.name_ar}</Text>
                <Text style={styles.troopInfo}>القوة: {troop.power}</Text>
                <Text style={styles.troopInfo}>السعة: {troop.housing}</Text>
                <Text style={styles.troopInfo}>
                  وقت التدريب: {troop.trainTime}s
                </Text>
              </View>

              <TouchableOpacity
                style={styles.trainButton}
                onPress={() => train(id)}
              >
                <Text style={styles.trainText}>تدريب</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* قائمة الانتظار */}
      <View style={styles.queueBox}>
        <Text style={styles.queueTitle}>قائمة التدريب</Text>

        {queue.length === 0 ? (
          <Text style={styles.emptyQueue}>لا توجد قوات قيد التدريب</Text>
        ) : (
          queue.map((item, index) => (
            <Text key={index} style={styles.queueItem}>
              {availableTroops[item.id].name_ar} — متبقي: {item.remainingTime}s
            </Text>
          ))
        )}
      </View>

      {/* زر الإغلاق */}
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>إغلاق</Text>
      </TouchableOpacity>
    </View>
  );
}

// ------------------------------------------------------
// CSS
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    bottom: 40,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: "#555",
  },

  title: {
    fontSize: 24,
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },

  capacityText: {
    fontSize: 16,
    color: "#ccc",
    textAlign: "center",
    marginBottom: 10,
  },

  list: {
    flex: 1,
    marginBottom: 5,
  },

  troopCard: {
    flexDirection: "row",
    backgroundColor: "#222",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#444",
  },

  troopImage: {
    width: 60,
    height: 60,
    marginRight: 10,
  },

  troopName: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },

  troopInfo: {
    fontSize: 14,
    color: "#ccc",
  },

  trainButton: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 8,
    justifyContent: "center",
  },

  trainText: {
    color: "white",
    fontWeight: "bold",
  },

  queueBox: {
    height: 120,
    backgroundColor: "#111",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#333",
  },

  queueTitle: {
    color: "#fff",
    fontSize: 18,
    marginBottom: 5,
  },

  emptyQueue: {
    color: "#777",
    textAlign: "center",
    marginTop: 20,
  },

  queueItem: {
    color: "#ccc",
    fontSize: 14,
    marginBottom: 4,
  },

  closeButton: {
    backgroundColor: "#b91c1c",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },

  closeText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "bold",
  },
});
