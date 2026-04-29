import { useAppTheme } from '@/context/app-theme-context';
import { UserRequestProvider } from '@/context/user-request-context';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
            borderTopWidth: 0,
            height: 62 + insets.bottom,
            paddingBottom: Math.max(10, insets.bottom),
            paddingTop: 8,
          },
        }}>
        <Tabs.Screen
          name="user-dashboard"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <Ionicons name="grid" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="atelier-checklist"
          options={{
            title: 'Request',
            tabBarIcon: ({ color }) => <Ionicons name="document-text" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="tracker"
          options={{
            title: 'Track',
            tabBarIcon: ({ color }) => <Ionicons name="time" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
          }}
        />
        <Tabs.Screen name="photo-documentation" options={{ href: null }} />
        <Tabs.Screen name="payment-signoff" options={{ href: null }} />
        <Tabs.Screen name="edit-profile" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
    </UserRequestProvider>
  );
}

