import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/app-theme-context';

export default function ProfileScreen() {
  const { palette } = useAppTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>A</Text>
        </View>
        <Text style={[styles.name, { color: palette.textPrimary }]}>Alex Mabuli</Text>
        <Text style={[styles.email, { color: palette.textSecondary }]}>alex.mabuli@mail.com</Text>

        <Text style={[styles.settingsLabel, { color: palette.textSecondary }]}>ACCOUNT SETTINGS</Text>

        <Pressable style={[styles.settingButton, { backgroundColor: palette.softCard }]} onPress={() => router.push('/(admin-tabs)/edit-profile')}>
          <Text style={[styles.settingText, { color: palette.textPrimary }]}>Edit profile</Text>
        </Pressable>
        <View style={[styles.settingButton, { backgroundColor: palette.softCard }]}>
          <Text style={[styles.settingText, { color: palette.textPrimary }]}>Manage users</Text>
        </View>
        <Pressable style={[styles.settingButton, { backgroundColor: palette.softCard }]} onPress={() => router.push('/(admin-tabs)/admin-view-logs')}>
          <Text style={[styles.settingText, { color: palette.textPrimary }]}>View logs</Text>
        </Pressable>
        <Pressable style={[styles.settingButton, { backgroundColor: palette.softCard }]} onPress={() => router.push('/(admin-tabs)/settings')}>
          <Text style={[styles.settingText, { color: palette.textPrimary }]}>Settings</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={() => router.replace('/login')}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 10 },
  title: { fontSize: 36, fontWeight: '700' },
  card: {
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#173B70',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: '700' },
  name: { fontSize: 36, fontWeight: '700' },
  email: { fontSize: 22, marginTop: 4 },
  settingsLabel: { alignSelf: 'flex-start', marginTop: 20, marginBottom: 8, letterSpacing: 2 },
  settingButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  settingText: { fontSize: 27, fontWeight: '600' },
  logoutButton: {
    width: '100%',
    backgroundColor: '#D42A2A',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  logoutText: { color: '#fff', fontSize: 24, fontWeight: '700' },
});
