import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const photoSlots = ['Front', 'Side', 'Heel', 'Sole', 'Damage detail'];

export default function PhotoDocumentationScreen() {
  const { palette } = useAppTheme();
  const { draft, completedPhotos, allPhotosUploaded, updatePhoto } = useUserRequest();

  const pickImage = async (label) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.[0]) {
      updatePhoto(label, result.assets[0]);
    }
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageEyebrow, { color: palette.textSecondary }]}>SECTION 5 - PHOTO DOCUMENTATION</Text>

        <View style={styles.header}>
          <Pressable style={[styles.iconButton, { backgroundColor: palette.softCard }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: palette.textPrimary }]}>Atelier checklist</Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Step 5 of 6 - Photo documentation</Text>
          </View>
        </View>

        <View style={styles.stepRail}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.stepLine,
                index < 4 ? styles.stepLineDone : null,
                index === 4 ? styles.stepLineCurrent : null,
              ]}
            />
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <Text style={[styles.helperText, { color: palette.textPrimary }]}>
            All 5 angles are required to establish the forensic baseline. Submission is locked until all
            are uploaded.
          </Text>

          <View style={styles.grid}>
            {photoSlots.map((label) => {
              const asset = draft.photos[label];
              const complete = Boolean(asset);

              return (
                <Pressable
                  key={label}
                  style={[
                    styles.photoTile,
                    complete
                      ? styles.photoTileComplete
                      : { borderColor: palette.textSecondary + '60', backgroundColor: palette.softCard },
                  ]}
                  onPress={() => pickImage(label)}>
                  {asset ? (
                    <Image source={{ uri: asset.uri }} style={styles.photoPreview} contentFit="cover" />
                  ) : (
                    <Ionicons name="camera-outline" size={20} color={palette.textSecondary} />
                  )}
                  <Text
                    style={[
                      styles.photoLabel,
                      complete ? styles.photoLabelComplete : { color: palette.textSecondary },
                    ]}>
                    {label}
                  </Text>
                  <Text
                    style={[
                      styles.photoHint,
                      complete ? styles.photoHintComplete : { color: palette.textSecondary },
                    ]}>
                    {complete ? 'Added' : 'Tap to upload'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.counterPill, { backgroundColor: palette.softCard }]}>
            <Text style={[styles.counterText, { color: palette.textPrimary }]}>
              {photoSlots.length - completedPhotos} photos remaining
              {completedPhotos < photoSlots.length ? ' - complete all 5 angles' : ' - all angles uploaded'}
            </Text>
          </View>

          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: allPhotosUploaded ? '#14A572' : '#2E8BFF' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Verified handshake preview</Text>
          </View>

          <Text style={[styles.handshakeText, { color: palette.textSecondary }]}>
            {allPhotosUploaded
              ? 'Photo requirement complete. The verified handshake preview is now active for intake confirmation.'
              : 'Upload all mandatory angles to unlock the verified handshake preview.'}
          </Text>

          <View style={styles.previewWrap}>
            {[
              `Photos complete: ${completedPhotos}/5`,
              `Brand: ${draft.general.brandModel || 'Pending details'}`,
              `Service: ${draft.serviceProtocol}`,
              allPhotosUploaded ? 'Handshake ready' : 'Handshake locked',
            ].map((item, index) => (
              <Text
                key={item}
                style={[
                  styles.previewPill,
                  index === 3 ? styles.previewPillHighlight : { color: '#403C36', backgroundColor: '#F3EFE8' },
                ]}>
                {item}
              </Text>
            ))}
          </View>

          <Pressable
            style={[
              styles.lockedButton,
              allPhotosUploaded ? styles.lockedButtonActive : { backgroundColor: palette.textSecondary + '40' },
            ]}
            disabled={!allPhotosUploaded}
            onPress={() => router.push('/user-tabs/payment-signoff')}>
            <Text
              style={[
                styles.lockedButtonText,
                allPhotosUploaded ? styles.lockedButtonTextActive : { color: palette.textSecondary },
              ]}>
              {allPhotosUploaded
                ? 'Continue to payment and sign-off'
                : `Submit locked (${photoSlots.length - completedPhotos} photos pending)`}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.helperCard, { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '30' }]}>
          <Ionicons name="information-circle-outline" size={18} color={palette.accent} />
          <Text style={[styles.helperCardText, { color: palette.textSecondary }]}>
            Add clear photos for front, side, heel, sole, and damage detail. Tap any tile again if you want to
            replace an image.
          </Text>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '60' },
            !allPhotosUploaded ? styles.primaryButtonDisabled : null,
          ]}
          disabled={!allPhotosUploaded}
          onPress={() => router.push('/user-tabs/payment-signoff')}>
          <Text style={[styles.primaryButtonText, { color: palette.textPrimary }]}>
            Continue to payment and sign-off
          </Text>
          <Ionicons name="arrow-forward" size={16} color={palette.textPrimary} />
        </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  stepRail: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-end',
  },
  stepLine: {
    width: 18,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#555149',
  },
  stepLineDone: {
    backgroundColor: '#14A572',
  },
  stepLineCurrent: {
    backgroundColor: '#2E8BFF',
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  helperText: {
    fontSize: 14,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoTile: {
    width: '31.5%',
    minHeight: 128,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  photoTileComplete: {
    borderStyle: 'solid',
    borderColor: '#B8D86B',
    backgroundColor: '#E8F5CC',
  },
  photoLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  photoHint: {
    fontSize: 11,
    textAlign: 'center',
  },
  photoLabelComplete: {
    color: '#46671D',
    fontWeight: '600',
  },
  photoHintComplete: {
    color: '#46671D',
  },
  photoPreview: {
    width: '100%',
    height: 64,
    borderRadius: 8,
  },
  counterPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  counterText: {
    fontSize: 13,
  },
  lockedButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  lockedButtonActive: {
    backgroundColor: '#DCEBFB',
  },
  lockedButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  lockedButtonTextActive: {
    color: '#16407A',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  handshakeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  previewWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewPill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
  },
  previewPillHighlight: {
    backgroundColor: '#D7E9FF',
    color: '#1E58A6',
  },
  helperCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
  },
  helperCardText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

