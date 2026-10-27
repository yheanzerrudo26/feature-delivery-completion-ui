import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import CalendarDatePicker, {
  formatDisplayDate,
  parseDisplayDate,
} from '@/components/CalendarDatePicker';
import {
  FieldLabel,
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useAdminRequest } from '@/context/admin-request-context';
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

const TIME_OPTIONS = [
  '10:00 AM – 12:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

export default function AdminReturnDeliveryScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, updateRequest, setSelectedId } = useAdminRequest();

  const request =
    requests.find((item) => item.id === id) ||
    requests.find((item) => item.stage === 'return_delivery') ||
    requests[0];

  const existingProof =
    request?.returnDelivery?.proofUri || request?.returnDelivery?.receiptUri;
  const existingLink = request?.returnDelivery?.sharedLink || '';

  const [proofUri, setProofUri] = useState(existingProof || null);
  const [sharedLink, setSharedLink] = useState(existingLink || '');
  const [submitting, setSubmitting] = useState(false);

  // Redelivery date/time state (used when client reported Item Not Received)
  const isRedelivery =
    Boolean(request?.itemNotReceivedReportedAt) &&
    !request?.itemNotReceivedResolved;

  const [redeliverySelectedDate, setRedeliverySelectedDate] = useState(() =>
    parseDisplayDate(
      request?.returnRescheduleDate || request?.pickup?.date,
      new Date(Date.now() + 86400000 * 2),
    ),
  );
  const [redeliveryDate, setRedeliveryDate] = useState(
    () =>
      request?.returnRescheduleDate ||
      request?.pickup?.date ||
      formatDisplayDate(new Date(Date.now() + 86400000 * 2)),
  );
  const [redeliveryWindow, setRedeliveryWindow] = useState(
    () =>
      request?.returnRescheduleWindow ||
      request?.pickup?.window ||
      TIME_OPTIONS[1],
  );

  const canSubmit = Boolean(proofUri) && Boolean(sharedLink.trim());

  const pickProof = async () => {
    try {
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
    } catch (err) {
      console.error('Failed to pick proof:', err);
    }
  };

  const handleSubmit = async () => {
    if (!request?.id || !canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const finalDate = isRedelivery ? redeliveryDate : (request.pickup?.date || 'October 16, 2026');
      const finalWindow = isRedelivery ? redeliveryWindow : (request.pickup?.window || '2:00 PM – 4:00 PM');

      await updateRequest(request.id, {
        stage: 'return_delivery',
        badge: 'Return delivery',
        badgeVariant: 'blue',
        detail: `Item dispatched for ${finalDate} (${finalWindow})`,
        returnDelivery: {
          proofUri,
          receiptUri: proofUri,
          sharedLink: sharedLink.trim(),
          dispatchedAt: new Date().toISOString(),
        },
        pickup: {
          ...request.pickup,
          date: finalDate,
          window: finalWindow,
          clientResponse: 'yes',
        },
        // Clear unreceived state when admin confirms updated delivery
        itemNotReceivedReportedAt: null,
        itemNotReceivedResolved: true,
        clientNotification: `Your restored item (${request.item}) has been confirmed for return delivery on ${finalDate} (${finalWindow}). Delivery proof has been attached.`,
      });
      setSelectedId(request.id);
      Alert.alert(
        'Return Dispatched',
        'Delivery proof picture and shared link sent. The client can now track and confirm receipt.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/admin-tabs/admin-forms'),
          },
        ],
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to dispatch return delivery.');
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
          Loading delivery details...
        </Text>
        <PrimaryButton
          label="Return to Forms"
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/admin-tabs/admin-forms')}
        />
      </KeyboardAwareScreen>
    );
  }

  const clientAddress =
    request.address ||
    request.personal?.address ||
    '214 Leather Lane, Makati City';
  const agreedSchedule = `${request.pickup?.date || 'October 16, 2026'} · ${
    request.pickup?.window || '2:00 PM – 4:00 PM'
  }`;

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Deliver Item to Client"
        subtitle="Upload the proof picture and shared link to dispatch item back to the client."
        rightLabel={request.id}
        onBack={() => router.replace('/admin-tabs/admin-forms')}
      />

      {/* ── Client reported item not received alert banner ── */}
      {isRedelivery && (
        <View style={styles.redeliveryBanner}>
          <View style={styles.bannerHeader}>
            <Ionicons name="alert-circle" size={24} color="#B42318" />
            <Text style={styles.bannerTitle}>Client Reported Item Not Received</Text>
          </View>
          <Text style={styles.bannerText}>
            The client reported their item has not arrived and requested a new delivery date:{'\n'}
            <Text style={{ fontWeight: '700' }}>
              📅 {request.returnRescheduleDate || 'New date'} · {request.returnRescheduleWindow || 'New window'}
            </Text>
            {request.itemNotReceivedNote ? `\nClient note: “${request.itemNotReceivedNote}”` : ''}
          </Text>
          <Text style={{ color: '#7A1C16', fontSize: 12, marginTop: 4 }}>
            Confirm or update the delivery schedule below, attach the new proof picture and shared link, then submit.
          </Text>
        </View>
      )}

      {/* ── Client destination details ── */}
      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Client delivery destination
        </Text>
        <Text style={{ color: palette.textPrimary, fontWeight: '700', fontSize: 16 }}>
          {request?.clientName || 'Client'}
        </Text>
        <Text style={{ color: palette.textSecondary, lineHeight: 20, marginTop: 4 }}>
          {clientAddress}
          {request?.mobile ? `\nContact: ${request.mobile}` : ''}
        </Text>
        <View style={styles.scheduleBadge}>
          <Ionicons name="calendar-outline" size={16} color={palette.accent} />
          <Text style={{ color: palette.textPrimary, fontSize: 13, fontWeight: '600' }}>
            Current Schedule: {agreedSchedule}
          </Text>
        </View>
      </SectionCard>

      {/* ── If Redelivery: Confirm updated date & time ── */}
      {isRedelivery && (
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Confirm Redelivery Date & Time
          </Text>

          <CalendarDatePicker
            label="Redelivery Date"
            value={redeliverySelectedDate}
            onChange={(nextDate, label) => {
              setRedeliverySelectedDate(nextDate);
              setRedeliveryDate(label);
            }}
          />

          <FieldLabel>Redelivery Time Window</FieldLabel>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => setRedeliveryWindow(option)}
                style={[
                  styles.chip,
                  redeliveryWindow === option
                    ? { backgroundColor: '#DCEBFB', borderColor: '#95BEF0' }
                    : {
                        backgroundColor: palette.softCard,
                        borderColor: palette.textSecondary + '30',
                      },
                ]}
              >
                <Text
                  style={{
                    color:
                      redeliveryWindow === option
                        ? '#143D76'
                        : palette.textPrimary,
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </SectionCard>
      )}

      {/* ── Proof picture ── */}
      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Return proof picture
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
                size={32}
                color={palette.accent}
              />
              <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
                Tap to upload package proof picture
              </Text>
              <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                Photo of wrapped item / return delivery package
              </Text>
            </>
          )}
        </Pressable>
      </SectionCard>

      {/* ── Shared link ── */}
      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Item shared link
        </Text>
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
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
        />
      </SectionCard>

      {existingProof && (
        <InfoBanner
          tone="mint"
          text="Return delivery proof has already been uploaded. You can update details above and re-submit if needed."
        />
      )}

      <InfoBanner
        tone="warn"
        text="Once submitted, the client will see the proof picture and shared link, and will be prompted to confirm receipt."
      />

      <PrimaryButton
        label={
          isRedelivery
            ? 'Confirm Redelivery Schedule & Send Item'
            : existingProof
              ? 'Update Return Delivery'
              : 'Submit Return Delivery'
        }
        icon="checkmark"
        disabled={!canSubmit || submitting}
        onPress={handleSubmit}
      />

      <PrimaryButton
        label="Return to Forms"
        variant="secondary"
        onPress={() => router.replace('/admin-tabs/admin-forms')}
      />
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  uploadBox: {
    minHeight: 140,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    marginTop: 6,
  },
  receiptPreview: { width: '100%', height: 160 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  scheduleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#00000008',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  redeliveryBanner: {
    backgroundColor: '#FDECEC',
    borderColor: '#F5C6C6',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    color: '#B42318',
    fontWeight: '700',
    fontSize: 15,
  },
  bannerText: {
    color: '#7A1C16',
    fontSize: 13,
    lineHeight: 18,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
