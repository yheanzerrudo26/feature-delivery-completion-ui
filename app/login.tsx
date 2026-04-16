import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { loginUser } from '../services/auth.service';


function isAdminEmail(email: string) {
  const value = email.trim().toLowerCase();
  return value === 'admin@mabuli.com' || value.startsWith('admin');
}

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const disabled = useMemo(() => !email.trim() || !password.trim(), [email, password]);

  const onLogin = () => {
    if (isAdminEmail(email)) {
      router.replace('/(admin-tabs)/admin-dashboard');
      return;
    }
    router.replace('/user-dashboard');
  };

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      onLogin(); 
    } catch (e: any) {
      Alert.alert("Login Error", e.message || "Something went wrong");
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
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        <Pressable
          style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
          onPress={handleLogin}
          disabled={disabled}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.smallText}>New user? </Text>
          <Pressable onPress={() => router.push('/register')}>
            <Text style={styles.linkText}>Create account</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E9EEF5', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#F7F9FC', borderRadius: 24, padding: 24 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2EDDE',
    color: '#8A6510',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
    fontWeight: '700',
  },
  title: { fontSize: 36, fontWeight: '700', color: '#1B2B50' },
  subtitle: { marginTop: 8, marginBottom: 20, color: '#4A5670', fontSize: 16, lineHeight: 22 },
  label: { color: '#33415E', marginBottom: 6, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E3',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 14,
    backgroundColor: '#EEF3FA',
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: '#173B70',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: { opacity: 0.6 },
  primaryButtonText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  row: { flexDirection: 'row', justifyContent: 'center', marginTop: 14 },
  smallText: { color: '#4A5670', fontSize: 15 },
  linkText: { color: '#173B70', textDecorationLine: 'underline', fontSize: 15, fontWeight: '700' },
});
