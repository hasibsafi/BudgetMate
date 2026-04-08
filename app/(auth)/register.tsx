import React, { useState } from "react";
import { Link } from "expo-router";
import { Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";

export default function RegisterScreen(): React.JSX.Element {
  const { signUp, signInWithGoogle } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const onSubmit = async (): Promise<void> => {
    try {
      await signUp(email.trim(), password, name.trim());
    } catch (error) {
      Alert.alert("Registration failed", (error as Error).message);
    }
  };

  const onGoogleSubmit = async (): Promise<void> => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert("Google sign-up failed", (error as Error).message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <Text style={styles.title}>Create Account</Text>
      <Input label="Name" value={name} onChangeText={setName} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Button title="Sign Up" onPress={onSubmit} />
      <Button
        title={isGoogleLoading ? "Connecting Google..." : "Sign up with Google"}
        variant="secondary"
        onPress={() => void onGoogleSubmit()}
        disabled={isGoogleLoading}
      />
      <Link href="/(auth)/login" style={styles.link}>
        Already have an account?
      </Link>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    gap: 14,
    backgroundColor: "#F6F8F9"
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
