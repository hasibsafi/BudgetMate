import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

interface MonthSelectorProps {
  months: string[];
  selected: string;
  onChange: (month: string) => void;
}

export function MonthSelector({ months, selected, onChange }: MonthSelectorProps): React.JSX.Element {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {months.map((month) => (
        <Pressable
          key={month}
          onPress={() => onChange(month)}
          style={[styles.item, selected === month && styles.selected]}
        >
          <Text>{month}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 8
  },
  item: {
    borderWidth: 1,
    borderColor: "#DCE5EA",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  selected: {
    backgroundColor: "#DDF3F7",
    borderColor: "#8AC2CD"
  }
});
