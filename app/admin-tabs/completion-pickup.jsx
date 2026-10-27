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
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const TIME_OPTIONS = [
  '10:00 AM – 12:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

export default function CompletionPickupScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, updateRequest, setSelectedId } = useAdminRequest();

  const request =
    requests.find((item) => item.id === id) ||
    requests.find(
      (item) =>
        item.stage === 'in_progress' ||
        item.stage === 'ready_for_pickup' ||
        item.stage === 'awaiting_pickup_response' ||
        item.stage === 'reschedule_needed',
    ) ||
    requests[0];

  const [selectedDate, setSelectedDate] = useState(() =>
    parseDisplayDate(request?.pickup?.date, new Date(Date.now() + 86400000 * 2)),
  );
  const [date, setDate] = useState(
    () =>
      request?.pickup?.date ||
      formatDisplayDate(new Date(Date.now() + 86400000 * 2)),
  );
  const [window, setWindow] = useState(
    request?.pickup?.window || TIME_OPTIONS[1],
  );
  const [alternate, setAlternate] = useState(request?.pickup?.alternate || '');
  const [report, setReport] = useState(
    request?.completion?.report ||
      'Restoration complete. Stitch integrity checked. Finish cured and sealed.',
  );
  const [videoUri, setVideoUri] = useState(
    request?.completion?.videoUri || null,
  );
  const [videoName, setVideoName] = useState(
    request?.completion?.videoName ||
      (request?.id
        ? `completion-${request.id.replace('#', '')}.mp4`
        : 'restoration-evidence.mp4'),
  );

  const parseScore = (raw) => {
    if (typeof raw === 'number' && raw >= 1 && raw <= 5) return raw;
    if (typeof raw === 'string') {
      const match = raw.match(/([1-5])/);
      if (match) return parseInt(match[1], 10);
    }
    return 5;
  };

  const [conditionScore, setConditionScore] = useState(() =>
    parseScore(request?.completion?.conditionScore),
  );
  const [materials, setMaterials] = useState(
    request?.completion?.materials || 'Thread, conditioner, edge dye',
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setAlternate(`${formatDisplayDate(nextDay)} · ${TIME_OPTIONS[0]}`);
  }, [selectedDate]);

  // Once user accepts the date, automatically navigate to deliver item back to client
  useEffect(() => {
    if (
      request?.pickup?.clientResponse === 'yes' ||
      request?.stage === 'return_delivery'
    ) {
      router.replace({
        pathname: '/admin-tabs/admin-return-delivery',
        params: { id: request.id },
      });
    }
  }, [request?.stage, request?.pickup?.clientResponse, request?.id]);

  if (!request) {
    return (
      <KeyboardAwareScreen
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[
          styles.container,
          { justifyContent: 'center', alignItems: 'center', flex: 1 },
        ]}
      >
        <Text style={{ color: palette.textSecondary }}>Loading request...</Text>
        <PrimaryButton
          label="Return to Forms"
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/admin-tabs/admin-forms')}
        />
      </KeyboardAwareScreen>
    );
  }

  // ── Flow State Conditions ──
  const clientRequestedReschedule =
    request.stage === 'reschedule_needed' ||
    request.pickup?.clientResponse === 'no';

  // Waiting state: Schedule was sent, waiting for client response (and client hasn't requested reschedule)
  const isWaitingForClient =
    (request.stage === 'ready_for_pickup' ||
      request.stage === 'awaiting_pickup_response') &&
    !request.pickup?.clientResponse &&
    !clientRequestedReschedule;

  const pickVideo = async () => {
    if (isWaitingForClient) return;
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setVideoUri(result.assets[0].uri);
        setVideoName(
          result.assets[0].fileName ||
            `completion-${request.id.replace('#', '')}.mp4`,
        );
      }
    } catch (err) {
      console.error('Failed to pick video:', err);
    }
  };

  // Admin submits pickup schedule -> puts screen in waiting state
  const handleSend = async () => {
    if (!request?.id || submitting || isWaitingForClient) return;
    setSubmitting(true);
    try {
      await updateRequest(request.id, {
        stage: 'ready_for_pickup',
        badge: 'Ready for pickup',
        badgeVariant: 'mint',
        detail: `Restoration completed. Proposed pickup: ${date} (${window})`,
        completion: {
          ...request.completion,
          videoUploaded: true,
          videoUri: videoUri || request.completion?.videoUri || null,
          videoName,
          report,
          conditionScore: `${conditionScore} / 5`,
          materials: materials.trim(),
          careAdvice:
            request.completion?.careAdvice ||
            'Condition every 3–4 months. Avoid prolonged sun.',
        },
        pickup: {
          date,
          window,
          alternate,
          clientResponse: null,
          preferredDate: null,
          preferredWindow: null,
        },
        clientNotification: `Restoration complete for ${request.item}. Proposed pickup: ${date} (${window}). Please review the video proof and confirm your schedule.`,
      });
      setSelectedId(request.id);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send schedule notice.');
    } finally {
      setSubmitting(false);
    }
  };

  // Client sent alternative date/time -> Admin accepts client's requested date
  const handleAcceptClientSchedule = async () => {
    if (!request?.id || submitting) return;
    setSubmitting(true);
    try {
      const approvedDate = request.pickup?.preferredDate || date;
      const approvedWindow = request.pickup?.preferredWindow || window;
      await updateRequest(request.id, {
        stage: 'ready_for_pickup',
        badge: 'Ready for pickup',
        badgeVariant: 'mint',
        detail: `Pickup schedule agreed for ${approvedDate} (${approvedWindow}) · Waiting for client confirmation`,
        pickup: {
          ...request.pickup,
          date: approvedDate,
          window: approvedWindow,
          clientResponse: null, // resets to waiting for user confirmation
          preferredDate: null,
          preferredWindow: null,
          clientAvailability: '',
        },
        clientNotification: `Workshop approved your proposed schedule (${approvedDate} · ${approvedWindow}). Please confirm to proceed with return delivery.`,
      });
      setSelectedId(request.id);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to accept client schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Completion & Return Pickup"
        subtitle="Attach proof of service video, finalize comments, and set the return pickup schedule."
        rightLabel={request.id}
        onBack={() => router.replace('/admin-tabs/admin-forms')}
      />

      {/* ── STATE 1: Waiting for client confirmation banner (Greyed Out state) ── */}
      {isWaitingForClient && (
        <View style={styles.waitingBanner}>
          <View style={styles.waitingHeader}>
            <Ionicons name="time" size={24} color="#B54708" />
            <Text style={styles.waitingTitle}>Waiting for client confirmation</Text>
          </View>
          <Text style={styles.waitingText}>
            Proposed pickup schedule ({request.pickup?.date || date} · {request.pickup?.window || window}) has been sent to the client. The form below is locked while waiting for the client's answer.
          </Text>
        </View>
      )}

      {/* ── STATE 2: Client requested reschedule banner (Open for Accept) ── */}
      {clientRequestedReschedule && (
        <View style={styles.rescheduleBanner}>
          <View style={styles.rescheduleHeader}>
            <Ionicons name="calendar" size={24} color="#157651" />
            <Text style={styles.rescheduleTitle}>
              Client requested alternative schedule
            </Text>
          </View>
          <Text style={styles.rescheduleText}>
            The client cannot make the previous date. They requested:{'\n'}
            <Text style={{ fontWeight: '700' }}>
              📅 {request.pickup?.preferredDate || 'New date'} · {request.pickup?.preferredWindow || 'New window'}
            </Text>
            {request.pickup?.clientAvailability
              ? `\nNote: “${request.pickup.clientAvailability}”`
              : ''}
          </Text>

          <TouchableOpacity
            style={styles.acceptScheduleBtn}
            onPress={handleAcceptClientSchedule}
            disabled={submitting}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
            <Text style={styles.acceptScheduleBtnText}>
              {submitting ? 'Accepting…' : `Accept Client's Schedule (${request.pickup?.preferredDate || 'New Date'})`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Form container: Greyed out when waiting for client ── */}
      <View
        style={[
          styles.formWrapper,
          isWaitingForClient && styles.greyedOutForm,
        ]}
        pointerEvents={isWaitingForClient ? 'none' : 'auto'}
      >
        <SectionCard style={styles.successCard}>
          <Ionicons name="checkmark-circle" size={28} color="#157651" />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#157651', fontWeight: '700', fontSize: 16 }}>
              Restoration completed
            </Text>
            <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
              Send proof of service and return pickup schedule to the client.
            </Text>
          </View>
        </SectionCard>

        {/* ── Completion video ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Completion video (Proof of Service)
          </Text>
          <TouchableOpacity
            style={[styles.videoRow, { backgroundColor: palette.softCard }]}
            onPress={pickVideo}
            activeOpacity={0.8}
            disabled={isWaitingForClient}
          >
            <Ionicons name="videocam" size={28} color={palette.accent} />
            <View style={{ flex: 1 }}>
              <Text
                style={{ color: palette.textPrimary, fontWeight: '700' }}
                numberOfLines={1}
              >
                {videoName}
              </Text>
              <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                {videoUri
                  ? 'Custom video selected · Tap to change'
                  : 'Tap to select completion video proof from library'}
              </Text>
            </View>
            <Text style={styles.uploaded}>
              {videoUri ? 'Selected' : 'Choose'}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Final report / comments ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Artisan comments & final report
          </Text>
          <FieldLabel>Completion notes</FieldLabel>
          <TextInput
            multiline
            value={report}
            onChangeText={setReport}
            editable={!isWaitingForClient}
            placeholder="Enter completion notes and comments for the client…"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.textArea,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />

          <FieldLabel>Final condition ({conditionScore} / 5)</FieldLabel>
          <View style={styles.scoreRow}>
            {[1, 2, 3, 4, 5].map((num) => (
              <Pressable
                key={num}
                disabled={isWaitingForClient}
                onPress={() => setConditionScore(num)}
                style={[
                  styles.scoreChip,
                  conditionScore === num
                    ? { backgroundColor: palette.accent, borderColor: palette.accent }
                    : {
                        backgroundColor: palette.softCard,
                        borderColor: palette.textSecondary + '30',
                      },
                ]}
              >
                <Ionicons
                  name={conditionScore >= num ? 'star' : 'star-outline'}
                  size={15}
                  color={conditionScore === num ? '#fff' : '#F7B541'}
                />
                <Text
                  style={{
                    color: conditionScore === num ? '#fff' : palette.textPrimary,
                    fontWeight: '700',
                    fontSize: 13,
                  }}
                >
                  {num} / 5
                </Text>
              </Pressable>
            ))}
          </View>

          <FieldLabel>Materials used</FieldLabel>
          <TextInput
            value={materials}
            onChangeText={setMaterials}
            editable={!isWaitingForClient}
            placeholder="e.g. Thread, conditioner, edge dye, balm"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              {
                backgroundColor: palette.softCard,
                color: palette.textPrimary,
                marginTop: 4,
              },
            ]}
          />
        </SectionCard>

        {/* ── Pickup date and time ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Proposed return pickup date & time
          </Text>

          <CalendarDatePicker
            label="Pickup Date"
            value={selectedDate}
            onChange={(nextDate, label) => {
              setSelectedDate(nextDate);
              setDate(label);
            }}
          />

          <FieldLabel>Pickup Time Window</FieldLabel>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((option) => (
              <Pressable
                key={option}
                onPress={() => setWindow(option)}
                disabled={isWaitingForClient}
                style={[
                  styles.chip,
                  window === option
                    ? { backgroundColor: '#DCEBFB', borderColor: '#95BEF0' }
                    : {
                        backgroundColor: palette.softCard,
                        borderColor: palette.textSecondary + '30',
                      },
                ]}
              >
                <Text
                  style={{
                    color: window === option ? '#143D76' : palette.textPrimary,
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>

          <FieldLabel>Alternate option</FieldLabel>
          <TextInput
            value={alternate}
            onChangeText={setAlternate}
            editable={!isWaitingForClient}
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </SectionCard>
      </View>

      {/* ── Action Button ── */}
      {isWaitingForClient ? (
        <View style={styles.waitingBtnContainer}>
          <Ionicons name="hourglass-outline" size={20} color="#7A4D05" />
          <Text style={styles.waitingBtnText}>
            Waiting for Client Confirmation…
          </Text>
        </View>
      ) : (
        <PrimaryButton
          label={
            submitting
              ? 'Sending Schedule…'
              : clientRequestedReschedule
                ? 'Send Counter-Schedule'
                : 'Send Ready-for-Pickup Notice'
          }
          icon="rocket-outline"
          disabled={submitting}
          onPress={handleSend}
        />
      )}

      <PrimaryButton
        label="Return to Forms"
        variant="secondary"
        onPress={() => router.replace('/admin-tabs/admin-forms')}
      />
    </KeyboardAwareScreen>
  );
}

function Row({ label, value, palette }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.textSecondary, width: 120 }}>{label}</Text>
      <Text style={{ color: palette.textPrimary, fontWeight: '600', flex: 1 }}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  formWrapper: { gap: 14 },
  greyedOutForm: {
    opacity: 0.5,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E8F8EF',
    borderColor: '#A8DFC0',
  },
  videoRow: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 6,
  },
  uploaded: {
    backgroundColor: '#DDF9EC',
    color: '#157651',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 90,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    marginVertical: 4,
  },
  row: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  scoreRow: { flexDirection: 'row', gap: 6, marginVertical: 6 },
  scoreChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
  },
  waitingBanner: {
    backgroundColor: '#FEF0C7',
    borderColor: '#FDB022',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  waitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  waitingTitle: {
    color: '#B54708',
    fontWeight: '700',
    fontSize: 15,
  },
  waitingText: {
    color: '#7A2E0E',
    fontSize: 13,
    lineHeight: 18,
  },
  rescheduleBanner: {
    backgroundColor: '#E8F8EF',
    borderColor: '#A8DFC0',
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  rescheduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rescheduleTitle: {
    color: '#157651',
    fontWeight: '700',
    fontSize: 15,
  },
  rescheduleText: {
    color: '#0D472B',
    fontSize: 13,
    lineHeight: 18,
  },
  acceptScheduleBtn: {
    backgroundColor: '#157651',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 6,
  },
  acceptScheduleBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  waitingBtnContainer: {
    backgroundColor: '#FEF0C7',
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#FDB022',
  },
  waitingBtnText: {
    color: '#7A4D05',
    fontWeight: '700',
    fontSize: 15,
  },
});
