import {
  InfoBanner,
  PrimaryButton,
  RequestScreenHeader,
  SectionCard,
} from '@/components/RequestUI';
import { useAppTheme } from '@/context/app-theme-context';
import { useUserRequest } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RequestDeclinedScreen() {
  const { palette } = useAppTheme();
  const { order } = useLocalSearchParams();
  const { requests } = useUserRequest();
  const request =
    requests.find((item) => item.order === order) || requests[0];

  const reason =
    request.declineReason ||
    'The damage-detail photo does not show the full loose seam. Please recapture a closer shot of the affected area and resubmit.';

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={['top']}
    >
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <RequestScreenHeader
          title="Request Declined"
          subtitle="Review the artisan reason, then edit and resubmit."
        />

        <View style={styles.hero}>
          <View style={styles.icon}>
            <Ionicons name="close" size={32} color="#B42318" />
          </View>
          <Text style={[styles.heroTitle, { color: palette.textPrimary }]}>
            Request could not proceed
          </Text>
        </View>

        <SectionCard>
          <Text style={[styles.requestId, { color: palette.textPrimary }]}>
            Request {request.order}
          </Text>
          <Text style={{ color: palette.textSecondary }}>{request.item}</Text>
          <Text style={{ color: palette.textSecondary, marginTop: 4 }}>
            {request.serviceProtocol}
          </Text>
        </SectionCard>

        <InfoBanner tone="danger" text={`Admin / Artisan reason: ${reason}`} />

        <InfoBanner
          tone="warn"
          text="How to resubmit: fix the photos or details mentioned above, then send a new service request from Services."
        />

        <PrimaryButton
          label="Edit & Resubmit Request"
          onPress={() => router.push('/user-tabs/atelier-checklist')}
        />
        <PrimaryButton
          label="Contact Support in Chat"
          variant="secondary"
          icon="chatbubbles-outline"
          onPress={() => router.push('/user-tabs/chatbot')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { padding: 16, gap: 14, paddingBottom: 32 },
  hero: { alignItems: 'center', gap: 10, paddingVertical: 8 },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { fontSize: 20, fontWeight: '700' },
  requestId: { fontSize: 18, fontWeight: '700' },
});
