import { useAppTheme } from '@/context/app-theme-context';
import {
  routeForAdminStage,
  useAdminRequest,
} from '@/context/admin-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RequestScreenHeader } from '@/components/RequestUI';

export default function AdminPaymentScreen() {
  const { palette } = useAppTheme();
  const { requests, counts, setSelectedId } = useAdminRequest();

  const paymentRows = requests.filter(
    (item) =>
      !['pending_review', 'declined'].includes(item.stage) ||
      item.paymentStatus === 'Paid',
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Service payments"
          subtitle="Monitor GCash service-fee settlements. Delivery cost is paid to the courier separately."
          showBack={false}
        />

        <View style={styles.statsRow}>
          <View style={[styles.stat, { backgroundColor: '#DDF9EC' }]}>
            <Text style={{ color: '#157651', fontSize: 24, fontWeight: '700' }}>
              {counts.paid}
            </Text>
            <Text style={{ color: '#157651', fontWeight: '600' }}>Paid</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: '#FDECEC' }]}>
            <Text style={{ color: '#B42318', fontSize: 24, fontWeight: '700' }}>
              {counts.unpaid}
            </Text>
            <Text style={{ color: '#B42318', fontWeight: '600' }}>Unpaid</Text>
          </View>
        </View>

        {paymentRows.map((request) => {
          const paid = request.paymentStatus === 'Paid';
          return (
            <Pressable
              key={request.id}
              style={[styles.card, { backgroundColor: palette.card }]}
              onPress={() => {
                setSelectedId(request.id);
                router.push(routeForAdminStage(request.stage, request.id));
              }}
            >
              <View style={styles.rowTop}>
                <Text style={[styles.id, { color: palette.textPrimary }]}>
                  {request.id}
                </Text>
                <Text style={[styles.status, paid ? styles.paid : styles.unpaid]}>
                  {request.paymentStatus}
                </Text>
              </View>
              <Text style={[styles.name, { color: palette.textPrimary }]}>
                {request.clientName}
              </Text>
              <Text style={{ color: palette.textSecondary }}>
                {request.serviceProtocol}
              </Text>
              <View style={styles.rowBottom}>
                <Text style={[styles.amount, { color: palette.textPrimary }]}>
                  ₱{(request.fee || 0).toLocaleString()}
                </Text>
                <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                  {request.paymentRef || 'Waiting for GCash detection'}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={palette.textSecondary}
                />
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    gap: 4,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: { fontSize: 15, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700' },
  status: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: '700',
    fontSize: 11,
  },
  paid: { backgroundColor: '#CFE8DF', color: '#127855' },
  unpaid: { backgroundColor: '#F8DDE0', color: '#D64158' },
  amount: { fontSize: 20, fontWeight: '700' },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
});
