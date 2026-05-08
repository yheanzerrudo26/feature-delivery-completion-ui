import { db } from '@/backend/firebase';
import { useAppTheme } from '@/context/app-theme-context';
import { router } from 'expo-router';
import { collection, onSnapshot } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminViewLogsScreen() {
  const { palette } = useAppTheme();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'logs'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        items: doc.data().items || []
      }));

      setLogs(data);
    });

    return () => unsub();
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]}>

      <View style={[styles.header, { backgroundColor: palette.card }]}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          Daily records
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        {logs.map((day) => (
          <Pressable
            key={day.id}
            style={[styles.logButton, { backgroundColor: palette.softCard }]}
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
          </Pressable>
        ))}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16 },
  header: { borderRadius: 20, padding: 16, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: '700' },
  card: { borderRadius: 24, padding: 12, gap: 10 },
  logButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logDate: {
    fontSize: 22,
    fontWeight: '700',
  },
});

