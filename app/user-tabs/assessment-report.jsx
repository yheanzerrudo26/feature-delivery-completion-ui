
import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import {
  FieldLabel,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
  StepProgress,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const ALL_TAGS = [
  'Dry leather',
  'Surface scuffs',
  'Loose stitching',
  'Faded edges',
  'Edge wear',
  'Water stains',
  'Mold residue',
];

export default function AssessmentReportScreen() {
  const { palette } = useAppTheme();

  const {
    draft,
    updateAssessmentField,
    toggleDamageTag,
    submitDraft,
  } = useUserRequest();

  const [editingFindings, setEditingFindings] = useState(false);
  const [editingTags, setEditingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Wait until Firestore successfully saves the request.
      const order = await submitDraft();

      // Navigate only after a successful submission.
      router.replace({
        pathname: '/user-tabs/request-submitted',
        params: { order },
      });
    } catch (error) {
      console.error('Service request submission failed:', error);

      Alert.alert(
        'Submission failed',
        error?.message ||
          'Unable to submit your service request. Please check your internet connection and try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={160}
    >
      <RequestScreenHeader
        title="Assessment Report"
        subtitle="Review the AI findings. Edit if needed, then send your service request."
      />

      <StepProgress activeIndex={3} completedThrough={2} />

      <View style={styles.metaRow}>
        <Text style={[styles.metaText, { color: palette.textSecondary }]}>
          Draft report
        </Text>

        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceText}>
            AI · {draft.assessment.confidence}% confidence
          </Text>
        </View>
      </View>

      <SectionCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            AI findings
          </Text>

          <Pressable
            onPress={() => setEditingFindings((v) => !v)}
            disabled={isSubmitting}
          >
            <Text style={[styles.editLink, { color: palette.accent }]}>
              {editingFindings ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        </View>

        {editingFindings ? (
          <TextInput
            multiline
            value={draft.assessment.findings}
            editable={!isSubmitting}
            onChangeText={(value) =>
              updateAssessmentField('findings', value)
            }
            style={[
              styles.textArea,
              {
                backgroundColor: palette.softCard,
                color: palette.textPrimary,
              },
            ]}
          />
        ) : (
          <Text style={[styles.bodyText, { color: palette.textSecondary }]}>
            {draft.assessment.findings}
          </Text>
        )}
      </SectionCard>

      <SectionCard>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Identified damage
          </Text>

          <Pressable
            onPress={() => setEditingTags((v) => !v)}
            disabled={isSubmitting}
          >
            <Text style={[styles.editLink, { color: palette.accent }]}>
              {editingTags ? 'Done' : 'Edit'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.tagRow}>
          {(editingTags ? ALL_TAGS : draft.assessment.damageTags).map(
            (tag) => {
              const selected = draft.assessment.damageTags.includes(tag);

              if (!editingTags && !selected) return null;

              return (
                <Pressable
                  key={tag}
                  disabled={!editingTags || isSubmitting}
                  onPress={() => toggleDamageTag(tag)}
                  style={[
                    styles.tag,
                    selected
                      ? {
                          backgroundColor: '#E8F1FF',
                          borderColor: '#95BEF0',
                        }
                      : {
                          backgroundColor: palette.softCard,
                          borderColor: palette.textSecondary + '30',
                        },
                  ]}
                >
                  <Text
                    style={{
                      color: selected ? '#143D76' : palette.textSecondary,
                      fontSize: 12,
                      fontWeight: '600',
                    }}
                  >
                    {tag}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>
      </SectionCard>

      <SectionCard style={styles.protocolCard}>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Suggested service protocol
        </Text>

        <Text style={[styles.protocolName, { color: palette.accent }]}>
          {draft.assessment.protocolTitle}
        </Text>

        {draft.assessment.protocolSteps.map((step, index) => (
          <View key={step} style={styles.protocolStep}>
            <Text style={styles.protocolIndex}>
              {String(index + 1).padStart(2, '0')}
            </Text>

            <Text style={[styles.bodyText, { color: palette.textPrimary }]}>
              {step}
            </Text>
          </View>
        ))}
      </SectionCard>

      <SectionCard>
        <FieldLabel>Client notes</FieldLabel>

        <TextInput
          multiline
          value={draft.assessment.clientNotes}
          editable={!isSubmitting}
          onChangeText={(value) =>
            updateAssessmentField('clientNotes', value)
          }
          placeholder="Add anything the artisan should know…"
          placeholderTextColor={palette.textSecondary}
          style={[
            styles.textArea,
            {
              backgroundColor: palette.softCard,
              color: palette.textPrimary,
            },
          ]}
        />
      </SectionCard>

      <PrimaryButton
        label="Edit Report"
        variant="secondary"
        onPress={() => {
          setEditingFindings(true);
          setEditingTags(true);
        }}
      />

      <PrimaryButton
        label={isSubmitting ? 'Submitting Request...' : 'Send Service Request'}
        icon="paper-plane"
        onPress={handleSend}
        disabled={isSubmitting}
      />

      {isSubmitting && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={palette.accent} />
          <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
            Saving your service request...
          </Text>
        </View>
      )}
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  confidenceBadge: {
    backgroundColor: '#E8F1FF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confidenceText: {
    color: '#215AA8',
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  editLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textArea: {
    minHeight: 90,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  protocolCard: {
    backgroundColor: '#FFF8E8',
    borderColor: '#F0D7A0',
  },
  protocolName: {
    fontSize: 15,
    fontWeight: '700',
  },
  protocolStep: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  protocolIndex: {
    color: '#8A6510',
    fontWeight: '700',
    fontSize: 13,
    width: 24,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  loadingText: {
    fontSize: 13,
  },
});
