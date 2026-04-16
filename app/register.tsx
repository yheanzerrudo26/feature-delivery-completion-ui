import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';

import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const disabled = useMemo(() => {
    const requiredValues = [firstName, lastName, email, password, confirmPassword];
    return requiredValues.some((value) => !value.trim()) || password !== confirmPassword;
  }, [firstName, lastName, email, password, confirmPassword]);

  const onRegister = () => {
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.badge}>Register</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join the Mabuli Leather Works portal for artisans and clients.</Text>

        <Text style={styles.label}>First Name</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="Jane" />

        <Text style={styles.label}>Last Name</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Artisan" />

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

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••"
          secureTextEntry
        />

        {password !== confirmPassword && confirmPassword.length > 0 ? (
          <Text style={styles.error}>Passwords do not match.</Text>
        ) : null}

        <Pressable
          style={[styles.primaryButton, disabled && styles.primaryButtonDisabled]}
          onPress={onRegister}
          disabled={disabled}>
          <Text style={styles.primaryButtonText}>Register</Text>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.smallText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/login')}>
            <Text style={styles.linkText}>Login</Text>
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
    backgroundColor: '#E6EDF7',
    color: '#173B70',
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
    marginBottom: 12,
    backgroundColor: '#EEF3FA',
  },
  error: { color: '#D42A2A', fontWeight: '600', marginBottom: 8 },
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
