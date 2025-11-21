// components/Map.js
import React, { useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Modal, Text, FlatList } from "react-native";
import BUILDINGS from "./buildingsData";
import availableBuildings from "./availableBuildings";

const Map = () => {
  const [shopVisible, setShopVisible] = useState(false);

  const renderBuildingItem = ({ item }) => {
    const buildingLevels = BUILDINGS[item]?.levels;
    if (!buildingLevels) return null;

    const level1Image = buildingLevels[1]?.image;

    return (
      <View style={styles.buildingItem}>
        <Image source={level1Image} style={styles.buildingImage} />
        <Text style={styles.buildingName}>{item}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/Game_floor.png")}
        style={styles.gameFloor}
        resizeMode="stretch"
      />
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => setShopVisible(true)}
      >
        <Image
          source={require("../assets/images/Game icon.png")}
          style={styles.shopIcon}
        />
      </TouchableOpacity>

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

// نفس الـ styles السابق
const styles = StyleSheet.create({ ... });
