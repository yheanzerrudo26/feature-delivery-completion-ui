import { loginUser, fetchUserRole } from "@/lib/auth.service.js";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator, } from "react-native";
import { API_URL } from "../../lib/config";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 

  const disabled = useMemo(
    () => !email.trim() || !password.trim() || loading,
    [email, password, loading]
  );

  const handleLogin = async () => {
    setLoading(true);
    try {
      const user = await loginUser(email.trim(), password);

      const roleData = await fetchUserRole(user.uid);
      const role = roleData?.role || "user";

      fetch(`${API_URL}/api/logs/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          action: "LOGIN",
          message: "User logged in",
        }),
      }).catch(err => console.error("Logging failed", err));

      if (role === "admin") {
        router.replace("/admin-tabs/admin-dashboard");
      } else {
        router.replace("/user-tabs/user-dashboard");
      }
    } catch (e) {
      let message = "Unable to sign in. Please try again.";
      if (e.code === "auth/invalid-credential") message = "Invalid email or password.";
      if (e.code === "auth/network-request-failed") message = "Network error. Check your connection.";
      
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>Login</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to track leather service and progress updates.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />

        <Pressable
          style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
          onPress={handleLogin}
          disabled={disabled}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Login</Text>
          )}
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.smallText}>New user? </Text>
          <Pressable onPress={() => router.push("/tabs/register")}>
            <Text style={styles.linkText}>Create account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EEF5",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#F7F9FC",
    borderRadius: 24,
    padding: 24,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#F2EDDE",
    color: "#8A6510",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
    fontWeight: "700",
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1B2B50",
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: "#4A5670",
    fontSize: 16,
    lineHeight: 22,
  },
  label: {
    color: "#33415E",
    marginBottom: 6,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E3",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: "#EEF3FA",
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: "#173B70",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },
  smallText: {
    color: "#4A5670",
    fontSize: 15,
  },
  linkText: {
    color: "#173B70",
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "700",
  },
});
