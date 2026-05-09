import { auth, db } from '@/backend/firebase';
import { useAppTheme } from '@/context/app-theme-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserProfileScreen() {
  const { palette } = useAppTheme();

  const [userData, setUserData] = useState(null);
  const [authEmail, setAuthEmail] = useState('');

  useEffect(() => {
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    if (!user) {
      setUserData(null);
      setAuthEmail('');
      return;
    }
    setAuthEmail(user.email || '');

    const ref = doc(db, 'users', user.uid);

    const unsubscribeDoc = onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();

          setUserData({
            ...data,
            email: data.email || user.email,
          });
        } else {
          setUserData({
            email: user.email,
            firstName: '',
            lastName: '',
            name: user.email,
          });
        }
      },
      (error) => {
        console.log("Firestore error:", error);
      }
    );

    return () => unsubscribeDoc();
  });

  return () => unsubscribeAuth();
}, []);

  const fullName = `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim();
  const displayName = fullName || userData?.name || 'Client';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: palette.textPrimary }]}>Profile</Text>

        <View style={[styles.card, { backgroundColor: palette.card }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.name, { color: palette.textPrimary }]}>
            {displayName}
          </Text>

          <Text style={[styles.email, { color: palette.textSecondary }]}>
            {userData?.email || authEmail || 'Loading...'}
          </Text>

          <Text style={[styles.settingsLabel, { color: palette.textSecondary }]}>
            ACCOUNT SETTINGS
          </Text>

          <Pressable
            style={[styles.settingButton, { backgroundColor: palette.softCard }]}
            onPress={() => router.push('/user-tabs/edit-profile')}
          >
            <Text style={[styles.settingText, { color: palette.textPrimary }]}>
              Edit profile
            </Text>
            <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
          </Pressable>

          <Pressable
            style={[styles.settingButton, { backgroundColor: palette.softCard }]}
            onPress={() => router.push('/user-tabs/settings')}
          >
            <Text style={[styles.settingText, { color: palette.textPrimary }]}>
              Settings
            </Text>
            <Ionicons name="chevron-forward" size={18} color={palette.textSecondary} />
          </Pressable>

          <Pressable
            style={styles.logoutButton}
            onPress={() => router.replace('/tabs/login')}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: {
    padding: 16,
    gap: 10,
  },
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
  settingsLabel: {
    alignSelf: 'flex-start',
    marginTop: 20,
    marginBottom: 8,
    letterSpacing: 2,
    fontSize: 12,
  },
  settingButton: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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

