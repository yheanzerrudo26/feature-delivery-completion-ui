import {
  InfoBanner,
  RequestScreenHeader,
  SectionCard,
  StepProgress,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHECKS = [
  { id: 'details', label: 'Details verified' },
  { id: 'photos', label: 'Photo quality confirmed' },
  { id: 'findings', label: 'Preparing findings and protocol' },
];

export default function AiAssessmentScreen() {
  const { palette } = useAppTheme();
  const [doneCount, setDoneCount] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setDoneCount(1), 700),
      setTimeout(() => setDoneCount(2), 1500),
      setTimeout(() => setDoneCount(3), 2400),
      setTimeout(() => router.replace('/user-tabs/assessment-report'), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <View style={styles.container}>
        <RequestScreenHeader
          title="AI Assessment"
          subtitle="Analyzing your photos and item details."
        />

        <StepProgress activeIndex={2} />

        <View style={styles.centerBlock}>
          <View style={[styles.loaderRing, { borderColor: palette.softCard }]}>
            <View
              style={[styles.loaderInner, { backgroundColor: palette.softCard }]}
            >
              <Ionicons name="sparkles" size={28} color={palette.accent} />
            </View>
          </View>
          <Text style={[styles.analyzing, { color: palette.textPrimary }]}>
            Analyzing your item…
          </Text>
          <ActivityIndicator color={palette.accent} />
        </View>

        <SectionCard>
          {CHECKS.map((check, index) => {
            const done = index < doneCount;
            const active = index === doneCount;
            return (
              <View key={check.id} style={styles.checkRow}>
                <View
                  style={[
                    styles.checkIcon,
                    {
                      backgroundColor: done
                        ? '#DDF9EC'
                        : active
                          ? '#E8F1FF'
                          : palette.softCard,
                    },
                  ]}
                >
                  {done ? (
                    <Ionicons name="checkmark" size={16} color="#157651" />
                  ) : active ? (
                    <ActivityIndicator size="small" color={palette.accent} />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.checkLabel,
                    {
                      color: done || active
                        ? palette.textPrimary
                        : palette.textSecondary,
                      fontWeight: done || active ? '600' : '400',
                    },
                  ]}
                >
                  {check.label}
                </Text>
              </View>
            );
          })}
        </SectionCard>

        <InfoBanner
          tone="warn"
          text="AI provides a preliminary assessment. An Admin / Artisan still reviews and decides whether to accept or decline."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 24,
  },
  loaderRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzing: {
    fontSize: 18,
    fontWeight: '700',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C5CDD9',
  },
  checkLabel: {
    fontSize: 14,
    flex: 1,
  },
});
