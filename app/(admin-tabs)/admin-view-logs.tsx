import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/app-theme-context';

const logs = [
  {
    date: 'Apr 07, 2026',
    details:
      '08:12 - New confirmation form received for item #309.\n10:35 - Item moved to analyzing stage.\n16:48 - Customer updated expected pickup date.',
  },
  {
    date: 'Apr 06, 2026',
    details:
      '09:05 - Payment verified for order #301.\n13:22 - Workshop progress updated by staff.\n17:00 - Admin approved final polish.',
  },
  {
    date: 'Apr 05, 2026',
    details:
      '07:45 - New account registration approved.\n11:15 - Delivery booked for two repaired items.\n15:30 - Logs exported for compliance review.',
  },
];

export default function AdminViewLogsScreen() {
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: palette.card }]}>
        <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>PROGRESS LOGS</Text>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Daily records</Text>
        <Text style={styles.badge}>3 days</Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        {logs.map((item) => (
          <Pressable
            key={item.date}
            style={[styles.logButton, { backgroundColor: palette.softCard }]}
            onPress={() =>
              router.push({
                pathname: '/(admin-tabs)/admin-log-details',
                params: { date: item.date, details: item.details },
              })
            }>
            <Text style={[styles.logDate, { color: palette.textPrimary }]}>{item.date}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  header: { backgroundColor: '#F7F9FC', borderRadius: 20, padding: 16 },
  eyebrow: { letterSpacing: 2, fontSize: 12 },
  title: { fontSize: 40, fontWeight: '700', marginTop: 6 },
  badge: {
    alignSelf: 'flex-end',
    backgroundColor: '#F2EDDE',
    color: '#8A6510',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 6,
    fontWeight: '700',
  },
  card: { backgroundColor: '#F7F9FC', borderRadius: 24, padding: 12, gap: 10 },
  logButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logDate: { fontSize: 27, fontWeight: '700' },
});
