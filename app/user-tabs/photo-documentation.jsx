import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import {
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
  StepProgress,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PhotoDocumentationScreen() {
  const { palette } = useAppTheme();
  const {
    draft,
    photoSlots,
    updatePhoto,
    allPhotosPassed,
    failedPhotos,
    passedPhotos,
  } = useUserRequest();

  const pickImage = async (label) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.75,
    });

    if (!result.canceled && result.assets?.[0]) {
      updatePhoto(label, result.assets[0]);
    }
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={140}
    >
      <RequestScreenHeader
        title="Required Photos"
        subtitle="Capture clear angles. AI checks clarity, framing, and lighting."
      />

      <StepProgress activeIndex={1} />

      <InfoBanner
        tone="info"
        text="All 5 photos must pass before you can continue to AI assessment."
      />

      <SectionCard>
        {photoSlots.map((label) => {
          const photo = draft.photos[label];
          const hasAsset = Boolean(photo?.asset);
          const passed = photo?.status === 'pass';
          const failed = photo?.status === 'fail';

          return (
            <Pressable
              key={label}
              onPress={() => pickImage(label)}
              style={[
                styles.photoRow,
                {
                  backgroundColor: palette.softCard,
                  borderColor: failed
                    ? '#F0B4B4'
                    : passed
                      ? '#A8DFC0'
                      : palette.textSecondary + '25',
                },
              ]}
            >
              <View style={styles.thumbWrap}>
                {hasAsset ? (
                  <Image
                    source={{ uri: photo.asset.uri }}
                    style={styles.thumb}
                    contentFit="cover"
                  />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={22}
                    color={palette.textSecondary}
                  />
                )}
              </View>

              <View style={styles.photoMeta}>
                <View style={styles.photoTitleRow}>
                  <Text style={[styles.photoLabel, { color: palette.textPrimary }]}>
                    {label}
                  </Text>
                  {passed ? (
                    <View style={[styles.badge, styles.badgePass]}>
                      <Text style={styles.badgePassText}>Passed</Text>
                    </View>
                  ) : null}
                  {failed ? (
                    <View style={[styles.badge, styles.badgeFail]}>
                      <Text style={styles.badgeFailText}>Recapture</Text>
                    </View>
                  ) : null}
                  {!hasAsset ? (
                    <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                      Tap to upload
                    </Text>
                  ) : null}
                </View>

                {hasAsset ? (
                  <View style={styles.checkRow}>
                    <QualityChip label="Clarity" ok={photo.clarity === 'ok'} />
                    <QualityChip label="Framing" ok={photo.framing === 'ok'} />
                    <QualityChip label="Lighting" ok={photo.lighting === 'ok'} />
                  </View>
                ) : null}

                {failed && photo.message ? (
                  <Text style={styles.failMessage}>{photo.message}</Text>
                ) : null}
              </View>

              <Ionicons
                name={failed ? 'refresh' : 'chevron-forward'}
                size={18}
                color={palette.textSecondary}
              />
            </Pressable>
          );
        })}
      </SectionCard>

      <PrimaryButton
        label={
          allPhotosPassed
            ? 'Next Step'
            : failedPhotos > 0
              ? 'Next Step — Locked'
              : 'Next Step — Locked'
        }
        icon={allPhotosPassed ? 'arrow-forward' : 'lock-closed'}
        disabled={!allPhotosPassed}
        onPress={() => router.push('/user-tabs/ai-assessment')}
      />

      {!allPhotosPassed ? (
        <Text style={[styles.helper, { color: palette.textSecondary }]}>
          {failedPhotos > 0
            ? `${failedPhotos} photo${failedPhotos > 1 ? 's' : ''} need recapture. ${passedPhotos} passed.`
            : 'Upload all 5 required angles to continue.'}
        </Text>
      ) : null}
    </KeyboardAwareScreen>
  );
}

function QualityChip({ label, ok }) {
  return (
    <Text style={[styles.qualityChip, ok ? styles.qualityOk : styles.qualityFail]}>
      {ok ? '✓' : '✗'} {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  photoRow: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  photoMeta: {
    flex: 1,
    gap: 4,
  },
  photoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  photoLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgePass: {
    backgroundColor: '#DDF9EC',
  },
  badgePassText: {
    color: '#157651',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeFail: {
    backgroundColor: '#FDECEC',
  },
  badgeFailText: {
    color: '#B42318',
    fontSize: 11,
    fontWeight: '700',
  },
  checkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  qualityChip: {
    fontSize: 11,
    fontWeight: '600',
  },
  qualityOk: {
    color: '#157651',
  },
  qualityFail: {
    color: '#B42318',
  },
  failMessage: {
    color: '#B42318',
    fontSize: 12,
    fontWeight: '600',
  },
  helper: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: -4,
  },
});
