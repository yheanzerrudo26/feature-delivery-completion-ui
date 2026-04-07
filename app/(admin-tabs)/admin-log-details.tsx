import { useLocalSearchParams, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/app-theme-context';

export default function AdminLogDetailsScreen() {
  const params = useLocalSearchParams<{ date?: string; details?: string }>();
  const { palette } = useAppTheme();
  const date = params.date ?? 'Selected Date';
  const details = (params.details ?? '').split('\n').filter(Boolean);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: palette.card }]}>
        <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>ACTIVITY REVIEW</Text>
        <Text style={[styles.title, { color: palette.textPrimary }]}>{date}</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.list, { backgroundColor: palette.card }]}>
        {details.map((item) => (
          <View key={item} style={[styles.activityItem, { backgroundColor: palette.softCard }]}>
            <Text style={[styles.activityText, { color: palette.textPrimary }]}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Back to Logs</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  header: { borderRadius: 20, padding: 16 },
  eyebrow: { letterSpacing: 2, fontSize: 12 },
  title: { fontSize: 34, fontWeight: '700', marginTop: 6 },
  list: { padding: 12, borderRadius: 24, gap: 10 },
  activityItem: { borderRadius: 14, padding: 14 },
  activityText: { fontSize: 17, lineHeight: 24 },
  backButton: {
    backgroundColor: '#173B70',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
