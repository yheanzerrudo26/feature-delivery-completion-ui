import { useAppTheme } from '@/context/app-theme-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';

export default function AdminDashboardScreen() {
  const { palette } = useAppTheme();
  const [today, setToday] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
      setToday(now.toLocaleDateString(undefined, options));
    };

    updateDate();
    const interval = setInterval(updateDate, 60 * 1000); // refresh every minute

    return () => clearInterval(interval); 
  }, []);

  const metrics = [
    { label: 'Confirmation Form', value: 14 },
    { label: 'Delivery Progress', value: 7 },
    { label: 'Analysing Item', value: 9 },
    { label: 'Processing Work', value: 4 },
    { label: 'Delivery Back', value: 3 },
    { label: 'Complete', value: 2 },
  ];

  const notifications = [
    'Delivery #302 is on the way back to the user.',
    'Delivery #311 arrived at workplace receiving area.',
    'Service payment for order #299 has been completed.',
  ];

  const activities = [
    '08:20 - Staff confirmed new form for item #312.',
    '10:05 - Delivery progress updated to "out for return".',
    '14:18 - Item #298 marked delivered to customer.',
  ];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.headerRow, { backgroundColor: palette.card }]}>
          <View>
            <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>ATELIER COMMAND CENTER</Text>
            <Text style={[styles.title, { color: palette.textPrimary }]}>Executive Dashboard</Text>
            <Text style={[styles.date, { color: palette.textSecondary }]}>{today}</Text>
          </View>
          <Text style={styles.badge}>Admin access only</Text>
        </View>

        <View style={styles.grid}>
          {metrics.map((item) => (
            <View key={item.label} style={[styles.metricCard, { backgroundColor: palette.card }]}>
              <Text style={[styles.metricLabel, { color: palette.textSecondary }]}>{item.label}</Text>
              <Text style={[styles.metricValue, { color: palette.textPrimary }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Notification alerts</Text>
          {notifications.map((item) => (
            <View key={item} style={[styles.noteItem, { backgroundColor: palette.softCard }]}>
              <Text style={[styles.noteText, { color: palette.textPrimary }]}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Recent activity</Text>
          {activities.map((item) => (
            <View key={item} style={[styles.noteItem, { backgroundColor: palette.softCard }]}>
              <Text style={[styles.noteText, { color: palette.textPrimary }]}>{item}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14 },
  headerRow: { borderRadius: 20, padding: 16, gap: 8 },
  eyebrow: { letterSpacing: 2, fontSize: 12 },
  title: { fontSize: 32, fontWeight: '700' },
  date: { fontSize: 15 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: '#E6EDF7',
    color: '#173B70',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontWeight: '700',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricCard: {
    borderRadius: 16,
    padding: 14,
    width: '48%',
    minHeight: 100,
    justifyContent: 'space-between',
  },
  metricLabel: { fontSize: 15 },
  metricValue: { fontSize: 40, fontWeight: '700' },
  sectionCard: { borderRadius: 20, padding: 12, gap: 8 },
  sectionTitle: { fontSize: 22, fontWeight: '700' },
  noteItem: { borderRadius: 14, padding: 12 },
  noteText: { fontSize: 16, lineHeight: 22 },
});
