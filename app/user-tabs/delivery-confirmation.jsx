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
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function DeliveryConfirmationScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const {
    requests,
    draft,
    updateDeliveryField,
    updateRequestStage,
    setSelectedOrder,
    loadingRequests,
  } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) ||
    (order ? requests.find((item) => String(item.order).includes(order)) : null) ||
    requests[0];

  const firestoreProof = request?.delivery?.proofUri || request?.delivery?.receiptUri || null;
  const firestoreLink = request?.delivery?.sharedLink || '';

  const [proofUri, setProofUri] = useState(() => firestoreProof || draft.delivery.proofUri || null);
  const [sharedLink, setSharedLink] = useState(() => firestoreLink || draft.delivery.sharedLink || '');
  const [submitting, setSubmitting] = useState(false);

  // Synchronize when request.delivery updates from Firestore or resubmission
  useEffect(() => {
    if (firestoreProof) {
      setProofUri(firestoreProof);
    }
    if (firestoreLink) {
      setSharedLink(firestoreLink);
    }
  }, [firestoreProof, firestoreLink]);

  const canSubmit = Boolean(proofUri) && Boolean(sharedLink.trim());

  const pickProof = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      const newUri = result.assets[0].uri;
      setProofUri(newUri);
      updateDeliveryField('proofUri', newUri);
      updateDeliveryField('receiptUri', newUri);
    }
  };

  const handleLinkChange = (value) => {
    setSharedLink(value);
    updateDeliveryField('sharedLink', value);
  };

  const handleSubmit = async () => {
    if (!request?.order || !canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const finalProof = proofUri;
      const finalLink = sharedLink.trim();

      await updateRequestStage(request.order, {
        stage: 'awaiting_delivery',
        badge: 'Item sent',
        badgeVariant: 'blue',
        detail: 'Proof submitted · Waiting for workshop confirmation',
        progress: 0.55,
        delivery: {
          ...(request.delivery || {}),
          proofUri: finalProof,
          receiptUri: finalProof,
          sharedLink: finalLink,
          updatedAt: new Date().toISOString(),
        },
        adminDeliveryNote: null,
        deliveryRejectedAt: null,
      });

      updateDeliveryField('proofUri', finalProof);
      updateDeliveryField('receiptUri', finalProof);
      updateDeliveryField('sharedLink', finalLink);
      setSelectedOrder(request.order);

      Alert.alert(
        'Delivery Form Sent',
        'Your delivery proof picture and shared link have been submitted to the workshop.',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/user-tabs/user-dashboard'),
          },
        ],
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit delivery form.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) {
    return (
      <KeyboardAwareScreen
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}
      >
        <Text style={{ color: palette.textSecondary }}>Loading delivery details...</Text>
        <PrimaryButton
          label="Return to Dashboard"
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/user-tabs/user-dashboard')}
        />
      </KeyboardAwareScreen>
    );
  }

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Delivery Confirmation"
        subtitle="Upload the proof picture and the shared link of the item."
        onBack={() => router.replace('/user-tabs/user-dashboard')}
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
          Contact: {request?.artisan?.name || 'Artisan'} ·{' '}
          {request?.artisan?.contact || ''}
        </Text>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Proof picture
        </Text>
        <Pressable
          onPress={pickProof}
          style={[
            styles.uploadBox,
            {
              backgroundColor: palette.softCard,
              borderColor: palette.textSecondary + '35',
            },
          ]}
        >
          {proofUri ? (
            <Image
              source={{ uri: proofUri }}
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
                Tap to upload proof picture
              </Text>
            </>
          )}
        </Pressable>

        <View>
          <FieldLabel>Shared link of the item</FieldLabel>
          <TextInput
            value={sharedLink}
            onChangeText={handleLinkChange}
            placeholder="https://example.com"
            placeholderTextColor={palette.textSecondary}
            autoCapitalize="none"
            keyboardType="url"
            autoCorrect={false}
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>
      </SectionCard>

      {proofUri ? (
        <InfoBanner
          tone="mint"
          text="Delivery proof has been uploaded. Waiting for the workshop admin to confirm receipt."
        />
      ) : (
        <InfoBanner
          tone="warn"
          text="Service starts after the artisan confirms item receipt using the proof picture and shared link."
        />
      )}

      <PrimaryButton
        label={
          submitting
            ? 'Sending…'
            : firestoreProof
              ? 'Update Delivery Proof'
              : 'Submit Delivery Proof'
        }
        icon="checkmark"
        disabled={!canSubmit || submitting}
        onPress={handleSubmit}
      />

      <PrimaryButton
        label="Return to Dashboard"
        variant="secondary"
        onPress={() => router.replace('/user-tabs/user-dashboard')}
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
