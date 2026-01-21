// src/ShopBar.js - النسخة النهائية
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
  ScrollView,
} from "react-native";
import { BUILDINGS, TOWN_HALL_ID } from './BuildingData';

const { width } = Dimensions.get("window");

const RESOURCE_ARABIC_NAMES = {
  Cobalt: "كوبالت",
  Elixir: "إكسير",
  Crystal: "جواهر",
};

// دالة للتحقق مما إذا كان المبنى مفتوحًا بناءً على مستوى القلعة
const isBuildingUnlocked = (buildingKey, townHallLevel) => {
  const building = BUILDINGS[buildingKey];

  // ✅ التحقق من خاصية requiresTownHall في جسم المبنى الرئيسي أولاً
  if (building?.requiresTownHall) {
    return townHallLevel >= building.requiresTownHall;
  }

  // إذا كان للمبنى شرط مستوى قلعة محدد في المستوى الأول
  if (building?.levels?.[1]?.requiresTownHall) {
    return townHallLevel >= building.levels[1].requiresTownHall;
  }

  // التحقق من قائمة Unlocks في مستويات القلعة
  for (let level = 1; level <= townHallLevel; level++) {
    const townHallData = BUILDINGS[TOWN_HALL_ID]?.levels?.[level];
    if (townHallData?.unlocks?.includes(buildingKey)) {
      return true;
    }
  }

  return false;
};

// دالة للتحقق مما إذا كان يمكن إضافة المبنى (بناءً على maxCount والمباني الموجودة)
const canAddBuilding = (buildingKey, existingBuildings) => {
  const building = BUILDINGS[buildingKey];
  if (!building) return false;

  // استثناء مبنى القاعدة - يمكن ترقيته فقط
  if (buildingKey === TOWN_HALL_ID) {
    return false;
  }

  // استثناء كوخ البناء - يظهر في البداية فقط
  if (buildingKey === "Builder_Hut") {
    return false;
  }

  // إذا كان للمبنى حد أقصى محدد
  if (building.maxCount !== undefined) {
    const buildingCount = existingBuildings.filter(b => b.type === buildingKey).length;
    return buildingCount < building.maxCount;
  }

  // إذا لم يكن هناك maxCount محدد، يمكن إضافة واحد على الأقل
  return true;
};

