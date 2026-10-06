import { RequestScreenHeader, SectionCard } from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import {
  routeForAdminStage,
  useAdminRequest,
} from '@/context/admin-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from '../../lib/firebase.js';

export default function AdminViewLogsScreen() {
  const { palette } = useAppTheme();
  const { requests, setSelectedId } = useAdminRequest();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'logs'), (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          items: Array.isArray(d.actions)
            ? d.actions
            : Array.isArray(d.items)
              ? d.items
              : [],
        };
      });
      setLogs(data);
    });
    return () => unsub();
  }, []);

  const completed = requests.filter((item) => item.stage === 'complete');

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Logs"
          subtitle="Completed services, client feedback, and system activity records."
          showBack={false}
        />

        <Text style={[styles.sectionLabel, { color: palette.textPrimary }]}>
          Completed services
        </Text>
        {completed.map((request) => (
          <Pressable
            key={request.id}
            style={[styles.card, { backgroundColor: palette.card }]}
            onPress={() => {
              setSelectedId(request.id);
              router.push(routeForAdminStage('complete', request.id));
            }}
          >
            <View style={styles.rowTop}>
              <Text style={[styles.id, { color: palette.textPrimary }]}>
                {request.id}
              </Text>
              <Text style={styles.archived}>Archived</Text>
            </View>
            <Text style={[styles.name, { color: palette.textPrimary }]}>
              {request.clientName}
            </Text>
            <Text style={{ color: palette.textSecondary }}>{request.item}</Text>
            <View style={styles.footer}>
              <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                Rating {request.feedback?.rating || '—'} / 5
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.textSecondary}
              />
            </View>
          </Pressable>
        ))}

        <Text style={[styles.sectionLabel, { color: palette.textPrimary }]}>
          System activity days
        </Text>
        {logs.length === 0 ? (
          <SectionCard>
            <Text style={{ color: palette.textSecondary }}>
              No Firebase log days yet. Completed service archives above still open.
            </Text>
          </SectionCard>
        ) : (
          logs.map((day) => (
            <Pressable
              key={day.id}
              style={[styles.logButton, { backgroundColor: palette.card }]}
              onPress={() =>
                router.push({
                  pathname: '/admin-tabs/admin-log-details',
                  params: {
                    date: day.id,
                    items: JSON.stringify(day.items),
                  },
                })
              }
            >
              <Text style={[styles.logDate, { color: palette.textPrimary }]}>
                {day.id}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.textSecondary}
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 12, paddingBottom: 32 },
  sectionLabel: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  card: { borderRadius: 18, padding: 14, gap: 4 },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  id: { fontWeight: '700', fontSize: 15 },
  archived: {
    backgroundColor: '#E5EAF2',
    color: '#4A5670',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  name: { fontSize: 17, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  logButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logDate: { fontSize: 18, fontWeight: '700' },
});
