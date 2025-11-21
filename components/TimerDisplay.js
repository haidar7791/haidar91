// components/TimerDisplay.js
import React, { useEffect, useState } from "react";
import { Text, StyleSheet } from "react-native";
import { formatTime } from "../utils/TimeUtils";

const TimerDisplay = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState(endTime - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      setTimeLeft(remaining > 0 ? remaining : 0);
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return <Text style={styles.timer}>{formatTime(timeLeft)}</Text>;
};

export default TimerDisplay;

const styles = StyleSheet.create({
  timer: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFD700",
  },
});
