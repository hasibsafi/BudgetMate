import React, { PropsWithChildren } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";

interface SettingsSectionProps extends PropsWithChildren {
  title: string;
}

export function SettingsSection({ title, children }: SettingsSectionProps): React.JSX.Element {
  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 10
  },
  content: {
    gap: 8
  }
});
