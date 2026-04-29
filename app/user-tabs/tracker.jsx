import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TrackerScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, selectedOrder, setSelectedOrder } = useUserRequest();
  const activeOrder = typeof order === 'string' ? order : selectedOrder;
  const request = requests.find((item) => item.order === activeOrder) || requests[0];

  useEffect(() => {
    if (request.order !== selectedOrder) {
      setSelectedOrder(request.order);
    }
  }, [request.order, selectedOrder, setSelectedOrder]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageEyebrow, { color: palette.textSecondary }]}>TRACK - REAL-TIME RESTORATION PROGRESS</Text>

        <View style={styles.header}>
          <Text style={[styles.orderTitle, { color: palette.textPrimary }]}>Order {request.order} - Tracking</Text>
          <Text style={[styles.orderSubtitle, { color: palette.textSecondary }]}>{request.subtitle}</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Overall progress</Text>
            <Text style={styles.progressBadge}>
              {request.progress ? `${Math.round(request.progress * 100)}%` : request.stage}
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: palette.softCard }]}>
            <View style={[styles.progressFill, { width: request.progress ? `${request.progress * 100}%` : '100%' }]} />
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Restoration lifecycle</Text>
          <View style={styles.timeline}>
            {request.timeline.map((item, index) => (
              <View key={item.title} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View
                    style={[
                      styles.timelineMarker,
                      item.done ? styles.timelineMarkerDone : null,
                      item.current ? styles.timelineMarkerCurrent : null,
                    ]}>
                    {item.done ? <Ionicons name="checkmark" size={12} color="#173B70" /> : null}
                    {item.current ? <Ionicons name="arrow-forward" size={12} color="#173B70" /> : null}
                    {!item.done && !item.current ? (
                      <Text style={styles.timelineCount}>{index + 1}</Text>
                    ) : null}
                  </View>
                  {index < request.timeline.length - 1 ? (
                    <View style={[styles.timelineLine, { backgroundColor: palette.textSecondary + '60' }]} />
                  ) : null}
                </View>

                <View style={styles.timelineCopy}>
                  <Text style={[styles.timelineTitle, { color: palette.textPrimary }]}>{item.title}</Text>
                  <Text
                    style={[
                      styles.timelineDate,
                      { color: palette.textSecondary },
                      item.current ? styles.timelineCurrentText : null,
                    ]}>
                    {item.date || 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Pre-service condition report</Text>
          <View style={styles.tagWrap}>
            {request.reportTags.map((tag, index) => (
              <Text
                key={tag}
                style={[
                  styles.tag,
                  index === 3 ? styles.tagHighlight : { color: '#403C36', backgroundColor: '#F3EFE8' },
                ]}>
                {tag}
              </Text>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Notifications</Text>
          {request.notifications.map((item) => (
            <View key={item.title} style={[styles.notificationCard, { borderTopColor: palette.textSecondary + '30' }]}>
              <View style={styles.notificationIcon}>
                <Ionicons name="notifications-outline" size={18} color="#4FAE89" />
              </View>
              <View style={styles.notificationCopy}>
                <Text style={[styles.notificationTitle, { color: palette.textPrimary }]}>{item.title}</Text>
                <Text style={[styles.notificationDetail, { color: palette.textSecondary }]}>{item.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 12,
  },
  pageEyebrow: {
    textAlign: 'center',
    letterSpacing: 2,
    fontSize: 11,
  },
  header: {
    gap: 4,
    paddingBottom: 4,
  },
  orderTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  orderSubtitle: {
    fontSize: 14,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressBadge: {
    color: '#205186',
    backgroundColor: '#DCEBFB',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    width: '60%',
    height: '100%',
    backgroundColor: '#2E8BFF',
  },
  timeline: {
    gap: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    alignItems: 'center',
  },
  timelineMarker: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CFC8BE',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3EFE8',
  },
  timelineMarkerDone: {
    borderColor: '#C5F3E3',
    backgroundColor: '#C5F3E3',
  },
  timelineMarkerCurrent: {
    borderColor: '#DCEBFB',
    backgroundColor: '#DCEBFB',
  },
  timelineCount: {
    color: '#7B756C',
    fontSize: 11,
    fontWeight: '700',
  },
  timelineLine: {
    width: 1,
    flex: 1,
    minHeight: 34,
    marginVertical: 4,
  },
  timelineCopy: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  timelineDate: {
    fontSize: 13,
    marginTop: 2,
  },
  timelineCurrentText: {
    color: '#2E8BFF',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  tagHighlight: {
    backgroundColor: '#D7E9FF',
    color: '#1E58A6',
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  notificationIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#E4FAF0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationCopy: {
    flex: 1,
    gap: 2,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  notificationDetail: {
    fontSize: 13,
  },
});

