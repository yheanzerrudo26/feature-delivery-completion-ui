import { useAppTheme } from '@/context/app-theme-context';
import { UserRequestProvider } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HIDDEN = [
  'tracker',
  'services',
  'service-details',
  'photo-documentation',
  'ai-assessment',
  'assessment-report',
  'request-submitted',
  'request-declined',
  'request-accepted',
  'payment-directions',
  'gcash-payment',
  'delivery-confirmation',
  'delivery-resubmit',
  'ready-for-pickup',
  'return-delivery',
  'final-feedback',
  'payment-signoff',
  'edit-profile',
  'settings',
];

export default function UserTabLayout() {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  return (
    <UserRequestProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: palette.accent,
          tabBarInactiveTintColor: palette.textSecondary,
          tabBarStyle: {
            backgroundColor: palette.card,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: palette.softCard,
            height: 64 + insets.bottom,
            paddingBottom: Math.max(10, insets.bottom),
            paddingTop: 8,
            elevation: 0,
            shadowOpacity: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="user-dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size || 22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="atelier-checklist"
          options={{
            title: 'Services',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="receipt-outline" size={size || 22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="chatbot"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubble-ellipses-outline" size={size || 22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size || 22} color={color} />
            ),
          }}
        />

        {HIDDEN.map((name) => (
          <Tabs.Screen key={name} name={name} options={{ href: null }} />
        ))}
      </Tabs>
    </UserRequestProvider>
  );
}
