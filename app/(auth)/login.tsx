import React, { useState } from "react";
import { Link } from "expo-router";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";

export default function LoginScreen(): React.JSX.Element {
  const { signIn, signInWithGoogle } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    try {
      await signIn(email.trim(), password);
    } catch (error) {
      Alert.alert("Login failed", (error as Error).message);
    }
  };

  const onGoogleSubmit = async (): Promise<void> => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert("Google sign-in failed", (error as Error).message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={styles.inner} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <Text style={styles.title}>BudgetMate</Text>
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Login" onPress={onSubmit} />
      <Button
        title={isGoogleLoading ? "Connecting Google..." : "Sign in with Google"}
        variant="secondary"
        onPress={() => void onGoogleSubmit()}
        disabled={isGoogleLoading}
      />
      <Link href="/(auth)/register" style={styles.link}>
        Create an account
      </Link>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8F9"
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 14
  },
  title: {
    fontSize: 28,
    fontWeight: "900"
  },
  link: {
    textAlign: "center",
    color: "#1F7A8C",
    fontWeight: "700"
  }
});
