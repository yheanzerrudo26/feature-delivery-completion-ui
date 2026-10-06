import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import {
  FieldLabel,
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useAdminRequest } from '@/context/admin-request-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const QUICK_REASONS = [
  'Photos are incomplete',
  'Service is outside our scope',
  'Item condition is unsafe',
  'More details are required',
];

export default function DeclineRequestScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, declineRequest } = useAdminRequest();
  const request =
    requests.find((item) => item.id === id) || requests[0];

  const [reason, setReason] = useState('');
  const [selectedQuick, setSelectedQuick] = useState('');

  const notification = useMemo(() => {
    const body =
      reason.trim() ||
      selectedQuick ||
      'We are unable to proceed with this restoration request at this time.';
    return `Hi ${request.clientName}, your request ${request.id} for ${request.item} was declined. Reason: ${body} You may edit and resubmit from the app, or message support in Chat.`;
  }, [reason, selectedQuick, request]);

  const [preview, setPreview] = useState('');
  const message = preview || notification;

  const handleConfirm = () => {
    const finalReason = reason.trim() || selectedQuick;
    if (!finalReason) return;
    declineRequest(request.id, finalReason, message);
    router.replace('/admin-tabs/admin-forms');
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Decline Request"
        subtitle="Enter a reason. The client will be notified in-app and by email."
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

      <SectionCard>
        <FieldLabel>Reason for declining</FieldLabel>
        <TextInput
          value={reason}
          onChangeText={(value) => {
            setReason(value);
            setPreview('');
          }}
          placeholder="Explain why this request cannot proceed…"
          placeholderTextColor={palette.textSecondary}
          multiline
          style={[
            styles.textArea,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
        />

        <Text style={[styles.quickLabel, { color: palette.textSecondary }]}>
          Quick reasons
        </Text>
        <View style={styles.chipRow}>
          {QUICK_REASONS.map((item) => {
            const selected = selectedQuick === item;
            return (
              <Pressable
                key={item}
                onPress={() => {
                  setSelectedQuick(item);
                  setReason(item);
                  setPreview('');
                }}
                style={[
                  styles.chip,
                  selected
                    ? { backgroundColor: '#FDECEC', borderColor: '#F0B4B4' }
                    : {
                        backgroundColor: palette.softCard,
                        borderColor: palette.textSecondary + '30',
                      },
                ]}
              >
                <Text
                  style={{
                    color: selected ? '#B42318' : palette.textPrimary,
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
      </SectionCard>

      <InfoBanner
        tone="danger"
        text="Permanent action for this submission. Confirming removes it from the pending review queue and notifies the client."
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

      <PrimaryButton
        label="Confirm Decline"
        variant="danger"
        icon="close-circle"
        disabled={!(reason.trim() || selectedQuick)}
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

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
    lineHeight: 20,
  },
  quickLabel: { fontSize: 13, fontWeight: '600' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
