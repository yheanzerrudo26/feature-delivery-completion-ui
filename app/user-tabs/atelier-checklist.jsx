import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const leatherBlocks = [
  {
    title: 'Vamp creasing',
    dot: '#2E8BFF',
    options: ['Light', 'Deep', 'Dry / cracking'],
  },
  {
    title: 'Surface damage',
    dot: '#F7B541',
    options: ['Scuffs', 'Gouges', 'Waterstains'],
  },
  {
    title: 'Color health',
    dot: '#86C443',
    options: ['Faded', 'Uneven', 'Salt staining'],
  },
  {
    title: 'Biological status',
    dot: '#D65353',
    options: ['Active mold', 'Mold residue', 'Odor'],
  },
];

const serviceProtocols = [
  { title: 'Essential endurance', price: 'P800' },
  { title: 'The Foundation', price: 'P1,800' },
  { title: 'The Heritage Glass', price: 'P3,500', selected: true },
  { title: 'The Resurrection Protocol', price: 'Quote required', note: 'Custom quote amount' },
];

const stepLabels = ['General', 'Leather', 'Sole', 'Service', 'Photo', 'Payment'];

export default function AtelierChecklistScreen() {
  const {
    draft,
    updateGeneralField,
    toggleAssessmentOption,
    toggleArrayOption,
    updateSoleEdgeField,
    updateServiceProtocol,
    updateCustomQuote,
  } = useUserRequest();
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageEyebrow, { color: palette.textSecondary }]}>DIGITAL ATELIER CHECKLIST</Text>

        <View style={styles.header}>
          <Pressable style={[styles.iconButton, { backgroundColor: palette.softCard }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: palette.textPrimary }]}>Atelier checklist</Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Steps 1 to 4 of 6 - Intake and service setup</Text>
          </View>
        </View>

        <View style={styles.stepRail}>
          {stepLabels.map((label, index) => (
            <View key={label} style={styles.stepItem}>
              <View
                style={[
                  styles.stepLine,
                  index < 4 ? styles.stepLineActive : null,
                  index === 3 ? styles.stepLineCurrent : null,
                ]}
              />
            </View>
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#2E8BFF' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>General information</Text>
          </View>

          <Field
            label="Date of intake"
            value={draft.general.intakeDate}
            palette={palette}
            onChangeText={(value) => updateGeneralField('intakeDate', value)}
          />
          <Field
            label="Brand / Model"
            value={draft.general.brandModel}
            placeholder="e.g. Chanel Classic Flap"
            palette={palette}
            onChangeText={(value) => updateGeneralField('brandModel', value)}
          />
          <Field
            label="Color"
            value={draft.general.color}
            placeholder="e.g. Black"
            palette={palette}
            onChangeText={(value) => updateGeneralField('color', value)}
          />
          <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Item type</Text>
          <View style={styles.chipRow}>
            {['Bag', 'Shoes', 'Wallet', 'Accessory'].map((option) => (
              <Pressable
                key={option}
                style={[
                  styles.choiceChip,
                  draft.general.itemType === option
                    ? { backgroundColor: '#DCEBFB', borderColor: '#95BEF0' }
                    : { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '40' },
                ]}
                onPress={() => updateGeneralField('itemType', option)}>
                <Text
                  style={[
                    styles.choiceChipText,
                    draft.general.itemType === option ? { color: '#143D76' } : { color: palette.textPrimary },
                  ]}>
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {leatherBlocks.map((block) => (
          <View key={block.title} style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.sectionDot, { backgroundColor: block.dot }]} />
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>{block.title}</Text>
            </View>

            <View style={[styles.optionList, { backgroundColor: palette.softCard }]}>
              {block.options.map((option) => {
                const selected = draft.leatherAssessment[block.title]?.includes(option);
                return (
                  <Pressable key={option} style={styles.optionRow} onPress={() => toggleAssessmentOption(block.title, option)}>
                    <View style={[styles.checkbox, selected ? styles.checkboxSelected : null]} />
                    <Text style={[styles.optionText, { color: palette.textPrimary }]}>{option}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#9A9A9A' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Edge dressing</Text>
          </View>

          <View style={[styles.optionList, { backgroundColor: palette.softCard }]}>
            {['Faded', 'Scuffed', 'Chipped'].map((option) => (
              <Pressable key={option} style={styles.optionRow} onPress={() => toggleArrayOption('edgeDressing', option)}>
                <View
                  style={[
                    styles.checkbox,
                    draft.soleEdge.edgeDressing.includes(option) ? styles.checkboxSelected : null,
                  ]}
                />
                <Text style={[styles.optionText, { color: palette.textPrimary }]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#9A9A9A' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Sole condition</Text>
          </View>

          <View style={[styles.optionList, { backgroundColor: palette.softCard }]}>
            {['Worn', 'Hole', 'Separation'].map((option) => (
              <Pressable key={option} style={styles.optionRow} onPress={() => toggleArrayOption('soleCondition', option)}>
                <View
                  style={[
                    styles.checkbox,
                    draft.soleEdge.soleCondition.includes(option) ? styles.checkboxSelected : null,
                  ]}
                />
                <Text style={[styles.optionText, { color: palette.textPrimary }]}>{option}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#2E8BFF' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Notes on pre-existing damage</Text>
          </View>

          <TextInput
            multiline
            placeholder="Add any additional damage notes here..."
            placeholderTextColor={palette.textSecondary}
            style={[
              styles.textArea,
              {
                backgroundColor: palette.softCard,
                borderColor: palette.textSecondary + '40',
                color: palette.textPrimary,
              },
            ]}
            value={draft.soleEdge.damageNotes}
            onChangeText={(value) => updateSoleEdgeField('damageNotes', value)}
          />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.sectionTitleRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#2E8BFF' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Select service protocol</Text>
          </View>

          <View style={styles.protocolList}>
            {serviceProtocols.map((protocol) => (
              <Pressable
                key={protocol.title}
                style={[
                  styles.protocolCard,
                  draft.serviceProtocol === protocol.title ? styles.protocolCardSelected : null,
                ]}
                onPress={() => updateServiceProtocol(protocol.title)}>
                <View style={styles.protocolHeader}>
                  <View style={[styles.radio, draft.serviceProtocol === protocol.title ? styles.radioSelected : null]} />
                  <View style={styles.protocolText}>
                    <Text
                      style={[
                        styles.protocolTitle,
                        draft.serviceProtocol === protocol.title ? styles.protocolTitleSelected : null,
                      ]}>
                      {protocol.title}
                    </Text>
                    <Text
                      style={[
                        styles.protocolPrice,
                        draft.serviceProtocol === protocol.title ? styles.protocolTitleSelected : null,
                      ]}>
                      {protocol.price}
                    </Text>
                  </View>
                </View>

                {protocol.note && draft.serviceProtocol === protocol.title ? (
                  <View style={styles.quoteBox}>
                    <Text style={[styles.quoteLabel, { color: palette.textSecondary }]}>{protocol.note}</Text>
                    <TextInput
                      value={draft.customQuote}
                      onChangeText={updateCustomQuote}
                      keyboardType="numeric"
                      placeholder="Enter quote amount"
                      placeholderTextColor={palette.textSecondary}
                      style={[
                        styles.quoteInput,
                        {
                          backgroundColor: palette.softCard,
                          borderColor: palette.textSecondary + '40',
                          color: palette.textPrimary,
                        },
                      ]}
                    />
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '60' }]}
          onPress={() => router.push('/user-tabs/photo-documentation')}>
          <Text style={[styles.primaryButtonText, { color: palette.textPrimary }]}>Continue to photo documentation</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.textPrimary} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, placeholder, palette, onChangeText }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>{label}</Text>
      <View style={[styles.field, { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '40' }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textSecondary}
          style={[styles.fieldInput, { color: palette.textPrimary }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 28,
    gap: 12,
  },
  pageEyebrow: {
    textAlign: 'center',
    letterSpacing: 2,
    fontSize: 11,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
  },
  stepRail: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  stepItem: {
    width: 16,
  },
  stepLine: {
    height: 4,
    borderRadius: 999,
    backgroundColor: '#555149',
  },
  stepLineActive: {
    backgroundColor: '#14A572',
  },
  stepLineCurrent: {
    backgroundColor: '#2E8BFF',
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
  },
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  choiceChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  choiceChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionList: {
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#868077',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    backgroundColor: '#89BDFF',
    borderColor: '#89BDFF',
  },
  optionText: {
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    textAlignVertical: 'top',
  },
  protocolList: {
    gap: 10,
  },
  protocolCard: {
    borderWidth: 1,
    borderColor: '#5D5951',
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#2F2D29',
    gap: 10,
  },
  protocolCardSelected: {
    backgroundColor: '#DCEBFB',
    borderColor: '#95BEF0',
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#8A847B',
    marginTop: 2,
  },
  radioSelected: {
    borderColor: '#2E8BFF',
    backgroundColor: '#2E8BFF',
  },
  protocolText: {
    gap: 3,
    flex: 1,
  },
  protocolTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  protocolTitleSelected: {
    color: '#143D76',
  },
  protocolPrice: {
    color: '#D7CFC4',
    fontSize: 13,
  },
  quoteBox: {
    paddingLeft: 28,
    gap: 6,
  },
  quoteLabel: {
    fontSize: 13,
  },
  quoteInput: {
    minHeight: 42,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  primaryButton: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

