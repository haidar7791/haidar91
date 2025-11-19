// components/Map.js
import React, { useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Modal, Text, FlatList } from "react-native";

// استدعاء بيانات المباني
import buildingsData from "./buildingsData";

// قائمة المباني التي يمكن إضافتها
const availableBuildings = [
  "Town Hall_1",
  "Cobalt_1",
  "Cobalt warehouse_1",
  "Mercury elixir_1",
  "Elixir storehouse_1",
  "Laser Tower_1",
  "cannon_1",
  "Forces camp_1",
  "barracks_1",
  "building hut"
];

const Map = () => {
  const [shopVisible, setShopVisible] = useState(false);

  const renderBuildingItem = ({ item }) => {
    const buildingLevels = buildingsData[item]?.levels;
    if (!buildingLevels) return null;

    const level1Image = buildingLevels[1]?.image;

    return (
      <View style={styles.buildingItem}>
        <Image source={level1Image} style={styles.buildingImage} resizeMode="contain" />
        <Text style={styles.buildingName}>{item}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* أرضية اللعبة */}
      <Image
        source={require("../assets/images/Game floor.png")}
        style={styles.gameFloor}
        resizeMode="stretch"
      />

      {/* زر المتجر (المطرقة) */}
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => setShopVisible(true)}
      >
        <Image
          source={require("../assets/images/Game icon.png")} // يمكن وضع صورة المطرقة هنا
          style={styles.shopIcon}
        />
      </TouchableOpacity>

      {/* نافذة المتجر */}
      <Modal
        visible={shopVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShopVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>المتجر</Text>
            <FlatList
              data={availableBuildings}
              keyExtractor={(item) => item}
              renderItem={renderBuildingItem}
              contentContainerStyle={styles.buildingList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShopVisible(false)}
            >
              <Text style={styles.closeText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Map;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameFloor: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  shopButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFD700",
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  shopIcon: {
    width: 40,
    height: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    maxHeight: '70%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  buildingList: {
    paddingBottom: 20,
  },
  buildingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  buildingImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 10,
    alignSelf: 'center',
  },
  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
