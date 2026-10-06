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
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const TIME_OPTIONS = [
  '10:00 AM – 12:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

export default function CompletionPickupScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, sendPickupNotice, updateRequest, setSelectedId } =
    useAdminRequest();
  const request =
    requests.find((item) => item.id === id) ||
    requests.find((item) => item.stage === 'in_progress') ||
    requests[0];

  const [selectedDate, setSelectedDate] = useState(() =>
    parseDisplayDate(request.pickup?.date, new Date(2026, 9, 16)),
  );
  const [date, setDate] = useState(
    () => request.pickup?.date || formatDisplayDate(new Date(2026, 9, 16)),
  );
  const [window, setWindow] = useState(
    request.pickup?.window || TIME_OPTIONS[1],
  );
  const [alternate, setAlternate] = useState(request.pickup?.alternate || '');
  const [report, setReport] = useState(
    request.completion?.report ||
      'Restoration complete. Stitch integrity checked. Finish cured.',
  );

  useEffect(() => {
    const nextDay = new Date(selectedDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setAlternate(`${formatDisplayDate(nextDay)} · ${TIME_OPTIONS[0]}`);
  }, [selectedDate]);

  const awaiting = request.stage === 'awaiting_pickup_response';

  const handleSend = () => {
    updateRequest(request.id, {
      completion: {
        ...request.completion,
        videoUploaded: true,
        videoName:
          request.completion?.videoName ||
          `completion-${request.id.replace('#', '')}.mp4`,
        report,
        conditionScore: request.completion?.conditionScore || '4.5/5',
        materials:
          request.completion?.materials || 'Thread, conditioner, edge dye',
        careAdvice:
          request.completion?.careAdvice ||
          'Condition every 3–4 months. Avoid prolonged sun.',
      },
    });
    sendPickupNotice(request.id, { date, window, alternate });
    setSelectedId(request.id);
    Alert.alert(
      'Notice sent',
      'Client will confirm Yes or No on the proposed pickup schedule. If No, use Reschedule Pickup.',
      [{ text: 'OK', onPress: () => router.replace('/admin-tabs/admin-forms') }],
    );
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Completion & Pickup"
        subtitle="Attach evidence, finalize the report, and propose a pickup schedule."
        rightLabel={request.id}
        onBack={() => router.replace('/admin-tabs/admin-forms')}
      />

      <View style={styles.badgeRow}>
        <Text style={styles.qcBadge}>Quality check passed</Text>
      </View>

      <SectionCard style={styles.successCard}>
        <Ionicons name="checkmark-circle" size={28} color="#157651" />
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#157651', fontWeight: '700', fontSize: 16 }}>
            Restoration completed
          </Text>
          <Text style={{ color: palette.textSecondary, fontSize: 13 }}>
            Ready to notify the client for return pickup.
          </Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Completion video
        </Text>
        <View style={[styles.videoRow, { backgroundColor: palette.softCard }]}>
          <Ionicons name="videocam-outline" size={24} color={palette.accent} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.textPrimary, fontWeight: '600' }}>
              {request.completion?.videoName ||
                `completion-${request.id.replace('#', '')}.mp4`}
            </Text>
            <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
              Video evidence of restored item
            </Text>
          </View>
          <Text style={styles.uploaded}>Uploaded</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Final item report
        </Text>
        <TextInput
          multiline
          value={report}
          onChangeText={setReport}
          style={[
            styles.textArea,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
        />
        <Row label="Final condition" value="4.5 / 5" palette={palette} />
        <Row
          label="Materials used"
          value={
            request.completion?.materials || 'Thread, conditioner, edge dye'
          }
          palette={palette}
        />
        <Pressable style={[styles.pdfBtn, { borderColor: palette.accent }]}>
          <Ionicons
            name="document-text-outline"
            size={16}
            color={palette.accent}
          />
          <Text style={{ color: palette.accent, fontWeight: '700' }}>
            Preview final report PDF
          </Text>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Proposed pickup schedule
        </Text>

        <CalendarDatePicker
          label="Date"
          value={selectedDate}
          onChange={(nextDate, label) => {
            setSelectedDate(nextDate);
            setDate(label);
          }}
        />

        <FieldLabel>Time window</FieldLabel>
        <View style={styles.chipRow}>
          {TIME_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => setWindow(option)}
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
          style={[
            styles.input,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
        />
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Client response
        </Text>
        <Text style={{ color: palette.textSecondary }}>
          {awaiting
            ? 'Awaiting Yes / No from client. If No, open Reschedule Pickup.'
            : 'Not sent yet — send the ready-for-pickup notice below.'}
        </Text>
      </SectionCard>

      {awaiting ? (
        <InfoBanner
          tone="info"
          text="If the client selects No, use Reschedule Pickup to propose a new available day and time."
        />
      ) : null}

      <PrimaryButton
        label={
          awaiting
            ? 'Resend Ready-for-Pickup Notice'
            : 'Send Ready-for-Pickup Notice'
        }
        icon="rocket-outline"
        onPress={handleSend}
      />

      {awaiting ? (
        <PrimaryButton
          label="Open Reschedule Pickup"
          variant="secondary"
          icon="calendar-outline"
          onPress={() =>
            router.push({
              pathname: '/admin-tabs/reschedule-pickup',
              params: { id: request.id },
            })
          }
        />
      ) : null}
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
  badgeRow: { flexDirection: 'row' },
  qcBadge: {
    backgroundColor: '#FFE6B8',
    color: '#8A5A06',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#E8F8EF',
    borderColor: '#A8DFC0',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  videoRow: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploaded: {
    backgroundColor: '#DDF9EC',
    color: '#157651',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 90,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  row: { flexDirection: 'row', gap: 8 },
  pdfBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
});
