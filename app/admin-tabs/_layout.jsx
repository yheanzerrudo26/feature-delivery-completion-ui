import { useAppTheme } from '@/context/app-theme-context';
import { AdminRequestProvider } from '@/context/admin-request-context';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HIDDEN = [
  'request-review',
  'decline-request',
  'reschedule-pickup',
  'delivery-proof',
  'completion-pickup',
  'completed-service',
  'admin-log-details',
  'admin-return-delivery',
  'settings',
  'edit-profile',
];

export default function AdminTabLayout() {
  const insets = useSafeAreaInsets();
  const { palette } = useAppTheme();

  return (
    <AdminRequestProvider>
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
          name="admin-dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" size={size || 22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-forms"
          options={{
            title: 'Forms',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size || 22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-payment"
          options={{
            title: 'Payments',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="card-outline" size={size || 22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin-view-logs"
          options={{
            title: 'Logs',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="folder-outline" size={size || 22} color={color} />
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
    </AdminRequestProvider>
  );
}
