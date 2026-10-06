import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import {
  FieldLabel,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const HIGHLIGHTS = ['Craftsmanship', 'Communication', 'Care', 'Delivery'];

export default function FinalFeedbackScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const {
    requests,
    draft,
    updateFeedbackField,
    toggleFeedbackTag,
    updateRequestStage,
    setSelectedOrder,
  } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) || requests[0];

  const canSubmit =
    draft.feedback.received &&
    draft.feedback.rating > 0 &&
    draft.feedback.comments.trim();

  const handleSubmit = () => {
    updateRequestStage(request.order, {
      stage: 'complete',
      badge: 'Complete',
      badgeVariant: 'mint',
      detail: 'Service completed and feedback submitted',
      progress: null,
      feedback: { ...draft.feedback },
    });
    setSelectedOrder(request.order);
    router.replace('/user-tabs/user-dashboard');
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Final Confirmation & Feedback"
        subtitle="Confirm receipt and share your restoration experience."
        rightLabel="6 of 6"
      />

      <SectionCard>
        <View style={styles.arrivedRow}>
          <Ionicons name="cube-outline" size={28} color={palette.accent} />
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Your item has arrived
          </Text>
        </View>
        <Pressable
          style={styles.confirmRow}
          onPress={() =>
            updateFeedbackField('received', !draft.feedback.received)
          }
        >
          <View
            style={[
              styles.checkbox,
              draft.feedback.received
                ? { backgroundColor: palette.accent, borderColor: palette.accent }
                : { borderColor: palette.textSecondary },
            ]}
          >
            {draft.feedback.received ? (
              <Text style={styles.checkMark}>✓</Text>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
              Confirm Item Received
            </Text>
            <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
              I received the item and checked its condition.
            </Text>
          </View>
        </Pressable>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Rate your restoration experience
        </Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => updateFeedbackField('rating', star)}
            >
              <Ionicons
                name={draft.feedback.rating >= star ? 'star' : 'star-outline'}
                size={32}
                color="#F7B541"
              />
            </Pressable>
          ))}
        </View>
        <Text style={{ color: palette.textSecondary }}>
          {draft.feedback.rating
            ? `${draft.feedback.rating} — ${
                ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'][
                  draft.feedback.rating
                ]
              }`
            : 'Tap a star to rate'}
        </Text>
      </SectionCard>

      <SectionCard>
        <FieldLabel>Concerns, questions, or compliments</FieldLabel>
        <TextInput
          multiline
          value={draft.feedback.comments}
          onChangeText={(value) => updateFeedbackField('comments', value)}
          placeholder="Share details about the service, artisan, delivery, or your restored item…"
          placeholderTextColor={palette.textSecondary}
          style={[
            styles.textArea,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
        />

        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          What stood out?
        </Text>
        <View style={styles.tagRow}>
          {HIGHLIGHTS.map((tag) => {
            const selected = draft.feedback.tags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => toggleFeedbackTag(tag)}
                style={[
                  styles.tag,
                  selected
                    ? { backgroundColor: '#FFF1C9', borderColor: '#F0D7A0' }
                    : {
                        backgroundColor: palette.softCard,
                        borderColor: palette.textSecondary + '30',
                      },
                ]}
              >
                <Text
                  style={{
                    color: selected ? '#8A6510' : palette.textPrimary,
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <View style={[styles.summaryBox, { backgroundColor: palette.softCard }]}>
        <Text style={{ color: palette.textSecondary, fontSize: 12 }}>
          REQUEST {request.order}
        </Text>
        <Text style={{ color: palette.textPrimary, fontWeight: '700' }}>
          {request.item}
        </Text>
        <Text style={{ color: '#157651', fontWeight: '700', fontSize: 12 }}>
          RECEIVED
        </Text>
      </View>

      <PrimaryButton
        label="Submit Feedback"
        icon="paper-plane"
        disabled={!canSubmit}
        onPress={handleSubmit}
      />
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 8, gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  arrivedRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  confirmRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkMark: { color: '#fff', fontWeight: '700', fontSize: 12 },
  stars: { flexDirection: 'row', gap: 6 },
  textArea: {
    minHeight: 100,
    borderRadius: 12,
    padding: 12,
    textAlignVertical: 'top',
    fontSize: 14,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  summaryBox: {
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
});
