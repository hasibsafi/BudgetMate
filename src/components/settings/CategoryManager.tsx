import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { addUserCategory, deleteUserCategory, updateUserCategory } from "@/services/firestore/categories";
import { UserCategory } from "@/types";

interface CategoryManagerProps {
  userId: string;
  monthKey: string;
  categories: UserCategory[];
  onChanged: () => Promise<void>;
}

export function CategoryManager({
  userId,
  monthKey,
  categories,
  onChanged
}: CategoryManagerProps): React.JSX.Element {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = (): void => {
    setName("");
    setAmount("");
    setEditingId(null);
  };

  const onSubmit = async (): Promise<void> => {
    const baseBudget = Number(amount);
    if (!name.trim() || Number.isNaN(baseBudget) || baseBudget < 0) {
      return;
    }

    if (editingId) {
      await updateUserCategory(userId, editingId, { name: name.trim(), baseBudget });
    } else {
      await addUserCategory(userId, { name: name.trim(), type: "budgeted", baseBudget });
    }
    resetForm();
    await onChanged();
  };

  const onDelete = async (categoryId: string): Promise<void> => {
    await deleteUserCategory(userId, categoryId, monthKey);
    await onChanged();
  };

  return (
    <View style={styles.container}>
      <Input label="Name" value={name} onChangeText={setName} placeholder="Groceries, Dining, ..." />
      <Input label="Budget" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <View style={styles.actionsRow}>
        <Button title={editingId ? "Save" : "Add"} onPress={() => void onSubmit()} />
        {editingId && <Button title="Cancel" variant="secondary" onPress={resetForm} />}
      </View>
      {categories
        .filter((category) => category.type === "budgeted")
        .map((category) => (
          <View key={category.id} style={styles.row}>
            <Text>{category.name}</Text>
            <Text>{category.baseBudget.toFixed(2)}</Text>
            <View style={styles.actionsRow}>
              <Button
                title="Edit"
                variant="secondary"
                onPress={() => {
                  setEditingId(category.id);
                  setName(category.name);
                  setAmount(String(category.baseBudget));
                }}
              />
              <Button title="Delete" variant="destructive" onPress={() => void onDelete(category.id)} />
            </View>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10
  },
  row: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F4",
    gap: 8
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8
  }
});
