import KeyboardAwareScreen from "@/components/KeyboardAwareScreen";
import { useAppTheme } from "@/context/app-theme-context";
import { router } from "expo-router";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { auth, db } from "../../lib/firebase.js";
import { API_URL } from "../../lib/config";

export default function EditProfileScreen() {
  const { palette } = useAppTheme();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setEmail(user.email || "");

    const ref = doc(db, "users", user.uid);

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setFirstName(data.firstName || "");
        setLastName(data.lastName || "");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const isEmailChanged = email !== user.email;
      const isPasswordChanged = password.length >= 6;

      if (isEmailChanged || isPasswordChanged) {
        if (!currentPassword) {
          alert("Enter current password to change email or password");
          return;
        }

        const credential = EmailAuthProvider.credential(
          user.email,
          currentPassword,
        );

        await reauthenticateWithCredential(user, credential);
      }

      if (isEmailChanged) {
        await updateEmail(user, email);
        await user.reload();
      }

      if (isPasswordChanged) {
        await updatePassword(user, password);
      }

      await setDoc(
        doc(db, "users", user.uid),
        {
          firstName,
          lastName,
          email,
          updatedAt: Date.now(),
        },
        { merge: true },
      );

      await fetch(`${API_URL}/api/logs/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          action: "PROFILE UPDATE",
          message: "User updated profile",
        }),
      });

      Alert.alert("", "Profile updated successfully!");
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert("", error.message || "Failed to update profile");
    }
  };

  return (
    <KeyboardAwareScreen
      style={{ backgroundColor: palette.background }}
      contentContainerStyle={styles.container}
      bottomPadding={140}
    >
      <Pressable
        onPress={() => router.back()}
        style={[styles.backButton, { backgroundColor: palette.softCard }]}
      >
        <Text style={[styles.backText, { color: palette.textPrimary }]}>Back</Text>
      </Pressable>

      <Text style={[styles.title, { color: palette.textPrimary }]}>
        Edit Profile
      </Text>

      <View style={[styles.card, { backgroundColor: palette.card }]}>
        <Text style={[styles.label, { color: palette.textSecondary }]}>
          First Name
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={[styles.label, { color: palette.textSecondary }]}>
          Last Name
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={[styles.label, { color: palette.textSecondary }]}>
          Email
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="Email"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={[styles.label, { color: palette.textSecondary }]}>
          Current Password
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Required to change email or password"
          placeholderTextColor={palette.textSecondary}
        />

        <Text style={[styles.label, { color: palette.textSecondary }]}>
          New Password
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: palette.softCard, color: palette.textPrimary },
          ]}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Leave blank to keep current password"
          placeholderTextColor={palette.textSecondary}
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save changes</Text>
        </Pressable>
      </View>
    </KeyboardAwareScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  backButton: {
    alignSelf: "flex-start",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: "600",
  },
  title: { fontSize: 28, fontWeight: "700" },
  card: { borderRadius: 20, padding: 16 },
  label: { fontSize: 14, marginBottom: 6, marginTop: 8 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: "#173B70",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
