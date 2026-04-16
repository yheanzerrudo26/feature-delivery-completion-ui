import { Image } from 'expo-image';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function OpeningScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Image source={require('@/assets/images/logo.png')} style={styles.logo} contentFit="contain" />
        <Text style={styles.title}>Mabuli Leather Works</Text>
        <Text style={styles.subtitle}>
          Artisan leather care, tracking, and client service designed for mobile workflow.
        </Text>
      </View>

      <View style={styles.actionCard}>
        <Pressable style={styles.primaryButton} onPress={() => router.push('/login')}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.linkText}>Create an account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9EEF5',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#F7F9FC',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1B2B50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5670',
    textAlign: 'center',
    lineHeight: 24,
  },
  actionCard: {
    backgroundColor: '#F7F9FC',
    borderRadius: 24,
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#173B70',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  linkText: {
    color: '#173B70',
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '600',
  },
});
