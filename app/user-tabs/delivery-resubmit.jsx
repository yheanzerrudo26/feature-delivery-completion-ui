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
import { useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function DeliveryResubmitScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const {
    requests,
    updateDeliveryField,
    updateRequestStage,
    setSelectedOrder,
    loadingRequests,
  } = useUserRequest();

  const request =
    requests.find((item) => item.order === order) ||
    (order
      ? requests.find((item) => String(item.order).includes(order))
      : null) ||
    requests.find((item) => item.stage === 'delivery_resubmit') ||
    requests[0];

  const adminNote =
    request?.adminDeliveryNote ||
    'Item was not received. Please resubmit your proof.';

  const [proofUri, setProofUri] = useState(null);
  const [sharedLink, setSharedLink] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = Boolean(proofUri) && Boolean(sharedLink.trim());

  const pickProof = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets?.[0]) {
      setProofUri(result.assets[0].uri);
    }
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
        detail: 'Updated proof submitted · Waiting for workshop confirmation',
        progress: 0.55,
        delivery: {
          ...(request.delivery || {}),
          proofUri: finalProof,
          receiptUri: finalProof,
          sharedLink: finalLink,
          resubmitComment: comment.trim(),
          resubmittedAt: new Date().toISOString(),
        },
        // Clear the admin rejection fields
        adminDeliveryNote: null,
        deliveryRejectedAt: null,
      });

      updateDeliveryField('proofUri', finalProof);
      updateDeliveryField('receiptUri', finalProof);
      updateDeliveryField('sharedLink', finalLink);
      setSelectedOrder(request.order);

      Alert.alert(
        'Proof Resubmitted',
        'Your updated delivery proof picture and shared link have been sent to the workshop.',
        [
          {
            text: 'Return to Dashboard',
            onPress: () => router.replace('/user-tabs/user-dashboard'),
          },
        ],
      );
    } catch (err) {
      console.error('Failed to resubmit:', err);
      Alert.alert('Error', err.message || 'Failed to resubmit proof.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!request) {
    return (
      <KeyboardAwareScreen
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', flex: 1 },
        ]}
      >
        <Text style={{ color: palette.textSecondary }}>
          Loading request...
        </Text>
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
      bottomPadding={180}
    >
      <RequestScreenHeader
        title="Resubmit Delivery Proof"
        subtitle="Your previous proof was not confirmed. Please send a new picture and item link."
        onBack={() => router.replace('/user-tabs/user-dashboard')}
      />

      {/* ── Admin rejection notice ── */}
      <View
        style={[styles.rejectionCard, { backgroundColor: '#FDECEC', borderColor: '#F5C6C6' }]}
      >
        <View style={styles.rejectionRow}>
          <Ionicons name="alert-circle" size={20} color="#B42318" />
          <Text style={styles.rejectionTitle}>Item not received</Text>
        </View>
        <Text style={styles.rejectionNote}>{adminNote}</Text>
      </View>

      <InfoBanner
        tone="warn"
        text="Please upload a clear proof picture of the item and paste the shared link. You may add a comment to explain."
      />

      {/* ── Proof picture ── */}
      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          New proof picture
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
              style={styles.previewImage}
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

        {/* ── Shared link ── */}
        <View>
          <FieldLabel>Shared link of the item</FieldLabel>
          <TextInput
            value={sharedLink}
            onChangeText={setSharedLink}
            placeholder="https://example.com"
            placeholderTextColor={palette.textSecondary}
            autoCapitalize="none"
            keyboardType="url"
            autoCorrect={false}
            style={[
              styles.input,
              {
                backgroundColor: palette.softCard,
                color: palette.textPrimary,
              },
            ]}
          />
        </View>

        {/* ── Optional comment ── */}
        <View>
          <FieldLabel>Comment to the admin (optional)</FieldLabel>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="e.g. Item was delivered to a different address…"
            placeholderTextColor={palette.textSecondary}
            multiline
            numberOfLines={3}
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: palette.softCard,
                color: palette.textPrimary,
              },
            ]}
          />
        </View>
      </SectionCard>

      <PrimaryButton
        label={submitting ? 'Submitting…' : 'Resubmit Delivery Proof'}
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

  rejectionCard: {
    borderRadius: 14,
    padding: 14,
    gap: 6,
    borderWidth: 1,
  },
  rejectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rejectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B42318',
  },
  rejectionNote: {
    fontSize: 13,
    color: '#7B1A12',
    lineHeight: 18,
  },

  uploadBox: {
    minHeight: 160,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  previewImage: { width: '100%', height: 160 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

