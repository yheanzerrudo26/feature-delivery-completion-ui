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
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const TIME_OPTIONS = [
  '10:00 AM – 12:00 PM',
  '1:00 PM – 3:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

const QUICK_REASONS = [
  'High workshop volume',
  'Staff leave / capacity',
  'Client availability conflict',
  'Courier slot unavailable',
];

/**
 * Used when the client selects No on the ready-for-pickup schedule.
 * Admin proposes a new available date/time (mirrors Decline layout).
 */
export default function ReschedulePickupScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, reschedulePickup, markReturnDelivery } = useAdminRequest();
  const request =
    requests.find((item) => item.id === id) ||
    requests.find((item) => item.stage === 'reschedule_needed') ||
    requests[0];

  const [selectedDate, setSelectedDate] = useState(() =>
    parseDisplayDate(request?.pickup?.date, new Date(2026, 9, 18)),
  );
  const [date, setDate] = useState(
    () => request?.pickup?.date || formatDisplayDate(new Date(2026, 9, 18)),
  );
  const [window, setWindow] = useState(TIME_OPTIONS[2]);
  const [reason, setReason] = useState('Client availability conflict');
  const [notes, setNotes] = useState('');

  const handleApproveClientSchedule = () => {
    const approvedDate = request.pickup?.preferredDate || date;
    const approvedWindow = request.pickup?.preferredWindow || window;
    markReturnDelivery(request.id, {
      date: approvedDate,
      window: approvedWindow,
      alternate: '',
      clientResponse: 'yes',
    });
    router.replace('/admin-tabs/admin-forms');
  };

  const notification = useMemo(() => {
    return `Hi ${request.clientName}, we updated the return pickup for request ${request.id} (${request.item}). New proposed schedule: ${date}, ${window}. ${
      notes.trim() ? notes.trim() + ' ' : ''
    }Please reply Yes or No in the app. If No, add when you are available.`;
  }, [request, date, window, notes]);

  const [preview, setPreview] = useState('');
  const message = preview || notification;

  const handleConfirm = () => {
    reschedulePickup(
      request.id,
      {
        date,
        window,
        alternate: '',
        clientAvailability: request.pickup?.clientAvailability || '',
      },
      reason,
      message,
    );
    router.replace('/admin-tabs/admin-forms');
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Reschedule Pickup"
        subtitle="Client declined the first schedule. Propose a new available day and time window."
        rightLabel={request.id}
      />

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Request summary
        </Text>
        <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
          {request.item}
        </Text>
        <Text style={{ color: palette.textSecondary }}>
          {request.clientName} · {request.serviceProtocol}
        </Text>
      </SectionCard>

      <InfoBanner
        tone="warn"
        text={`Client said No to ${request.pickup?.date || 'the proposed schedule'} (${request.pickup?.window || 'previous window'}). Availability note: “${request.pickup?.clientAvailability || 'None provided'}”`}
      />

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Proposed new schedule
        </Text>

        <CalendarDatePicker
          label="Available date"
          value={selectedDate}
          onChange={(nextDate, label) => {
            setSelectedDate(nextDate);
            setDate(label);
            setPreview('');
          }}
        />

        <FieldLabel>Time window</FieldLabel>
        <View style={styles.chipRow}>
          {TIME_OPTIONS.map((option) => (
            <ChoiceChip
              key={option}
              label={option}
              selected={window === option}
              onPress={() => {
                setWindow(option);
                setPreview('');
              }}
              palette={palette}
              icon="time-outline"
            />
          ))}
        </View>

        <FieldLabel>Why rescheduling</FieldLabel>
        <View style={styles.chipRow}>
          {QUICK_REASONS.map((item) => {
            const selected = reason === item;
            return (
              <Pressable
                key={item}
                onPress={() => setReason(item)}
                style={[
                  styles.chip,
                  selected
                    ? { backgroundColor: '#E8F1FF', borderColor: '#95BEF0' }
                    : {
                        backgroundColor: palette.softCard,
                        borderColor: palette.textSecondary + '30',
                      },
                ]}
              >
                <Text
                  style={{
                    color: selected ? '#143D76' : palette.textPrimary,
                    fontSize: 12,
                    fontWeight: '600',
                  }}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FieldLabel>Optional note to client</FieldLabel>
        <TextInput
          value={notes}
          onChangeText={(value) => {
            setNotes(value);
            setPreview('');
          }}
          placeholder="Add courier constraints or workshop notes…"
          placeholderTextColor={palette.textSecondary}
          multiline
          style={[
            styles.textArea,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
        />
      </SectionCard>

      <InfoBanner
        tone="info"
        text="Confirming sends a new pickup proposal. The client must answer Yes or No again before return delivery is booked."
      />

      <SectionCard>
        <FieldLabel>Client notification preview</FieldLabel>
        <TextInput
          value={message}
          onChangeText={setPreview}
          multiline
          style={[
            styles.textArea,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
        />
      </SectionCard>

      <View style={[styles.summaryBox, { backgroundColor: palette.softCard }]}>
        <Ionicons name="calendar" size={18} color={palette.accent} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
            {date}
          </Text>
          <Text style={{ color: palette.textSecondary }}>{window}</Text>
        </View>
      </View>

      {request.pickup?.preferredDate ? (
        <PrimaryButton
          label={`Approve Client's Schedule (${request.pickup.preferredDate}) & Ship`}
          icon="checkmark-circle"
          onPress={handleApproveClientSchedule}
        />
      ) : null}

      <PrimaryButton
        label="Confirm Reschedule"
        icon="checkmark"
        onPress={handleConfirm}
      />
      <PrimaryButton
        label="Cancel and Return"
        variant="secondary"
        onPress={() => router.back()}
      />
    </KeyboardAwareScreen>
  );
}

function ChoiceChip({ label, selected, onPress, palette, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        selected
          ? { backgroundColor: '#DCEBFB', borderColor: '#95BEF0' }
          : {
              backgroundColor: palette.softCard,
              borderColor: palette.textSecondary + '30',
            },
      ]}
    >
      <Ionicons
        name={icon}
        size={14}
        color={selected ? '#143D76' : palette.textSecondary}
      />
      <Text
        style={{
          color: selected ? '#143D76' : palette.textPrimary,
          fontSize: 12,
          fontWeight: '600',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  textArea: {
    minHeight: 90,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  summaryBox: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
