import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/app-theme-context';
import React from 'react';

export default function UserDashboardScreen() {
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={styles.badge}>User access</Text>
        <Text style={[styles.title, { color: palette.textPrimary }]}>User Dashboard</Text>
        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
          You are logged in as a user. Admin tools are only available to admin accounts.
        </Text>
        <Pressable style={styles.button} onPress={() => router.replace('/login')}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF3FA',
    color: '#173B70',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontWeight: '700',
    marginBottom: 14,
  },
  title: { fontSize: 34, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 22, marginBottom: 18 },
  button: {
    backgroundColor: '#D42A2A',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
