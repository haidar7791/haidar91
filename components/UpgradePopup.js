// components/UpgradePopup.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";

const UpgradePopup = ({ visible, onClose, building, onUpgrade, onSell }) => {
  if (!building) return null;

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{building.type} - Level {building.level}</Text>
          <Text style={styles.info}>Upgrade Cost: {building.upgradeCost}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <Text style={styles.buttonText}>Upgrade</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sellButton} onPress={onSell}>
              <Text style={styles.buttonText}>Sell</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default UpgradePopup;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  upgradeButton: {
    backgroundColor: "#32CD32",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginRight: 5,
    alignItems: "center",
  },
  sellButton: {
    backgroundColor: "#FF6347",
    padding: 10,
    borderRadius: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 10,
  },
  closeText: {
    color: "#333",
    fontWeight: "bold",
  },
});
