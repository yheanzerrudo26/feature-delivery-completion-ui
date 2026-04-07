import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/app-theme-context';

export default function EditProfileScreen() {
  const { palette } = useAppTheme();
  const [firstName, setFirstName] = useState('Alex');
  const [lastName, setLastName] = useState('Mabuli');
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: palette.background }]} edges={['top']}>
      <Text style={[styles.title, { color: palette.textPrimary }]}>Edit Profile</Text>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.label, { color: palette.textSecondary }]}>First Name</Text>
        <TextInput style={[styles.input, { backgroundColor: palette.softCard, color: palette.textPrimary }]} value={firstName} onChangeText={setFirstName} />

        <Text style={[styles.label, { color: palette.textSecondary }]}>Last Name</Text>
        <TextInput style={[styles.input, { backgroundColor: palette.softCard, color: palette.textPrimary }]} value={lastName} onChangeText={setLastName} />

        <Text style={[styles.label, { color: palette.textSecondary }]}>Current Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: palette.softCard, color: palette.textPrimary }]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Current password"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={[styles.label, { color: palette.textSecondary }]}>New Password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: palette.softCard, color: palette.textPrimary }]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="New password"
          placeholderTextColor={palette.textSecondary}
        />

        <Pressable style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save changes</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 32, fontWeight: '700' },
  card: { borderRadius: 20, padding: 16 },
  label: { fontSize: 15, marginBottom: 6, marginTop: 8 },
  input: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16 },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#173B70',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
