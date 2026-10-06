import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import {
  FieldLabel,
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function DeliveryConfirmationScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const {
    requests,
    draft,
    updateDeliveryField,
    updateRequestStage,
    setSelectedOrder,
  } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) || requests[0];

  const canSubmit =
    draft.delivery.courier.trim() &&
    draft.delivery.trackingNo.trim() &&
    draft.delivery.receiptUri;

  const pickReceipt = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      updateDeliveryField('receiptUri', result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    updateRequestStage(request.order, {
      stage: 'in_progress',
      badge: 'In restoration',
      badgeVariant: 'blue',
      detail: 'Artisan will start once the item is received',
      progress: 0.55,
      delivery: {
        courier: draft.delivery.courier,
        trackingNo: draft.delivery.trackingNo,
        receiptUri: draft.delivery.receiptUri,
      },
    });
    setSelectedOrder(request.order);
    router.replace('/user-tabs/user-dashboard');
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Delivery Confirmation"
        subtitle="Book a third-party courier, then upload the e-receipt."
      />

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Workshop drop-off
        </Text>
        <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
          Mabuli Atelier Workshop
        </Text>
        <Text style={{ color: palette.textSecondary, lineHeight: 20 }}>
          214 Leather Lane, Makati City{'\n'}
          Contact: {request.artisan?.name || 'Artisan'} ·{' '}
          {request.artisan?.contact || ''}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Upload courier e-receipt
        </Text>
        <Pressable
          onPress={pickReceipt}
          style={[
            styles.uploadBox,
            {
              backgroundColor: palette.softCard,
              borderColor: palette.textSecondary + '35',
            },
          ]}
        >
          {draft.delivery.receiptUri ? (
            <Image
              source={{ uri: draft.delivery.receiptUri }}
              style={styles.receiptPreview}
              contentFit="cover"
            />
          ) : (
            <>
              <Ionicons
                name="cloud-upload-outline"
                size={28}
                color={palette.accent}
              />
              <Text style={{ color: palette.textSecondary }}>
                Tap to upload screenshot
              </Text>
            </>
          )}
        </Pressable>

        <View>
          <FieldLabel>Courier</FieldLabel>
          <TextInput
            value={draft.delivery.courier}
            onChangeText={(value) => updateDeliveryField('courier', value)}
            placeholder="GrabExpress"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>

        <View>
          <FieldLabel>Tracking / booking no.</FieldLabel>
          <TextInput
            value={draft.delivery.trackingNo}
            onChangeText={(value) => updateDeliveryField('trackingNo', value)}
            placeholder="GE-4839201"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>
      </SectionCard>

      <InfoBanner
        tone="warn"
        text="Pay the courier fee directly to the rider. Service starts after the artisan confirms item receipt."
      />

      <PrimaryButton
        label="Submit Delivery Proof"
        icon="checkmark"
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  uploadBox: {
    minHeight: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  receiptPreview: { width: '100%', height: 140 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
});
