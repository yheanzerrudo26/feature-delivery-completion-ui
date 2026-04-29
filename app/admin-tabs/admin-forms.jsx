import { useAppTheme } from '@/context/app-theme-context';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const forms = [
  { name: 'Mia Santos', service: 'Heritage Conditioning' },
  { name: 'Ethan Cruz', service: 'Structural Repair' },
  { name: 'Lina Reyes', service: 'Polish & Finish' },
];

export default function AdminFormsScreen() {
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: palette.card }]}>
        <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>REQUEST FORMS</Text>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Forms inbox</Text>
        <Text style={styles.badge}>3 pending</Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        {forms.map((item) => (
          <View key={item.name} style={[styles.rowCard, { backgroundColor: palette.softCard }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: palette.textPrimary }]}>{item.name}</Text>
              <Text style={[styles.service, { color: palette.textSecondary }]}>{item.service}</Text>
            </View>
            <Text style={[styles.action, styles.confirm]}>Confirm</Text>
            <Text style={[styles.action, styles.cancel]}>Cancel</Text>
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
  service: { fontSize: 18 },
  action: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 12, overflow: 'hidden', fontWeight: '700' },
  confirm: { backgroundColor: '#173B70', color: '#fff' },
  cancel: { backgroundColor: '#F7DDE1', color: '#D64158' },
});

