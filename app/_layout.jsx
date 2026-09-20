import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AppThemeProvider } from '@/context/app-theme-context';

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="tabs"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="admin-tabs"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="user-tabs"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <StatusBar style="auto" />
    </AppThemeProvider>
  );
}