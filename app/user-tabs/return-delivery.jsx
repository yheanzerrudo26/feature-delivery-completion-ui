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
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIME_OPTIONS = [
  '10:00 AM – 12:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

export default function ReturnDeliveryScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests, updateRequestStage, setSelectedOrder } = useUserRequest();

  const request =
    requests.find((item) => item.order === order) ||
    (order
      ? requests.find((item) => String(item.order).includes(order))
      : null) ||
    requests[0];

  const [notReceivedModalVisible, setNotReceivedModalVisible] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [newSelectedDate, setNewSelectedDate] = useState(
    () => new Date(Date.now() + 86400000 * 2),
  );
  const [newDate, setNewDate] = useState(() =>
    formatDisplayDate(new Date(Date.now() + 86400000 * 2)),
  );
  const [newWindow, setNewWindow] = useState(TIME_OPTIONS[1]);
  const [submitting, setSubmitting] = useState(false);

  if (!request) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          {
            backgroundColor: palette.background,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          },
        ]}
        edges={['top']}
      >
        <Text style={{ color: palette.textSecondary }}>
          Loading delivery details...
        </Text>
        <PrimaryButton
          label="Return to Dashboard"
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/user-tabs/user-dashboard')}
        />
      </SafeAreaView>
    );
  }

  const agreedDate = request.pickup?.date || 'October 16, 2026';
  const agreedWindow = request.pickup?.window || '2:00 PM – 4:00 PM';

  // Condition 1: Admin has submitted return delivery form with proof & link
  const adminHasDispatched = Boolean(
    request.returnDelivery?.dispatchedAt ||
      (request.returnDelivery?.proofUri && request.returnDelivery?.sharedLink),
  );

  // Condition 2: Client reported item not received, and admin has NOT yet confirmed the updated date & time
  const isWaitingAdminDateConfirm =
    Boolean(request.itemNotReceivedReportedAt) &&
    !request.itemNotReceivedResolved;

  // The receive button is locked (greyed out) if admin hasn't dispatched yet OR waiting for reschedule confirmation
  const receiveLocked = !adminHasDispatched || isWaitingAdminDateConfirm;

  const steps = [
    { title: 'Restoration completed', done: true },
    {
      title: 'Picked up from workshop',
      done: adminHasDispatched,
      current: !adminHasDispatched,
      meta: adminHasDispatched ? 'Item dispatched' : 'Workshop preparing package',
    },
    {
      title: isWaitingAdminDateConfirm
        ? 'Delivery rescheduled'
        : 'In transit to you',
      done: request.stage === 'feedback' || request.stage === 'complete',
      current: adminHasDispatched && !isWaitingAdminDateConfirm,
      meta: !adminHasDispatched
        ? 'Waiting for workshop dispatch'
        : isWaitingAdminDateConfirm
          ? `Requested new date: ${request.returnRescheduleDate || 'Pending admin confirmation'}`
          : `Scheduled: ${agreedDate} · ${agreedWindow}`,
    },
    {
      title: 'Item received by you',
      done: request.stage === 'feedback' || request.stage === 'complete',
      meta: !adminHasDispatched
        ? 'Locked until dispatched by workshop'
        : isWaitingAdminDateConfirm
          ? 'Locked until redelivery confirmed'
          : 'Waiting for your confirmation',
    },
  ];

  const handleConfirmReceived = async () => {
    // Prevent clicking if admin has not dispatched or not yet confirmed date and time
    if (receiveLocked || !request?.order || submitting) return;
    setSubmitting(true);
    try {
      await updateRequestStage(request.order, {
        stage: 'feedback',
        badge: 'Confirm receipt',
        badgeVariant: 'amber',
        detail: 'Confirm receipt and leave feedback',
        progress: 0.95,
      });
      setSelectedOrder(request.order);
      router.replace({
        pathname: '/user-tabs/final-feedback',
        params: { order: request.order },
      });
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportNotReceived = async () => {
    if (!request?.order || submitting) return;
    setSubmitting(true);
    try {
      await updateRequestStage(request.order, {
        itemNotReceivedReportedAt: new Date().toISOString(),
        itemNotReceivedNote:
          reportNote.trim() || 'Client reported item has not arrived yet.',
        returnRescheduleDate: newDate,
        returnRescheduleWindow: newWindow,
        itemNotReceivedResolved: false,
        detail: `Item reported not received · Requested redelivery on ${newDate} (${newWindow})`,
      });
      setNotReceivedModalVisible(false);
      Alert.alert(
        'Redelivery Requested',
        `Your request for ${newDate} (${newWindow}) has been sent to the workshop admin. The confirmation button will unlock once the admin confirms the date and time.`,
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to notify admin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <RequestScreenHeader
          title="Return Delivery"
          subtitle="Track the return delivery and confirm when your item arrives."
          rightLabel={request.order}
          onBack={() => router.replace('/user-tabs/user-dashboard')}
        />

        {/* ── Status Banner ── */}
        {!adminHasDispatched ? (
          <View
            style={[
              styles.alertCard,
              { backgroundColor: '#F0F5FD', borderColor: '#C4D8FA' },
            ]}
          >
            <View style={styles.alertRow}>
              <Ionicons name="cube-outline" size={20} color="#1D4ED8" />
              <Text style={[styles.alertTitle, { color: '#1D4ED8' }]}>
                Preparing for Return Delivery
              </Text>
            </View>
            <Text style={[styles.alertText, { color: '#1E3A8A' }]}>
              Your item restoration is complete! The workshop is now preparing your package for delivery. Once the artisan attaches the delivery proof picture and shared link, you will be able to confirm receipt.
            </Text>
          </View>
        ) : isWaitingAdminDateConfirm ? (
          <View
            style={[
              styles.alertCard,
              { backgroundColor: '#FEF0C7', borderColor: '#FDB022' },
            ]}
          >
            <View style={styles.alertRow}>
              <Ionicons name="time" size={20} color="#B54708" />
              <Text style={[styles.alertTitle, { color: '#B54708' }]}>
                Awaiting Admin Date Confirmation
              </Text>
            </View>
            <Text style={[styles.alertText, { color: '#7A2E0E' }]}>
              You reported this item has not arrived and requested redelivery on:{'\n'}
              <Text style={{ fontWeight: '700' }}>
                📅 {request.returnRescheduleDate || newDate} · {request.returnRescheduleWindow || newWindow}
              </Text>
              {request.itemNotReceivedNote ? `\nNote: “${request.itemNotReceivedNote}”` : ''}
              {'\n\n'}The "I Have Received the Item" button below is locked in grey until the workshop admin confirms your redelivery date and time.
            </Text>
          </View>
        ) : (
          <InfoBanner
            tone="warn"
            text="Your item is on its way back to you. Please inspect the package when it arrives before confirming receipt."
          />
        )}

        {/* ── Schedule summary ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Delivery schedule
          </Text>
          <View style={styles.scheduleRow}>
            <Ionicons name="calendar-outline" size={22} color={palette.accent} />
            <View>
              <Text style={{ color: palette.textPrimary, fontWeight: '700', fontSize: 15 }}>
                {agreedDate}
              </Text>
              <Text style={{ color: palette.textSecondary }}>
                Window: {agreedWindow}
              </Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Return proof picture & shared link ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Artisan return package & proof
          </Text>
          {adminHasDispatched && (request.returnDelivery?.proofUri || request.returnDelivery?.sharedLink) ? (
            <>
              {request.returnDelivery?.proofUri ? (
                <View style={styles.proofContainer}>
                  <Image
                    source={{ uri: request.returnDelivery.proofUri }}
                    style={styles.proofImage}
                    contentFit="cover"
                  />
                </View>
              ) : null}

              {request.returnDelivery?.sharedLink ? (
                <View style={{ marginTop: 12 }}>
                  <Text style={{ color: palette.textSecondary, fontSize: 13, marginBottom: 4 }}>
                    Item shared link
                  </Text>
                  <View style={[styles.linkBox, { backgroundColor: palette.softCard }]}>
                    <Ionicons name="link-outline" size={18} color={palette.accent} />
                    <Text
                      style={{ color: palette.textPrimary, fontWeight: '600', flex: 1 }}
                      numberOfLines={2}
                    >
                      {request.returnDelivery.sharedLink}
                    </Text>
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View
              style={[
                styles.waitingProofBox,
                { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '25' },
              ]}
            >
              <Ionicons name="time-outline" size={32} color={palette.textSecondary} />
              <Text style={{ color: palette.textPrimary, fontWeight: '600', marginTop: 4 }}>
                Awaiting Workshop Delivery Form
              </Text>
              <Text
                style={{
                  color: palette.textSecondary,
                  fontSize: 13,
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                The workshop admin will upload the delivery proof picture and shared link once the item has been dispatched.
              </Text>
            </View>
          )}
        </SectionCard>

        {/* ── Tracking steps ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Delivery tracking summary
          </Text>
          {steps.map((step, index) => (
            <View key={step.title} style={styles.timelineRow}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.dot,
                    step.done
                      ? { backgroundColor: '#157651' }
                      : step.current
                        ? { backgroundColor: '#F7B541' }
                        : { backgroundColor: '#C5CDD9' },
                  ]}
                />
                {index < steps.length - 1 ? <View style={styles.line} /> : null}
              </View>
              <View style={styles.copy}>
                <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
                  {step.title}
                </Text>
                {step.meta ? (
                  <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
                    {step.meta}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </SectionCard>

        {/* ── Action buttons: Confirm Received (Green when unlocked, Grey when waiting) ── */}
        <View style={styles.actionColumn}>
          <TouchableOpacity
            style={[
              styles.confirmBtn,
              receiveLocked ? styles.confirmBtnDisabled : styles.confirmBtnActive,
              submitting && { opacity: 0.6 },
            ]}
            onPress={handleConfirmReceived}
            disabled={receiveLocked || submitting}
            activeOpacity={0.85}
          >
            <Ionicons
              name={receiveLocked ? 'hourglass-outline' : 'checkmark-circle-outline'}
              size={22}
              color={receiveLocked ? '#667085' : '#fff'}
            />
            <Text
              style={[
                styles.confirmBtnText,
                receiveLocked && styles.confirmBtnTextDisabled,
              ]}
            >
              {!adminHasDispatched
                ? 'Waiting for Workshop to Dispatch Item'
                : isWaitingAdminDateConfirm
                  ? 'Waiting for Admin to Confirm Date & Time'
                  : submitting
                    ? 'Confirming…'
                    : 'I Have Received the Item'}
            </Text>
          </TouchableOpacity>

          {adminHasDispatched && !isWaitingAdminDateConfirm && (
            <TouchableOpacity
              style={[
                styles.notReceivedBtn,
                { borderColor: '#B42318' },
                submitting && { opacity: 0.6 },
              ]}
              onPress={() => {
                setReportNote('');
                setNotReceivedModalVisible(true);
              }}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <Ionicons name="help-circle-outline" size={20} color="#B42318" />
              <Text style={styles.notReceivedBtnText}>
                Item Not Received Yet
              </Text>
            </TouchableOpacity>
          )}

          <PrimaryButton
            label="Return to Dashboard"
            variant="secondary"
            onPress={() => router.replace('/user-tabs/user-dashboard')}
          />
        </View>
      </ScrollView>

      {/* ── Not received report modal (Pick new date & time) ── */}
      <Modal
        visible={notReceivedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setNotReceivedModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setNotReceivedModalVisible(false)}
        >
          <Pressable
            style={[styles.modalSheet, { backgroundColor: palette.card }]}
            onPress={() => {}}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <View
                style={[
                  styles.handleBar,
                  { backgroundColor: palette.textSecondary + '40' },
                ]}
              />

              <View style={styles.modalIconRow}>
                <View style={styles.modalIconWrap}>
                  <Ionicons name="calendar-outline" size={32} color="#B42318" />
                </View>
              </View>

              <Text style={[styles.modalTitle, { color: palette.textPrimary }]}>
                Item Not Received Yet
              </Text>
              <Text style={[styles.modalSubtitle, { color: palette.textSecondary }]}>
                Please select your preferred new delivery date and time so the workshop can reschedule the delivery.
              </Text>

              {/* ── Date Picker ── */}
              <View style={{ marginVertical: 8 }}>
                <CalendarDatePicker
                  label="Select Preferred Delivery Date"
                  value={newSelectedDate}
                  onChange={(nextDate, label) => {
                    setNewSelectedDate(nextDate);
                    setNewDate(label);
                  }}
                />
              </View>

              {/* ── Time Window ── */}
              <FieldLabel>Select Preferred Time Window</FieldLabel>
              <View style={styles.chipRow}>
                {TIME_OPTIONS.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => setNewWindow(option)}
                    style={[
                      styles.chip,
                      newWindow === option
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
                          newWindow === option
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

              <Text style={[styles.noteLabel, { color: palette.textSecondary, marginTop: 12 }]}>
                Additional note (optional)
              </Text>
              <TextInput
                value={reportNote}
                onChangeText={setReportNote}
                placeholder="e.g. Courier did not arrive today, please deliver on my requested date."
                placeholderTextColor={palette.textSecondary}
                multiline
                numberOfLines={3}
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: palette.softCard,
                    color: palette.textPrimary,
                  },
                ]}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: palette.softCard }]}
                  onPress={() => setNotReceivedModalVisible(false)}
                >
                  <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalSubmitBtn]}
                  onPress={handleReportNotReceived}
                  disabled={submitting}
                >
                  <Text style={{ color: '#fff', fontWeight: '700' }}>
                    {submitting ? 'Sending…' : 'Submit & Notify Workshop'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 36 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  scheduleRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  proofContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 160,
    backgroundColor: '#00000010',
    marginTop: 6,
  },
  waitingProofBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 6,
    gap: 4,
  },
  proofImage: { width: '100%', height: '100%' },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timelineRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 16, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  line: { width: 2, flex: 1, backgroundColor: '#C5CDD9', marginVertical: 4 },
  copy: { flex: 1, paddingBottom: 14, gap: 2 },
  actionColumn: { gap: 10, marginTop: 6 },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnActive: {
    backgroundColor: '#157651',
  },
  confirmBtnDisabled: {
    backgroundColor: '#EAECF0',
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  confirmBtnTextDisabled: {
    color: '#667085',
  },
  notReceivedBtn: {
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  notReceivedBtnText: {
    color: '#B42318',
    fontWeight: '700',
    fontSize: 15,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  alertRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  alertTitle: { fontWeight: '700', fontSize: 15 },
  alertText: { fontSize: 13, lineHeight: 18 },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 12,
    maxHeight: '90%',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalIconRow: { alignItems: 'center' },
  modalIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 6 },
  modalSubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 18, marginTop: 4, marginBottom: 8 },
  noteLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  noteInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 14, paddingBottom: 16 },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitBtn: { backgroundColor: '#B42318' },
});
