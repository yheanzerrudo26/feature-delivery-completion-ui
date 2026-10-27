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
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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

export default function ReadyForPickupScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, updateRequestStage, setSelectedOrder } = useUserRequest();

  const request =
    requests.find((item) => item.order === order) ||
    (order
      ? requests.find((item) => String(item.order).includes(order))
      : null) ||
    requests[0];

  const proposedDate = request?.pickup?.date || 'October 16, 2026';
  const proposedWindow = request?.pickup?.window || '2:00 PM – 4:00 PM';
  const reportText =
    request?.completion?.report ||
    'Seam reinforced and restitched. Panels deep-conditioned. Contact edges color-blended and sealed.';
  const videoName =
    request?.completion?.videoName ||
    `completion-${(request?.order || '').replace('#', '')}.mp4`;

  const [scheduleWorks, setScheduleWorks] = useState(true);
  const [preferredSelectedDate, setPreferredSelectedDate] = useState(
    () => new Date(Date.now() + 86400000 * 2),
  );
  const [preferredDate, setPreferredDate] = useState(() =>
    formatDisplayDate(new Date(Date.now() + 86400000 * 2)),
  );
  const [preferredWindow, setPreferredWindow] = useState(TIME_OPTIONS[1]);
  const [availabilityNotes, setAvailabilityNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already confirmed or return delivery is ready, auto-navigate to return-delivery
  useEffect(() => {
    if (
      request?.stage === 'return_delivery' ||
      request?.pickup?.clientResponse === 'yes'
    ) {
      router.replace({
        pathname: '/user-tabs/return-delivery',
        params: { order: request.order },
      });
    }
  }, [request?.stage, request?.pickup?.clientResponse, request?.order]);

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
          Loading request details...
        </Text>
        <PrimaryButton
          label="Return to Dashboard"
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/user-tabs/user-dashboard')}
        />
      </KeyboardAwareScreen>
    );
  }

  // Waiting state for user: client requested reschedule, waiting for admin approval
  const isWaitingForAdmin =
    request.stage === 'reschedule_needed' ||
    request.pickup?.clientResponse === 'no';

  const handleConfirmSchedule = async () => {
    if (!request?.order || submitting || isWaitingForAdmin) return;
    setSubmitting(true);
    try {
      await updateRequestStage(request.order, {
        stage: 'return_delivery',
        badge: 'Return delivery',
        badgeVariant: 'blue',
        detail: 'Agreed pickup confirmed · Return delivery in progress',
        progress: 0.85,
        pickup: {
          ...request.pickup,
          date: proposedDate,
          window: proposedWindow,
          clientResponse: 'yes',
        },
      });
      setSelectedOrder(request.order);
      router.replace({
        pathname: '/user-tabs/return-delivery',
        params: { order: request.order },
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to confirm schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendNewSchedule = async () => {
    if (!request?.order || submitting || isWaitingForAdmin) return;
    setSubmitting(true);
    try {
      await updateRequestStage(request.order, {
        stage: 'reschedule_needed',
        badge: 'Reschedule requested',
        badgeVariant: 'amber',
        detail: `You requested a new pickup schedule (${preferredDate}) · Awaiting artisan approval`,
        progress: 0.8,
        pickup: {
          ...request.pickup,
          clientResponse: 'no',
          preferredDate,
          preferredWindow,
          clientAvailability: availabilityNotes.trim(),
        },
      });
      setSelectedOrder(request.order);
      // Stay on page and grey out!
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to submit reschedule request.');
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
        title="Ready for Pickup"
        subtitle="Review the restored item evidence and confirm the return pickup schedule."
        rightLabel={request.order}
        onBack={() => router.replace('/user-tabs/user-dashboard')}
      />

      {/* ── Waiting for admin approval banner (Greyed Out state) ── */}
      {isWaitingForAdmin ? (
        <View style={styles.waitingBanner}>
          <View style={styles.waitingHeader}>
            <Ionicons name="time" size={24} color="#B54708" />
            <Text style={styles.waitingTitle}>Waiting for workshop confirmation</Text>
          </View>
          <Text style={styles.waitingText}>
            You requested a new schedule:{'\n'}
            <Text style={{ fontWeight: '700' }}>
              📅 {request.pickup?.preferredDate || preferredDate} · {request.pickup?.preferredWindow || preferredWindow}
            </Text>
            {'\n'}The form is locked while waiting for the workshop admin to review and accept your proposed time.
          </Text>
        </View>
      ) : (
        <InfoBanner
          tone="warn"
          text={`Restoration complete for Request ${request.order}. Review the artisan's proof video and comments, then confirm the pickup schedule.`}
        />
      )}

      {/* ── Form wrapper: Greyed out when waiting for admin ── */}
      <View
        style={[
          styles.formWrapper,
          isWaitingForAdmin && styles.greyedOutForm,
        ]}
        pointerEvents={isWaitingForAdmin ? 'none' : 'auto'}
      >
        {/* ── Completion video ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Artisan video evidence (Proof of Service)
          </Text>
          <View style={[styles.videoBox, { backgroundColor: palette.softCard }]}>
            <Ionicons name="play-circle" size={52} color={palette.accent} />
            <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
              {videoName}
            </Text>
            <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
              Tap to view restoration inspection video
            </Text>
          </View>
        </SectionCard>

        {/* ── Final report / comments ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Artisan final comments & report
          </Text>
          <Text style={[styles.body, { color: palette.textSecondary }]}>
            {reportText}
          </Text>
          <View style={styles.checkList}>
            <Text style={styles.passLine}>✓ Stitch integrity verified</Text>
            <Text style={styles.passLine}>✓ Leather finish cured and sealed</Text>
          </View>
          {request.completion?.conditionScore || request.completion?.materials ? (
            <View
              style={{
                marginTop: 10,
                gap: 6,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: palette.softCard,
              }}
            >
              {request.completion?.conditionScore ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
                    Final condition:
                  </Text>
                  <Text
                    style={{
                      color: palette.textPrimary,
                      fontWeight: '700',
                      fontSize: 13,
                    }}
                  >
                    {request.completion.conditionScore}
                  </Text>
                </View>
              ) : null}
              {request.completion?.materials ? (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
                    Materials used:
                  </Text>
                  <Text
                    style={{
                      color: palette.textPrimary,
                      fontWeight: '600',
                      fontSize: 13,
                    }}
                  >
                    {request.completion.materials}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}
        </SectionCard>

        {/* ── Proposed pickup schedule ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Proposed pickup schedule
          </Text>
          <View style={styles.scheduleRow}>
            <Ionicons name="calendar-outline" size={24} color={palette.accent} />
            <View>
              <Text
                style={{
                  color: palette.textPrimary,
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {proposedDate}
              </Text>
              <Text style={{ color: palette.textSecondary }}>
                {proposedWindow}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Schedule selection ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Does this schedule work for you?
          </Text>
          <View style={styles.yesNoRow}>
            <Pressable
              onPress={() => setScheduleWorks(true)}
              disabled={isWaitingForAdmin}
              style={[
                styles.choiceBtn,
                scheduleWorks
                  ? { backgroundColor: palette.accent }
                  : {
                      backgroundColor: palette.card,
                      borderWidth: 1,
                      borderColor: palette.accent,
                    },
              ]}
            >
              <Text
                style={{
                  color: scheduleWorks ? '#fff' : palette.accent,
                  fontWeight: '700',
                }}
              >
                Yes, schedule works
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setScheduleWorks(false)}
              disabled={isWaitingForAdmin}
              style={[
                styles.choiceBtn,
                !scheduleWorks
                  ? { backgroundColor: palette.accent }
                  : {
                      backgroundColor: palette.card,
                      borderWidth: 1,
                      borderColor: palette.accent,
                    },
              ]}
            >
              <Text
                style={{
                  color: !scheduleWorks ? '#fff' : palette.accent,
                  fontWeight: '700',
                }}
              >
                No, select new date & time
              </Text>
            </Pressable>
          </View>

          {/* ── Alternative date & time picker ── */}
          {!scheduleWorks && (
            <View style={{ marginTop: 16, gap: 12 }}>
              <Text
                style={{
                  color: palette.textPrimary,
                  fontWeight: '700',
                  fontSize: 15,
                }}
              >
                Select your preferred date & time:
              </Text>

              <CalendarDatePicker
                label="Preferred Date"
                value={preferredSelectedDate}
                onChange={(nextDate, label) => {
                  setPreferredSelectedDate(nextDate);
                  setPreferredDate(label);
                }}
              />

              <FieldLabel>Preferred Time Window</FieldLabel>
              <View style={styles.chipRow}>
                {TIME_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setPreferredWindow(option)}
                    disabled={isWaitingForAdmin}
                    style={[
                      styles.chip,
                      preferredWindow === option
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
                          preferredWindow === option
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

              <FieldLabel>Notes / Reason for rescheduling (optional)</FieldLabel>
              <TextInput
                multiline
                value={availabilityNotes}
                onChangeText={setAvailabilityNotes}
                editable={!isWaitingForAdmin}
                placeholder="e.g. I am out of town on the proposed date, please deliver on Friday…"
                placeholderTextColor={palette.textSecondary}
                style={[
                  styles.textArea,
                  {
                    backgroundColor: palette.softCard,
                    color: palette.textPrimary,
                  },
                ]}
              />
            </View>
          )}
        </SectionCard>
      </View>

      {/* ── Buttons ── */}
      {isWaitingForAdmin ? (
        <View style={styles.waitingBtnContainer}>
          <Ionicons name="hourglass-outline" size={20} color="#7A4D05" />
          <Text style={styles.waitingBtnText}>
            Waiting for Workshop Confirmation…
          </Text>
        </View>
      ) : scheduleWorks ? (
        <PrimaryButton
          label="Confirm Schedule & Proceed"
          icon="checkmark"
          disabled={submitting}
          onPress={handleConfirmSchedule}
        />
      ) : (
        <PrimaryButton
          label={submitting ? 'Sending Request…' : 'Send New Schedule to Workshop'}
          icon="paper-plane"
          disabled={submitting}
          onPress={handleSendNewSchedule}
        />
      )}

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
  body: { fontSize: 14, lineHeight: 20 },
  formWrapper: { gap: 14 },
  greyedOutForm: {
    opacity: 0.5,
  },
  videoBox: {
    height: 160,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  checkList: { gap: 4, marginTop: 10 },
  passLine: { color: '#157651', fontWeight: '600', fontSize: 13 },
  scheduleRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 6 },
  yesNoRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  choiceBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 80,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
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
