import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/constants/colors";

export function PartnerBanner(): React.JSX.Element {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Viewing Partner Budget (Read-Only)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FFF5D6",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F3D07A",
    padding: 10
  },
  text: {
    color: colors.text,
    fontWeight: "700"
  }
});
