import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { useTransactionStore } from "@/store/transactionStore";
import { validateAmount } from "@/utils/validation";

export default function TransactionModalScreen(): React.JSX.Element {
  const { categoryId, transactionId, monthKey } = useLocalSearchParams<{
    categoryId: string;
    transactionId?: string;
    monthKey?: string;
  }>();
  const router = useRouter();
  const userId = useAuthStore((state) => state.firebaseUser?.uid);
  const { addTransaction, editTransaction, getTransaction } = useTransactionStore();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [oldAmount, setOldAmount] = useState(0);

  useEffect(() => {
    if (!userId || !transactionId) {
      return;
    }
    getTransaction(userId, transactionId).then((transaction) => {
      if (!transaction) {
        return;
      }
      setAmount(String(transaction.amount));
      setNote(transaction.note || "");
      setOldAmount(transaction.amount);
    });
  }, [getTransaction, transactionId, userId]);

  const onSave = async (): Promise<void> => {
    const amountError = validateAmount(amount);
    if (amountError) {
      Alert.alert("Invalid amount", amountError);
      return;
    }
    if (!userId) {
      return;
    }
    try {
      if (transactionId) {
        await editTransaction(userId, transactionId, oldAmount, {
          categoryId,
          amount: Number(amount),
          note,
          date: new Date()
        });
      } else {
        await addTransaction(userId, {
          categoryId,
          amount: Number(amount),
          note,
          date: new Date()
        });
      }
      router.back();
    } catch (error) {
      Alert.alert("Save failed", (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <View style={styles.navRow}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} />
        <Button title="Home" variant="secondary" onPress={() => router.replace("/(tabs)/home")} />
      </View>
      <Text style={styles.title}>{transactionId ? "Edit Transaction" : "Add Transaction"}</Text>
      {!!monthKey && <Text style={styles.monthKey}>Month: {monthKey}</Text>}
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Note" value={note} onChangeText={setNote} />
      <Button title="Save" onPress={onSave} />
      <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 16,
    gap: 12,
    backgroundColor: "#FFFFFF"
  },
  navRow: {
    flexDirection: "row",
    gap: 8
  },
  title: {
    fontSize: 20,
    fontWeight: "800"
  },
  monthKey: {
    color: "#617481"
  }
});
