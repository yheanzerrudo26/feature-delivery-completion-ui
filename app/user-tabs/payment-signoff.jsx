import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const paymentMethods = [
  {
    title: 'In person',
    description: 'Drop off and pick up your item directly at our location. Pay upon arrival - no delivery fee.',
    icon: 'sparkles-outline',
  },
  {
    title: 'Online payment',
    description: 'We will pick up and deliver your item. Covers delivery cost + selected service fee paid online.',
    icon: 'card-outline',
  },
];

const wallets = ['GCash', 'Maya', 'Bank transfer'];

export default function PaymentSignOffScreen() {
  const { palette } = useAppTheme();
  const {
    draft,
    updatePaymentMethod,
    updatePaymentChannel,
    updateSignature,
    serviceFee,
    pickupFee,
    returnFee,
    total,
    submitDraft,
  } = useUserRequest();

  const handleSubmit = () => {
    const order = submitDraft();
    router.push({ pathname: '/user-tabs/tracker', params: { order } });
  };
  const canSubmit = draft.signature.trim().length > 1;

  const activeBorder = { borderColor: palette.textSecondary + '40' };
  const softBg = { backgroundColor: palette.softCard };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageEyebrow, { color: palette.textSecondary }]}>SECTION 6 - PAYMENT METHOD</Text>

        <View style={styles.header}>
          <Pressable style={[styles.iconButton, { backgroundColor: palette.softCard }]} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={18} color={palette.textPrimary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: palette.textPrimary }]}>Atelier checklist</Text>
            <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Step 6 of 6 - Payment and sign-off</Text>
          </View>
        </View>

        <View style={styles.stepRail}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View key={index} style={[styles.stepLine, index < 5 ? styles.stepLineDone : styles.stepLineCurrent]} />
          ))}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#2E8BFF' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Payment method</Text>
          </View>

          {paymentMethods.map((method) => {
            const isSelected =
              draft.paymentMethod === (method.title === 'Online payment' ? 'online' : 'in-person');
            return (
              <Pressable
                key={method.title}
                style={[
                  styles.paymentCard,
                  isSelected ? styles.paymentCardSelected : { backgroundColor: palette.softCard, borderColor: activeBorder.borderColor },
                ]}
                onPress={() => updatePaymentMethod(method.title === 'Online payment' ? 'online' : 'in-person')}>
                <Ionicons
                  name={method.icon}
                  size={18}
                  color={isSelected ? '#18539F' : '#7F9D4E'}
                  style={styles.paymentIcon}
                />
                <View style={styles.paymentCopy}>
                  <Text style={[styles.paymentTitle, isSelected ? styles.paymentTitleSelected : { color: palette.textPrimary }]}>
                    {method.title}
                  </Text>
                  <Text
                    style={[
                      styles.paymentDescription,
                      isSelected ? styles.paymentDescriptionSelected : { color: palette.textSecondary },
                    ]}>
                    {method.description}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {draft.paymentMethod === 'online' ? (
          <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#2E8BFF' }]} />
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Online payment - order summary</Text>
            </View>

            <SummaryRow label={`Service: ${draft.serviceProtocol}`} value={`P${serviceFee.toLocaleString()}`} palette={palette} />
            <SummaryRow label="Delivery fee (pickup)" value={`P${pickupFee.toLocaleString()}`} palette={palette} />
            <SummaryRow label="Delivery fee (return)" value={`P${returnFee.toLocaleString()}`} palette={palette} />

            <View style={[styles.divider, { backgroundColor: palette.textSecondary + '30' }]} />

            <SummaryRow label="Total" value={`P${total.toLocaleString()}`} emphasized palette={palette} />

            <Text style={[styles.payViaLabel, { color: palette.textSecondary }]}>Pay via</Text>
            <View style={styles.walletRow}>
              {wallets.map((wallet) => (
                <Pressable
                  key={wallet}
                  style={[
                    styles.walletChip,
                    draft.paymentChannel === wallet
                      ? styles.walletChipActive
                      : { backgroundColor: palette.softCard, borderColor: activeBorder.borderColor },
                  ]}
                  onPress={() => updatePaymentChannel(wallet)}>
                  <Text
                    style={[
                      styles.walletChipText,
                      draft.paymentChannel === wallet ? styles.walletChipTextActive : { color: palette.textPrimary },
                    ]}>
                    {wallet}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                A payment link will be sent to your registered email after your request is confirmed by our intake
                officer.
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: '#14A572' }]} />
              <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>In-person settlement</Text>
            </View>
            <Text style={[styles.infoTextDark, { color: palette.textPrimary }]}>
              No pickup or return delivery fees will be added. Your intake officer will collect payment once
              the item is dropped off or ready for release.
            </Text>
            <SummaryRow
              label={`Service: ${draft.serviceProtocol}`}
              value={`P${serviceFee.toLocaleString()}`}
              emphasized
              palette={palette}
            />
          </View>
        )}

        <View style={[styles.sectionCard, { backgroundColor: palette.card, borderColor: palette.softCard }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: '#14A572' }]} />
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>Sign-off</Text>
          </View>

          <Field label="Intake by" value="Assigned after submission" palette={palette} />

          <View style={styles.signatureBlock}>
            <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Your digital signature</Text>
            <View style={[styles.signaturePad, softBg, activeBorder]}>
              <TextInput
                value={draft.signature}
                onChangeText={updateSignature}
                placeholder="Type your full name to sign"
                placeholderTextColor={palette.textSecondary}
                style={[styles.signatureInput, { color: palette.textPrimary }]}
              />
            </View>
          </View>

          <View style={styles.signoffRow}>
            <View>
              <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>Artisan confirmation</Text>
              <Text style={[styles.signoffValue, { color: palette.textPrimary }]}>Date confirmed</Text>
            </View>
            <Text style={styles.pendingBadge}>Pending handshake</Text>
          </View>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '60' },
            !canSubmit ? styles.primaryButtonDisabled : null,
          ]}
          disabled={!canSubmit}
          onPress={handleSubmit}>
          <Text style={[styles.primaryButtonText, { color: palette.textPrimary }]}>Submit restoration request</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, emphasized, palette }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, emphasized ? styles.summaryEmphasis : null, { color: palette.textPrimary }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, emphasized ? styles.summaryValueEmphasis : null]}>{value}</Text>
    </View>
  );
}

