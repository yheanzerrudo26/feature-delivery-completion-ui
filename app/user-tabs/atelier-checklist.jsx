import KeyboardAwareScreen from '@/components/KeyboardAwareScreen';
import {
  FieldLabel,
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
  StepProgress,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

const ITEM_TYPES = ['Leather bag', 'Shoes', 'Wallet', 'Accessory'];
const CONCERNS = ['Repair', 'Conditioning', 'Color restore', 'Full restoration'];

export default function RestorationRequestScreen() {
  const { palette } = useAppTheme();
  const { draft, updatePersonalField, updateItemField } = useUserRequest();

  const canContinue =
    draft.personal.fullName.trim() &&
    draft.personal.email.trim() &&
    draft.personal.mobile.trim() &&
    draft.personal.address.trim() &&
    draft.item.brandModel.trim() &&
    draft.item.color.trim() &&
    draft.item.damageNotes.trim();

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={140}
    >
      <RequestScreenHeader
        title="Restoration Request"
        subtitle="Tell us about you and the leather item you want restored."
        showBack={false}
      />

      <StepProgress activeIndex={0} />

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Personal details
        </Text>

        <View>
          <FieldLabel>Full name</FieldLabel>
          <TextInput
            value={draft.personal.fullName}
            onChangeText={(value) => updatePersonalField('fullName', value)}
            placeholder="Maria Santos"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>

        <View>
          <FieldLabel>Email</FieldLabel>
          <TextInput
            value={draft.personal.email}
            onChangeText={(value) => updatePersonalField('email', value)}
            placeholder="maria@email.com"
            placeholderTextColor={palette.textSecondary}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>

        <View>
          <FieldLabel>Mobile number</FieldLabel>
          <TextInput
            value={draft.personal.mobile}
            onChangeText={(value) => updatePersonalField('mobile', value)}
            placeholder="+63 917 123 4567"
            placeholderTextColor={palette.textSecondary}
            keyboardType="phone-pad"
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>

        <View>
          <FieldLabel>Address</FieldLabel>
          <TextInput
            value={draft.personal.address}
            onChangeText={(value) => updatePersonalField('address', value)}
            placeholder="Street, barangay, city"
            placeholderTextColor={palette.textSecondary}
            multiline
            style={[
              styles.textArea,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>
      </SectionCard>

      <SectionCard>
        <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
          Item details
        </Text>

        <View>
          <FieldLabel>Item type</FieldLabel>
          <View style={styles.chipRow}>
            {ITEM_TYPES.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                selected={draft.item.itemType === option}
                onPress={() => updateItemField('itemType', option)}
                palette={palette}
              />
            ))}
          </View>
        </View>

        <View>
          <FieldLabel>Brand / model</FieldLabel>
          <TextInput
            value={draft.item.brandModel}
            onChangeText={(value) => updateItemField('brandModel', value)}
            placeholder="Coach Willow Tote"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>

        <View>
          <FieldLabel>Color</FieldLabel>
          <TextInput
            value={draft.item.color}
            onChangeText={(value) => updateItemField('color', value)}
            placeholder="Cognac brown"
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.input,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>

        <View>
          <FieldLabel>Service concern</FieldLabel>
          <View style={styles.chipRow}>
            {CONCERNS.map((option) => (
              <ChoiceChip
                key={option}
                label={option}
                selected={draft.item.serviceConcern === option}
                onPress={() => updateItemField('serviceConcern', option)}
                palette={palette}
              />
            ))}
          </View>
        </View>

        <View>
          <FieldLabel>Damage notes</FieldLabel>
          <TextInput
            value={draft.item.damageNotes}
            onChangeText={(value) => updateItemField('damageNotes', value)}
            placeholder="Describe scratches, dryness, loose seams, fading..."
            placeholderTextColor={palette.textSecondary}
            multiline
            style={[
              styles.textArea,
              { backgroundColor: palette.softCard, color: palette.textPrimary },
            ]}
          />
        </View>
      </SectionCard>

      <InfoBanner
        tone="warn"
        text="Next you’ll upload required photos so AI can check clarity, framing, and lighting."
      />

      <PrimaryButton
        label="Next Step"
        icon="arrow-forward"
        disabled={!canContinue}
        onPress={() => router.push('/user-tabs/photo-documentation')}
      />
    </KeyboardAwareScreen>
  );
}

function ChoiceChip({ label, selected, onPress, palette }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: '#DCEBFB', borderColor: '#95BEF0' }
          : {
              backgroundColor: palette.softCard,
              borderColor: palette.textSecondary + '35',
            },
      ]}
    >
      <Text
        style={{
          color: selected ? '#143D76' : palette.textPrimary,
          fontWeight: '600',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
      {selected ? (
        <Ionicons name="checkmark" size={14} color="#143D76" />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 88,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
