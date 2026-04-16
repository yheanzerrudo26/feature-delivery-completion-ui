import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/app-theme-context';
import React from 'react';

export default function SettingsScreen() {
  const { isDark, setMode, palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>Settings</Text>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.label, { color: palette.textPrimary }]}>Theme mode</Text>
        <Text style={[styles.description, { color: palette.textSecondary }]}>
          Use the slider to switch between light and dark for dashboard screens.
        </Text>
        <View style={styles.switchRow}>
          <Text style={[styles.option, { color: palette.textSecondary }]}>Light</Text>
          <Switch
            value={isDark}
            onValueChange={(value) => setMode(value ? 'dark' : 'light')}
            trackColor={{ false: '#BFCADC', true: '#6F9BE0' }}
            thumbColor={isDark ? '#173B70' : '#F7F9FC'}
          />
          <Text style={[styles.option, { color: palette.textSecondary }]}>Dark</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 32, fontWeight: '700' },
  card: { borderRadius: 20, padding: 16, gap: 8 },
  label: { fontSize: 22, fontWeight: '700' },
  description: { fontSize: 16, lineHeight: 22 },
  switchRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  option: { fontSize: 16, fontWeight: '600' },
});
