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
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ReadyForPickupScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const {
    requests,
    draft,
    updatePickupField,
    updateRequestStage,
    setSelectedOrder,
  } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) || requests[0];

  const handleSubmit = () => {
    updateRequestStage(request.order, {
      stage: 'return_delivery',
      badge: 'Return delivery',
      badgeVariant: 'amber',
      detail: 'Waiting for return courier updates',
      progress: 0.85,
      pickupResponse: {
        accepted: draft.pickup.scheduleWorks,
        notes: draft.pickup.availabilityNotes,
      },
    });
    setSelectedOrder(request.order);
    router.replace({
      pathname: '/user-tabs/return-delivery',
      params: { order: request.order },
    });
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Ready for Pickup"
        subtitle="Review the restored item and confirm the pickup schedule."
        rightLabel="4 of 6"
      />

      <InfoBanner
        tone="warn"
        text={`Restoration complete for Request ${request.order}. Review evidence, then respond to the proposed pickup window.`}
      />

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Artisan video evidence
        </Text>
        <View style={[styles.videoBox, { backgroundColor: palette.softCard }]}>
          <Ionicons name="play-circle" size={48} color={palette.accent} />
          <Text style={{ color: palette.textSecondary }}>Tap to play preview</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Final item report
        </Text>
        <Text style={[styles.body, { color: palette.textSecondary }]}>
          Seam reinforced and restitched. Panels deep-conditioned. Contact edges
          color-blended and sealed.
        </Text>
        <View style={styles.checkList}>
          <Text style={styles.passLine}>✓ Stitch integrity</Text>
          <Text style={styles.passLine}>✓ Finish cured</Text>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Proposed pickup schedule
        </Text>
        <View style={styles.scheduleRow}>
          <Ionicons name="calendar-outline" size={20} color={palette.accent} />
          <View>
            <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
              {draft.pickup.proposedDate}
            </Text>
            <Text style={{ color: palette.textSecondary }}>
              {draft.pickup.proposedWindow}
            </Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Does this schedule work for you?
        </Text>
        <View style={styles.yesNoRow}>
          <Pressable
            onPress={() => updatePickupField('scheduleWorks', true)}
            style={[
              styles.choiceBtn,
              draft.pickup.scheduleWorks
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
                color: draft.pickup.scheduleWorks ? '#fff' : palette.accent,
                fontWeight: '700',
              }}
            >
              Yes
            </Text>
          </Pressable>
          <Pressable
            onPress={() => updatePickupField('scheduleWorks', false)}
            style={[
              styles.choiceBtn,
              !draft.pickup.scheduleWorks
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
                color: !draft.pickup.scheduleWorks ? '#fff' : palette.accent,
                fontWeight: '700',
              }}
            >
              No
            </Text>
          </Pressable>
        </View>

        {!draft.pickup.scheduleWorks ? (
          <View>
            <FieldLabel>If No, when are you available?</FieldLabel>
            <TextInput
              multiline
              value={draft.pickup.availabilityNotes}
              onChangeText={(value) =>
                updatePickupField('availabilityNotes', value)
              }
              placeholder="Add preferred dates and times…"
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
        ) : null}
      </SectionCard>

      <PrimaryButton
        label="Submit Pickup Response"
        icon="paper-plane"
        disabled={
          !draft.pickup.scheduleWorks && !draft.pickup.availabilityNotes.trim()
        }
        onPress={handleSubmit}
      />
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  body: { fontSize: 14, lineHeight: 20 },
  videoBox: {
    height: 160,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkList: { gap: 4 },
  passLine: { color: '#157651', fontWeight: '600', fontSize: 13 },
  scheduleRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  yesNoRow: { flexDirection: 'row', gap: 10 },
  choiceBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  textArea: {
    minHeight: 90,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
  },
});
