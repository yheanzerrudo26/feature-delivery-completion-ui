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

          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}
      >

        {/* HOME */}
        <Tabs.Screen
          name="user-dashboard"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="grid"
                size={size || 22}
                color={color}
              />
            ),
          }}
        />

        {/* REQUEST */}
        <Tabs.Screen
          name="atelier-checklist"
          options={{
            title: 'Request',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="document-text"
                size={size || 22}
                color={color}
              />
            ),
          }}
        />

        {/* TRACK */}
        <Tabs.Screen
          name="tracker"
          options={{
            title: 'Track',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="time"
                size={size || 22}
                color={color}
              />
            ),
          }}
        />

        {/* PROFILE */}
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="person"
                size={size || 22}
                color={color}
              />
            ),
          }}
        />

        {/* CHATBOT */}
        <Tabs.Screen
          name="chatbot"
          options={{
            title: 'Chatbot',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="chatbubbles"
                size={size || 22}
                color={color}
              />
            ),
          }}
        />

        {/* SERVICES */}
        <Tabs.Screen
          name="services"
          options={{
            title: 'Services',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="briefcase"
                size={size || 22}
                color={color}
              />
            ),
          }}
        />

        {/* SERVICE DETAILS */}
        <Tabs.Screen
          name="service-details"
          options={{
            title: 'Service Details',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name="information-circle"
                size={size || 22}
                color={color}
              />
            ),
          }}
        />

        {/* HIDDEN ROUTES */}
        <Tabs.Screen
          name="photo-documentation"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="payment-signoff"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="edit-profile"
          options={{
            href: null,
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            href: null,
          }}
        />

      </Tabs>
    </UserRequestProvider>
  );
}
