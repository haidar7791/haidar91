// src/ShopBar.js
// شريط متجر رفيع أسفل الشاشة، يظهر عند الضغط على زر المطرقة ويختفي عند الضغط في أي مكان خارج الشريط

import React from "react";
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
import { BUILDINGS } from './BuildingData';

const { width } = Dimensions.get("window");

const RESOURCE_ARABIC_NAMES = {
  Cobalt: "كوبالت",
  Elixir: "إكسير",
  Crystal:"جواهر",
};

// عنصر مبنى واحد (ShopItem)
const ShopItem = ({ buildingKey, buildingData, resources, startPlacing }) => {
  
  // 🛑🛑🛑 التصحيح: حماية ضد البيانات المفقودة 🛑🛑🛑
  if (!buildingData || !buildingData.levels || !buildingData.levels[1] || !buildingData.levels[1].cost) {
      console.warn(`ShopItem: Missing required data for ${buildingKey}. Skipping.`);
      return null;
  }
  // 🛑🛑🛑 نهاية التصحيح 🛑🛑🛑
    
  const level1Data = buildingData.levels[1];
  const cost = level1Data.cost;
  
  // التحقق من توفر الموارد باستخدام مفتاح التكلفة
  const isAffordable = resources[cost.type] >= cost.amount;

  return (
    <TouchableOpacity
      style={[styles.itemCard, { opacity: isAffordable ? 1 : 0.5 }]}
      onPress={() => isAffordable && startPlacing(buildingKey)}
      disabled={!isAffordable}
    >
      <Image
        source={buildingData.image}
        style={{ width: 50, height: 50, resizeMode: "contain" }}
      />

      <Text style={styles.itemName}>{buildingData.name_ar}</Text>

      <View style={styles.costContainer}>
        <Text style={styles.costText}>{cost.amount}</Text>
        <Text style={styles.resourceNameText}>
          {/* التأكد من وجود الاسم العربي للمورد */}
          {RESOURCE_ARABIC_NAMES[cost.type] || cost.type}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function ShopBar({ shopVisible, resources, startPlacing }) {
  const translateY = new Animated.Value(shopVisible ? 0 : 100);

  React.useEffect(() => {
    Animated.timing(translateY, {
      toValue: shopVisible ? 0 : 120,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [shopVisible]);

  // 🛑🛑🛑 التصحيح: تصفية المباني غير الصالحة للعرض 🛑🛑🛑
  const availableBuildings = Object.entries(BUILDINGS)
    .filter(([key, data]) => 
      // 1. استثناء القلعة
      key !== "Town_Hall" &&
      // 2. التحقق من أن المبنى يملك بيانات المستوى الأول والتكلفة
      data && data.levels && data.levels[1] && data.levels[1].cost
    );

  return (
    <Animated.View
      style={[styles.shopContainer, { transform: [{ translateY }] }]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {availableBuildings.map(([key, data]) => (
          <ShopItem
            key={key}
            buildingKey={key}
            buildingData={data}
            resources={resources}
            startPlacing={startPlacing}
          />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shopContainer: {
    position: "absolute",
    bottom: 0,
    width: width,
    height: 130,
    backgroundColor: "#1E293B",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 2,
    borderColor: "#334155",
    zIndex: 100,
  },

  itemCard: {
    width: 80,
    height: 80,
    backgroundColor: "#334155",
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5,
  },

  itemName: {
    color: "#fff",
    fontSize: 8,
    textAlign: "center",
  },

  costContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  costText: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 8,
    marginRight: 3,
  },

  resourceNameText: {
    color: "#fff",
    fontSize: 6,
  },
});

