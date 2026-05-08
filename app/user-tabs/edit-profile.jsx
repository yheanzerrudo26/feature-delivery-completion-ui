import { addLog } from "@/backend/services/log.service";
import { auth, db } from "@/backend/firebase";
import { useAppTheme } from "@/context/app-theme-context";
import { router } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword, } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

      await addLog("profileUpdate", "User updated profile");

      alert("Profile updated successfully!");
      router.back();
    } catch (error) {
      console.log(error);
      alert(error.message || "Failed to update profile");
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: palette.background }]}
      edges={["top"]}
    >
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
        />

        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save changes</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 32, fontWeight: "700" },
  card: { borderRadius: 20, padding: 16 },
  label: { fontSize: 15, marginBottom: 6, marginTop: 8 },
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
