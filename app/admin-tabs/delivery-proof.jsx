import {
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useAdminRequest } from '@/context/admin-request-context';
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

export default function DeliveryProofScreen() {
  const { palette } = useAppTheme();
  const { id } = useLocalSearchParams();
  const { requests, confirmItemReceived, rejectDelivery, setSelectedId } =
    useAdminRequest();
  const request =
    requests.find((item) => item.id === id) ||
    requests.find(
      (item) =>
        item.stage === 'awaiting_delivery' ||
        item.stage === 'delivery_resubmit',
    ) ||
    requests[0];

  const [notReceivedModalVisible, setNotReceivedModalVisible] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const delivery = request?.delivery || {};
  const proofUri = delivery.proofUri || delivery.receiptUri;
  const sharedLink = delivery.sharedLink;
  const isResubmit = request?.stage === 'delivery_resubmit';

  const isPaid = request?.paymentStatus === 'Paid';
  const hasProof = Boolean(proofUri);
  const hasLink = Boolean(
    sharedLink &&
      sharedLink.trim() &&
      !sharedLink.includes('(not provided)'),
  );
  const isSummaryComplete = isPaid && hasProof && hasLink;

  const canClickNotReceived = isSummaryComplete && !isResubmit && !submitting;
  const canClickReceived = isSummaryComplete && !isResubmit && !submitting;

  const handleReceived = async () => {
    if (!request?.id || submitting) return;
    setSubmitting(true);
    try {
      await confirmItemReceived(request.id);
      setSelectedId(request.id);
      router.replace({
        pathname: '/admin-tabs/completion-pickup',
        params: { id: request.id },
      });
    } catch (err) {
      console.error('Failed to confirm item received:', err);
      Alert.alert('Error', err.message || 'Failed to confirm item received.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNotReceived = async () => {
    if (!request?.id || submitting) return;
    setSubmitting(true);
    try {
      await rejectDelivery(
        request.id,
        adminNote.trim() || 'Item not received. Please resubmit proof.',
      );
      setSelectedId(request.id);
      setNotReceivedModalVisible(false);
      Alert.alert(
        'Client notified',
        'The client has been prompted to resubmit their delivery proof.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/admin-tabs/admin-forms'),
          },
        ],
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to notify client.');
    } finally {
      setSubmitting(false);
    }
  };

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
        <Text style={{ color: palette.textSecondary }}>No request found.</Text>
        <PrimaryButton
          label="Go to Dashboard"
          style={{ marginTop: 16 }}
          onPress={() => router.replace('/admin-tabs/admin-dashboard')}
        />
      </SafeAreaView>
    );
  }

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
          title="Delivery Proof Review"
          subtitle="Review the client's proof picture and shared link, then confirm receipt."
          rightLabel={request.id}
          onBack={() => router.replace('/admin-tabs/admin-forms')}
        />

        <View style={styles.badgeRow}>
          <Text
            style={[
              styles.stagePill,
              isResubmit
                ? { backgroundColor: '#FDECEC', color: '#B42318' }
                : { backgroundColor: '#FFE6B8', color: '#8A5A06' },
            ]}
          >
            {isResubmit ? 'Awaiting resubmission' : 'In transit'}
          </Text>
        </View>

        {isResubmit && (
          <InfoBanner
            tone="danger"
            text={`Item was previously marked as not received. Client has been asked to resubmit proof. Admin note: "${request.adminDeliveryNote || 'Item not received.'}"`}
          />
        )}

        {/* ── Proof picture ── */}
        <SectionCard>
          <View style={styles.receiptHeader}>
            <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
              Client delivery proof
            </Text>
            <Text
              style={[
                styles.pillLabel,
                proofUri
                  ? { backgroundColor: '#DDF9EC', color: '#157651' }
                  : { backgroundColor: '#FFE6B8', color: '#8A5A06' },
              ]}
            >
              {proofUri ? 'Photo attached' : 'No photo'}
            </Text>
          </View>

          {proofUri ? (
            <View style={styles.proofContainer}>
              <Image
                source={{ uri: proofUri }}
                style={styles.proofImage}
                contentFit="cover"
              />
            </View>
          ) : (
            <View
              style={[styles.emptyProof, { backgroundColor: palette.softCard }]}
            >
              <Ionicons
                name="image-outline"
                size={40}
                color={palette.textSecondary}
              />
              <Text style={{ color: palette.textSecondary, marginTop: 6 }}>
                No proof picture submitted yet
              </Text>
            </View>
          )}

          {/* ── Shared link ── */}
          <View style={{ marginTop: 14 }}>
            <Text
              style={{
                color: palette.textSecondary,
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              Shared link of the item
            </Text>
            <View
              style={[styles.linkBox, { backgroundColor: palette.softCard }]}
            >
              <Ionicons name="link-outline" size={18} color={palette.accent} />
              <Text
                style={{
                  color: sharedLink ? palette.textPrimary : palette.textSecondary,
                  fontWeight: sharedLink ? '600' : '400',
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {sharedLink || 'https://example.com  (not provided)'}
              </Text>
            </View>
          </View>

          {delivery.resubmitComment ? (
            <View style={{ marginTop: 14 }}>
              <Text
                style={{
                  color: palette.textSecondary,
                  fontSize: 13,
                  marginBottom: 6,
                }}
              >
                Client comment on resubmission
              </Text>
              <View
                style={[
                  styles.linkBox,
                  { backgroundColor: palette.softCard, paddingVertical: 10 },
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={18}
                  color={palette.accent}
                />
                <Text
                  style={{
                    color: palette.textPrimary,
                    flex: 1,
                    fontSize: 14,
                    lineHeight: 20,
                  }}
                >
                  {delivery.resubmitComment}
                </Text>
              </View>
            </View>
          ) : null}
        </SectionCard>

        {/* ── Payment summary ── */}
        <SectionCard>
          <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
            Payment & delivery summary
          </Text>
          <Row
            label="Payment"
            value={request.paymentStatus || 'Unpaid'}
            tone={isPaid ? 'mint' : 'amber'}
            palette={palette}
          />
          <Row
            label="Proof picture"
            value={hasProof ? 'Uploaded' : 'Pending'}
            tone={hasProof ? 'mint' : 'amber'}
            palette={palette}
          />
          <Row
            label="Item link"
            value={hasLink ? 'Provided' : 'Pending'}
            tone={hasLink ? 'mint' : 'amber'}
            palette={palette}
          />
        </SectionCard>

        {!isSummaryComplete ? (
          <InfoBanner
            tone="warn"
            text="Action buttons are disabled until the client completes payment, uploads a proof picture, and provides the item shared link."
          />
        ) : (
          <InfoBanner
            tone="info"
            text="Only confirm receipt once you have physically verified the item matches the submitted proof picture."
          />
        )}

        {/* ── Action buttons ── */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[
              styles.actionBtn,
              canClickNotReceived ? styles.notReceivedBtn : styles.actionBtnDisabled,
            ]}
            onPress={() => {
              if (!canClickNotReceived) return;
              setAdminNote('');
              setNotReceivedModalVisible(true);
            }}
            disabled={!canClickNotReceived}
            activeOpacity={0.85}
          >
            <Ionicons
              name={
                !isSummaryComplete
                  ? 'lock-closed-outline'
                  : isResubmit
                    ? 'close-circle'
                    : 'close-circle-outline'
              }
              size={20}
              color={canClickNotReceived ? '#fff' : '#667085'}
            />
            <Text
              style={[
                styles.actionBtnText,
                !canClickNotReceived && styles.actionBtnTextDisabled,
              ]}
            >
              {!isSummaryComplete
                ? 'Not Received'
                : isResubmit
                  ? 'Marked Not Received'
                  : 'Not Received'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionBtn,
              canClickReceived ? styles.receivedBtn : styles.receivedBtnDisabled,
              submitting && { opacity: 0.6 },
            ]}
            onPress={handleReceived}
            disabled={!canClickReceived}
            activeOpacity={0.85}
          >
            <Ionicons
              name={
                !isSummaryComplete
                  ? 'lock-closed-outline'
                  : isResubmit
                    ? 'hourglass-outline'
                    : 'checkmark-circle-outline'
              }
              size={20}
              color={canClickReceived ? '#fff' : '#667085'}
            />
            <Text
              style={[
                styles.actionBtnText,
                !canClickReceived && styles.actionBtnTextDisabled,
              ]}
            >
              {!isSummaryComplete
                ? 'Received'
                : isResubmit
                  ? 'Awaiting Resubmission'
                  : submitting
                    ? 'Confirming…'
                    : 'Received'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ── Not-received modal ── */}
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
            style={[
              styles.modalSheet,
              { backgroundColor: palette.card },
            ]}
            onPress={() => {}}
          >
            {/* Handle bar */}
            <View
              style={[
                styles.handleBar,
                { backgroundColor: palette.textSecondary + '40' },
              ]}
            />

            <View style={styles.modalIconRow}>
              <View style={styles.modalIconWrap}>
                <Ionicons name="alert-circle" size={32} color="#B42318" />
              </View>
            </View>

            <Text
              style={[styles.modalTitle, { color: palette.textPrimary }]}
            >
              Item Not Received
            </Text>
            <Text
              style={[styles.modalSubtitle, { color: palette.textSecondary }]}
            >
              The client will be notified and prompted to resubmit their
              delivery proof picture and shared link.
            </Text>

            <Text
              style={[styles.noteLabel, { color: palette.textSecondary }]}
            >
              Reason / note for the client (optional)
            </Text>
            <TextInput
              value={adminNote}
              onChangeText={setAdminNote}
              placeholder="e.g. Package not delivered to workshop address."
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
                style={[
                  styles.modalBtn,
                  { backgroundColor: palette.softCard },
                ]}
                onPress={() => setNotReceivedModalVisible(false)}
              >
                <Text
                  style={{ color: palette.textPrimary, fontWeight: '700' }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.notReceivedBtn]}
                onPress={handleNotReceived}
                disabled={submitting}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>
                  {submitting ? 'Sending…' : 'Notify Client'}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function Row({ label, value, palette, tone }) {
  const toneMap = {
    mint: { bg: '#DDF9EC', color: '#157651' },
    amber: { bg: '#FFE6B8', color: '#8A5A06' },
    blue: { bg: '#D8E8FF', color: '#215AA8' },
  };
  const t = toneMap[tone];
  return (
    <View style={styles.row}>
      <Text style={{ color: palette.textSecondary, width: 110 }}>{label}</Text>
      {t ? (
        <Text
          style={[
            styles.pill,
            { backgroundColor: t.bg, color: t.color },
          ]}
        >
          {value}
        </Text>
      ) : (
        <Text
          style={{ color: palette.textPrimary, fontWeight: '600', flex: 1 }}
        >
          {value}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 40 },
  badgeRow: { flexDirection: 'row' },
  stagePill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillLabel: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  proofContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    height: 220,
    backgroundColor: '#00000010',
  },
  proofImage: { width: '100%', height: '100%' },
  emptyProof: {
    borderRadius: 14,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 2,
  },
  pill: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: '700',
  },
  // ── Action buttons ──
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  notReceivedBtn: { backgroundColor: '#B42318' },
  receivedBtn: { backgroundColor: '#157651' },
  receivedBtnDisabled: {
    backgroundColor: '#EAECF0',
    borderWidth: 1,
    borderColor: '#D0D5DD',
  },
  actionBtnDisabled: {
    backgroundColor: '#F2F4F7',
    borderWidth: 1,
    borderColor: '#E4E7EC',
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  actionBtnTextDisabled: {
    color: '#667085',
  },
  // ── Modal ──
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
    gap: 12,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  noteLabel: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  noteInput: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    paddingBottom: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});