function Field({ label, value, palette }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>{label}</Text>
      <View style={[styles.field, { backgroundColor: palette.softCard, borderColor: palette.textSecondary + '40' }]}>
        <Text style={[styles.fieldValue, { color: palette.textPrimary }]}>{value}</Text>
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
  },
  stepLine: {
    width: 18,
    height: 4,
    borderRadius: 999,
  },
  stepLineDone: {
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
  sectionHeader: {
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
  paymentCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    gap: 12,
  },
  paymentCardSelected: {
    backgroundColor: '#DCEBFB',
    borderColor: '#95BEF0',
  },
  paymentIcon: {
    marginTop: 2,
  },
  paymentCopy: {
    flex: 1,
    gap: 5,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  paymentTitleSelected: {
    color: '#16407A',
  },
  paymentDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  paymentDescriptionSelected: {
    color: '#205186',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryLabel: {
    fontSize: 15,
  },
  summaryValue: {
    fontSize: 15,
  },
  summaryEmphasis: {
    fontWeight: '700',
  },
  summaryValueEmphasis: {
    color: '#2E8BFF',
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  payViaLabel: {
    fontSize: 13,
  },
  walletRow: {
    flexDirection: 'row',
    gap: 8,
  },
  walletChip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    fontSize: 14,
    overflow: 'hidden',
  },
  walletChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  walletChipText: {
    fontSize: 14,
  },
  walletChipTextActive: {
    color: '#16407A',
    fontWeight: '700',
  },
  infoBox: {
    borderRadius: 12,
    backgroundColor: '#DCEBFB',
    padding: 12,
  },
  infoText: {
    color: '#16407A',
    fontSize: 13,
    lineHeight: 18,
  },
  infoTextDark: {
    fontSize: 13,
    lineHeight: 20,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
  },
  field: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  fieldValue: {
    fontSize: 15,
  },
  signatureBlock: {
    gap: 6,
  },
  signaturePad: {
    minHeight: 74,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signatureInput: {
    width: '100%',
    fontSize: 15,
    textAlign: 'center',
  },
  signoffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  signoffValue: {
    fontSize: 14,
    marginTop: 4,
  },
  pendingBadge: {
    color: '#205186',
    backgroundColor: '#DCEBFB',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

