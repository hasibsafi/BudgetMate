import React, { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native";
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
  const [transactionDate, setTransactionDate] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      setTransactionDate(transaction.date?.toDate ? transaction.date.toDate() : new Date());
    });
  }, [getTransaction, transactionId, userId]);

  const onSave = async (): Promise<void> => {
    if (isSaving) {
      return;
    }
    const amountError = validateAmount(amount);
    if (amountError) {
      Alert.alert("Invalid amount", amountError);
      return;
    }
    if (!userId) {
      return;
    }
    setIsSaving(true);
    try {
      if (transactionId) {
        await editTransaction(userId, transactionId, oldAmount, {
          categoryId,
          amount: Number(amount),
          note,
          date: transactionDate || new Date()
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
      <View style={styles.navRow}>
        <Button title="Back" variant="secondary" onPress={() => router.back()} disabled={isSaving} />
        <Button
          title="Home"
          variant="secondary"
          onPress={() => router.replace("/(tabs)/home")}
          disabled={isSaving}
        />
      </View>
      <Text style={styles.title}>{transactionId ? "Edit Transaction" : "Add Transaction"}</Text>
      {!!monthKey && <Text style={styles.monthKey}>Month: {monthKey}</Text>}
      <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Input label="Note" value={note} onChangeText={setNote} />
      <Button title={isSaving ? "Saving..." : "Save"} onPress={onSave} disabled={isSaving} />
      {isSaving && (
        <View style={styles.savingRow}>
          <ActivityIndicator size="small" />
          <Text style={styles.savingText}>Saving transaction...</Text>
        </View>
      )}
      <Button title="Cancel" variant="secondary" onPress={() => router.back()} disabled={isSaving} />
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF"
  },
  flex: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
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
  },
  savingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  savingText: {
    color: "#617481"
  }
});
