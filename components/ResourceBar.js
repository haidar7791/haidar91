// components/ResourceBar.js
import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

const ResourceBar = ({ resources }) => {
  return (
    <View style={styles.container}>
      <View style={styles.resource}>
        <Image
          source={require("../assets/images/Mercury elixir_1.png")}
          style={styles.icon}
        />
        <Text style={styles.text}>{resources.mercury}</Text>
      </View>
      <View style={styles.resource}>
        <Image
          source={require("../assets/images/Cobalt_1.png")}
          style={styles.icon}
        />
        <Text style={styles.text}>{resources.cobalt}</Text>
      </View>
      <View style={styles.resource}>
        <Image
          source={require("../assets/images/Elixir storehouse_1.png")}
          style={styles.icon}
        />
        <Text style={styles.text}>{resources.elixir}</Text>
      </View>
    </View>
  );
};

export default ResourceBar;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 10,
    margin: 10,
  },
  resource: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 5,
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
