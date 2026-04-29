import { useAppTheme } from '@/context/app-theme-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLogDetailsScreen() {
  const params = useLocalSearchParams();
  const { palette } = useAppTheme();

  const date = params.date ?? 'Selected Date';

  const items = params.items ? JSON.parse(params.items) : [];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <View style={[styles.header, { backgroundColor: palette.card }]}>
        <Text style={[styles.eyebrow, { color: palette.textSecondary }]}>
          ACTIVITY REVIEW
        </Text>
        <Text style={[styles.title, { color: palette.textPrimary }]}>
          {date}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.list, { backgroundColor: palette.card }]}
      >
        {items.map((item, index) => {
          const time = item.createdAt
            ? new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';

          return (
            <View
              key={index}
              style={[styles.activityItem, { backgroundColor: palette.softCard }]}
            >
              <Text style={[styles.activityText, { color: palette.textPrimary }]}>
                {item.type.toUpperCase()} - {item.message}
              </Text>

              {}
              {time !== '' && (
                <Text style={{ fontSize: 12, opacity: 0.6 }}>
                  {time}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <Pressable style={styles.backButton} onPress={() => router.replace('/admin-tabs/admin-view-logs')}>
        <Text style={styles.backButtonText}>Back to Logs</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },

  header: {
    borderRadius: 20,
    padding: 16,
  },

  eyebrow: {
    letterSpacing: 2,
    fontSize: 12,
  },

  title: {
    fontSize: 34,
    fontWeight: '700',
    marginTop: 6,
  },

  list: {
    padding: 12,
    borderRadius: 24,
    gap: 10,
  },

  activityItem: {
    borderRadius: 14,
    padding: 14,
  },

  activityText: {
    fontSize: 17,
    lineHeight: 24,
  },

  backButton: {
    backgroundColor: '#173B70',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

