
import {
  InfoBanner,
  RequestScreenHeader,
  SectionCard,
  StepProgress,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CHECKS = [
  { id: 'details', label: 'Details verified' },
  { id: 'photos', label: 'Photo quality confirmed' },
  { id: 'findings', label: 'Preparing findings and protocol' },
];

export default function AiAssessmentScreen() {
  const { palette } = useAppTheme();

  const {
    draft,
    allPhotosPassed,
  } = useUserRequest();

  const [doneCount, setDoneCount] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const timers = [];

      // Reset the progress every time this screen receives focus.
      setDoneCount(0);
      setIsAnalyzing(true);

      const hasItemDetails =
        Boolean(draft.item.itemType?.trim()) &&
        Boolean(draft.item.serviceConcern?.trim());

      const hasAllPhotos =
        Object.keys(draft.photos || {}).length === 5 &&
        Object.values(draft.photos || {}).every(
          (photo) => Boolean(photo?.asset),
        );

      const photosPassed =
        allPhotosPassed &&
        Object.values(draft.photos || {}).every(
          (photo) => photo?.status === 'pass',
        );

      if (!hasItemDetails || !hasAllPhotos || !photosPassed) {
        setIsAnalyzing(false);

        Alert.alert(
          'Assessment incomplete',
          !hasItemDetails
            ? 'Please complete your item details before starting the assessment.'
            : !hasAllPhotos
              ? 'Please upload all five photos of your current item.'
              : 'Some photos have not passed the quality checks. Please return and retake the required photos.',
          [
            {
              text: 'Go back',
              onPress: () => {
                if (isActive) {
                  router.replace('/user-tabs/photo-capture');
                }
              },
            },
          ],
          { cancelable: false },
        );

        return () => {
          isActive = false;
        };
      }

      // These checks use the current draft rather than a previous request.
      timers.push(
        setTimeout(() => {
          if (isActive) setDoneCount(1);
        }, 700),
      );

      timers.push(
        setTimeout(() => {
          if (isActive) setDoneCount(2);
        }, 1500),
      );

      timers.push(
        setTimeout(() => {
          if (isActive) setDoneCount(3);
        }, 2400),
      );

      timers.push(
        setTimeout(() => {
          if (isActive) {
            setIsAnalyzing(false);
            router.replace('/user-tabs/assessment-report');
          }
        }, 3000),
      );

      return () => {
        isActive = false;
        timers.forEach(clearTimeout);
      };
    }, [draft, allPhotosPassed]),
  );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <View style={styles.container}>
        <RequestScreenHeader
          title="AI Assessment"
          subtitle="Analyzing your current item details and photos."
        />

        <StepProgress activeIndex={2} />

        <View style={styles.centerBlock}>
          <View
            style={[
              styles.loaderRing,
              { borderColor: palette.softCard },
            ]}
          >
            <View
              style={[
                styles.loaderInner,
                { backgroundColor: palette.softCard },
              ]}
            >
              <Ionicons
                name="sparkles"
                size={28}
                color={palette.accent}
              />
            </View>
          </View>

          <Text
            style={[
              styles.analyzing,
              { color: palette.textPrimary },
            ]}
          >
            {isAnalyzing ? 'Analyzing your item…' : 'Assessment complete'}
          </Text>

          {isAnalyzing ? (
            <ActivityIndicator color={palette.accent} />
          ) : (
            <Ionicons
              name="checkmark-circle"
              size={24}
              color="#157651"
            />
          )}
        </View>

        <SectionCard>
          {CHECKS.map((check, index) => {
            const done = index < doneCount;
            const active = isAnalyzing && index === doneCount;

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
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#157651"
                    />
                  ) : active ? (
                    <ActivityIndicator
                      size="small"
                      color={palette.accent}
                    />
                  ) : (
                    <View style={styles.pendingDot} />
                  )}
                </View>

                <Text
                  style={[
                    styles.checkLabel,
                    {
                      color:
                        done || active
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
