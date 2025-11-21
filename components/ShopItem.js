// components/ShopItem.js
import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

const ShopItem = ({ item, onPress }) => {
  const level1Image = item.levels[1]?.image;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
      {level1Image && <Image source={level1Image} style={styles.image} />}
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.price}>Price: {item.price}</Text>
    </TouchableOpacity>
  );
};

export default ShopItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#333",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    alignItems: "center",
  },
  image: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  name: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  price: {
    color: "#FFD700",
    fontWeight: "bold",
    fontSize: 12,
  },
});
