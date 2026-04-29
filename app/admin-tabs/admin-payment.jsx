import { useAppTheme } from '@/context/app-theme-context';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const payments = [
  { name: 'Aria Gomez', service: 'Repair & Conditioning', status: 'Paid', amount: '₱2,850' },
  { name: 'Julian Tan', service: 'Cleaning & Polish', status: 'Unpaid', amount: '₱1,600' },
  { name: 'Maya Li', service: 'Restoration', status: 'Paid', amount: '₱4,050' },
];

export default function AdminPaymentScreen() {
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: palette.card }]}>
        <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>PAYMENT TRACKING</Text>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Service payments</Text>
        <Text style={styles.badge}>2 paid</Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        {payments.map((item) => (
          <View key={item.name} style={[styles.rowCard, { backgroundColor: palette.softCard }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: palette.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.service, { color: palette.textSecondary }]}>{item.service}</Text>
            </View>
            <Text style={[styles.status, item.status === 'Paid' ? styles.paid : styles.unpaid]}>
              {item.status}
            </Text>
            <Text style={[styles.amount, { color: palette.textPrimary }]}>{item.amount}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  header: { borderRadius: 20, padding: 16 },
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
  card: { borderRadius: 24, padding: 12, gap: 10 },
  rowCard: {
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  name: { fontSize: 23, fontWeight: '700' },
  service: { fontSize: 17 },
  status: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, overflow: 'hidden', fontWeight: '700' },
  paid: { backgroundColor: '#CFE8DF', color: '#127855' },
  unpaid: { backgroundColor: '#F8DDE0', color: '#D64158' },
  amount: { fontSize: 23, fontWeight: '700' },
});