// عنصر مبنى واحد (ShopItem)
const ShopItem = ({
  buildingKey,
  buildingData,
  resources,
  startPlacing,
  canAddMore,
  isUnlocked
}) => {

  if (!buildingData || !buildingData.levels || !buildingData.levels[1] || !buildingData.levels[1].cost) {
    return null;
  }

  const level1Data = buildingData.levels[1];

  // دعم كلا الشكلين للتكلفة
  let costType, costAmount;

  if (Array.isArray(level1Data.cost)) {
    const firstCost = level1Data.cost[0];
    costType = firstCost?.type;
    costAmount = firstCost?.amount;
  } else if (typeof level1Data.cost === 'object') {
    const costEntries = Object.entries(level1Data.cost);
    if (costEntries.length > 0) {
      costType = costEntries[0][0];
      costAmount = costEntries[0][1];
    }
  } else if (level1Data.cost?.type && level1Data.cost?.amount) {
    costType = level1Data.cost.type;
    costAmount = level1Data.cost.amount;
  }

  if (!costType || !costAmount) return null;

  // التحقق من توفر الموارد
  const isAffordable = (resources[costType] || 0) >= costAmount;
  const canPurchase = isUnlocked && isAffordable && canAddMore;

  return (
    <TouchableOpacity
      style={[
        styles.itemCard,
        {
          opacity: canPurchase ? 1 : 0.5,
          borderColor: canPurchase ? '#4CAF50' :
                     (!isUnlocked ? '#9E9E9E' :
                     (!canAddMore ? '#FF9800' : '#f44336'))
        }
      ]}
      onPress={() => canPurchase && startPlacing(buildingKey)}
      disabled={!canPurchase}
    >
      <Image
        source={buildingData.image}
        style={styles.buildingImage}
      />

      <Text style={styles.itemName}>{buildingData.name_ar || buildingData.name}</Text>

      <View style={styles.costContainer}>
        <Text style={[styles.costText, { color: isAffordable ? '#FFD700' : '#ff4444' }]}>
          {costAmount}
        </Text>
        <Text style={styles.resourceNameText}>
          {RESOURCE_ARABIC_NAMES[costType] || costType}
        </Text>
      </View>

      {/* مؤشرات الحالة */}
      {!isUnlocked && (
        <View style={styles.lockBadge}>
          <Text style={styles.badgeText}>🔒</Text>
        </View>
      )}

      {isUnlocked && !canAddMore && (
        <View style={styles.maxCountBadge}>
          <Text style={styles.badgeText}>🛑</Text>
        </View>
      )}

      {isUnlocked && canAddMore && !isAffordable && (
        <View style={styles.costBadge}>
          <Text style={styles.badgeText}>💰</Text>
        </View>
      )}

      {canPurchase && (
        <View style={styles.readyBadge}>
          <Text style={styles.badgeText}>✅</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function ShopBar({
  shopVisible,
  resources,
  startPlacing,
  townHallLevel = 1,
  existingBuildings = [],
  toggleShop // ✅ استلام الدالة هنا
}) {
  const translateY = useState(new Animated.Value(shopVisible ? 0 : 100))[0];
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ إعادة تحميل المتجر عند تغيير مستوى القلعة
  useEffect(() => {
    setRefreshKey(prev => prev + 1);
  }, [townHallLevel, existingBuildings]);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: shopVisible ? 0 : 120,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [shopVisible]);

  // تصفية المباني بناءً على مستوى القلعة والمباني الموجودة
  const availableBuildings = useMemo(() => {
    const currentTHLevel = townHallLevel; // القيمة ممرة بالفعل وتحدث عند تحديث الحالة
    return Object.entries(BUILDINGS)
      .filter(([key, data]) => {
        // 1. استثناء القلعة وكوخ البناء
        if (key === TOWN_HALL_ID || key === "Builder_Hut") return false;

        // 2. التحقق من وجود البيانات الأساسية
        if (!data || !data.levels || !data.levels[1] || !data.levels[1].cost) {
          return false;
        }

        // 3. فقط المباني التي يمكن وضعها
        if (!data.canBePlaced) {
          return false;
        }

        // 4. التحقق مما إذا كان المبنى مفتوحًا لهذا المستوى من القلعة
        const isUnlocked = isBuildingUnlocked(key, townHallLevel);

        // 5. التحقق مما إذا كان يمكن إضافة المبنى
        const canAddMore = canAddBuilding(key, existingBuildings);

        return isUnlocked || canAddMore;
      })
      .sort(([keyA, dataA], [keyB, dataB]) => {
        const isUnlockedA = isBuildingUnlocked(keyA, townHallLevel);
        const isUnlockedB = isBuildingUnlocked(keyB, townHallLevel);

        // أولاً: المباني المفتوحة
        if (isUnlockedA && !isUnlockedB) return -1;
        if (!isUnlockedA && isUnlockedB) return 1;

        // ثانياً: المباني التي يمكن شراؤها
        let costA, costB;

        if (dataA.levels[1].cost?.type && dataA.levels[1].cost?.amount) {
          costA = dataA.levels[1].cost;
        } else if (typeof dataA.levels[1].cost === 'object') {
          const entriesA = Object.entries(dataA.levels[1].cost);
          costA = entriesA.length > 0 ? { type: entriesA[0][0], amount: entriesA[0][1] } : null;
        }

        if (dataB.levels[1].cost?.type && dataB.levels[1].cost?.amount) {
          costB = dataB.levels[1].cost;
        } else if (typeof dataB.levels[1].cost === 'object') {
          const entriesB = Object.entries(dataB.levels[1].cost);
          costB = entriesB.length > 0 ? { type: entriesB[0][0], amount: entriesB[0][1] } : null;
        }

        if (costA && costB) {
          const affordableA = (resources[costA.type] || 0) >= costA.amount;
          const affordableB = (resources[costB.type] || 0) >= costB.amount;

          if (affordableA && !affordableB) return -1;
          if (!affordableA && affordableB) return 1;
        }

        return 0;
      });
  }, [townHallLevel, existingBuildings, resources]);

  if (!shopVisible) return null;

  // حساب الإحصائيات
  const affordableCount = availableBuildings.filter(([key, data]) => {
    const isUnlocked = isBuildingUnlocked(key, townHallLevel);
    const canAddMore = canAddBuilding(key, existingBuildings);

    if (!isUnlocked || !canAddMore) return false;

    const level1Data = data.levels[1];
    let costType, costAmount;

    if (level1Data.cost?.type && level1Data.cost?.amount) {
      costType = level1Data.cost.type;
      costAmount = level1Data.cost.amount;
    } else if (typeof level1Data.cost === 'object') {
      const entries = Object.entries(level1Data.cost);
      if (entries.length > 0) {
        costType = entries[0][0];
        costAmount = entries[0][1];
      }
    }

    return costType && costAmount && (resources[costType] || 0) >= costAmount;
  }).length;

  const unlockedCount = availableBuildings.filter(([key]) =>
    isBuildingUnlocked(key, townHallLevel)
  ).length;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.outside}
        activeOpacity={1}
        onPress={() => toggleShop(false)}
      />
      <Animated.View
        key={refreshKey}
        style={[styles.shopContainer, { transform: [{ translateY }] }]}
      >
        <View style={styles.shopHeader}>
          <View style={styles.headerLeft}>
            <Text style={styles.shopTitle}>🏬 متجر المباني</Text>
            <Text style={styles.levelText}>مستوى القلعة: {townHallLevel}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.statsText}>مفتوحة: {unlockedCount}</Text>
            <Text style={[styles.statsText, { color: '#4CAF50' }]}>
              قابلة للشراء: {affordableCount}
            </Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {availableBuildings.length > 0 ? (
            availableBuildings.map(([key, data]) => {
              const isUnlocked = isBuildingUnlocked(key, townHallLevel);
              const canAddMore = canAddBuilding(key, existingBuildings);

              return (
                <ShopItem
                  key={key}
                  buildingKey={key}
                  buildingData={data}
                  resources={resources}
                  startPlacing={startPlacing}
                  canAddMore={canAddMore}
                  isUnlocked={isUnlocked}
                />
              );
            })
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🏗️</Text>
              <Text style={styles.emptyText}>
                {townHallLevel < 8 ?
                  "رقّي القلعة لفتح مباني جديدة" :
                  "تم بناء جميع المباني المتاحة"}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* تذييل مع مفتاح الألوان */}
        <View style={styles.footer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>متاح للشراء</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#f44336' }]} />
            <Text style={styles.legendText}>ناقص موارد</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
            <Text style={styles.legendText}>وصل الحد الأقصى</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#9E9E9E' }]} />
            <Text style={styles.legendText}>مقفل</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'box-none',
  },
  outside: {
    flex: 1,
  },
  shopContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: 180,
    backgroundColor: "#1E293B",
    borderTopWidth: 2,
    borderColor: "#334155",
    zIndex: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  shopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  shopTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 'bold',
  },
  levelText: {
    color: "#4CAF50",
    fontSize: 12,
    marginTop: 2,
  },
  statsText: {
    color: "#fff",
    fontSize: 11,
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  itemCard: {
    width: 85,
    height: 110,
    backgroundColor: "#2D3748",
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderWidth: 2,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buildingImage: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
  itemName: {
    color: "#fff",
    fontSize: 10,
    textAlign: "center",
    fontWeight: '600',
    paddingHorizontal: 5,
  },
  costContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  costText: {
    fontWeight: "bold",
    fontSize: 11,
    marginRight: 3,
  },
  resourceNameText: {
    color: "#fff",
    fontSize: 9,
    opacity: 0.9,
  },
  lockBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#9E9E9E',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  maxCountBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FF9800',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  costBadge: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#f44336',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readyBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
  },
  emptyContainer: {
    width: width - 20,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 20,
  },
  emptyIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  emptyText: {
    color: '#9E9E9E',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    color: '#9E9E9E',
    fontSize: 8,
  },
});
