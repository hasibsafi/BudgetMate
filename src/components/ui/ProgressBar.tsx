import React from "react";
import { StyleSheet, View } from "react-native";
import { colors } from "@/constants/colors";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
}

export function ProgressBar({ value, max, color = colors.primary }: ProgressBarProps): React.JSX.Element {
  const percent = max <= 0 ? 1 : Math.min(Math.max(value / max, 0), 1);
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${percent * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 10,
    backgroundColor: "#E7EDF1",
    borderRadius: 999,
    overflow: "hidden"
  },
  fill: {
    height: "100%",
    borderRadius: 999
  }
});
