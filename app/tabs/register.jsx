import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View, } from "react-native";
import { registerUser } from "../../lib/auth.service";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showRequiredError, setShowRequiredError] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showMismatchModal, setShowMismatchModal] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const disabled = useMemo(() => {
    return false;
  }, []);

  const passwordRequirements = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const isPasswordValid =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.symbol;

  const onRegister = async () => {
    const hasEmptyField =
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim();

    if (hasEmptyField) {
      setShowRequiredError(true);
      return;
    }

    if (!isPasswordValid) {
      setShowPasswordModal(true);
      return;
    }

    if (password !== confirmPassword) {
      setShowMismatchModal(true);
      return;
    }

    try {
      await registerUser(
        email.trim(),
        password,
        firstName,
        lastName
      );

      setShowSuccessModal(true);
    } catch (error) {
      let message = "Something went wrong";

      switch (error.code) {
        case "auth/email-already-in-use":
          setShowEmailExistsModal(true);
          return;

        case "auth/invalid-email":
          message = "The email address is not valid.";
          break;

        case "auth/weak-password":
          message =
            "Password should be at least 8 characters and meet all password requirements.";
          break;

        case "auth/network-request-failed":
          message =
            "Network error. Please check your internet connection.";
          break;

        default:
          message = error.message;
      }

      alert(message);
    }
  };

  return (
    <View style={styles.container}>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Password Requirements
            </Text>

            <Text style={styles.modalSubtitle}>
              Your password must meet all of the following requirements:
            </Text>

            <View style={styles.requirementRow}>
              <Text
                style={[
                  styles.requirementIcon,
                  passwordRequirements.minLength
                    ? styles.valid
                    : styles.invalid,
                ]}
              >
                {passwordRequirements.minLength ? "✓" : "✗"}
              </Text>

              <Text
                style={[
                  styles.requirementText,
                  passwordRequirements.minLength && styles.validText,
                ]}
              >
                At least 8 characters
              </Text>
            </View>

            <View style={styles.requirementRow}>
              <Text
                style={[
                  styles.requirementIcon,
                  passwordRequirements.uppercase
                    ? styles.valid
                    : styles.invalid,
                ]}
              >
                {passwordRequirements.uppercase ? "✓" : "✗"}
              </Text>

              <Text
                style={[
                  styles.requirementText,
                  passwordRequirements.uppercase && styles.validText,
                ]}
              >
                At least 1 uppercase letter (A-Z)
              </Text>
            </View>

            <View style={styles.requirementRow}>
              <Text
                style={[
                  styles.requirementIcon,
                  passwordRequirements.lowercase
                    ? styles.valid
                    : styles.invalid,
                ]}
              >
                {passwordRequirements.lowercase ? "✓" : "✗"}
              </Text>

              <Text
                style={[
                  styles.requirementText,
                  passwordRequirements.lowercase && styles.validText,
                ]}
              >
                At least 1 lowercase letter (a-z)
              </Text>
            </View>

            <View style={styles.requirementRow}>
              <Text
                style={[
                  styles.requirementIcon,
                  passwordRequirements.number
                    ? styles.valid
                    : styles.invalid,
                ]}
              >
                {passwordRequirements.number ? "✓" : "✗"}
              </Text>

              <Text
                style={[
                  styles.requirementText,
                  passwordRequirements.number && styles.validText,
                ]}
              >
                At least 1 number (0-9)
              </Text>
            </View>

            <View style={styles.requirementRow}>
              <Text
                style={[
                  styles.requirementIcon,
                  passwordRequirements.symbol
                    ? styles.valid
                    : styles.invalid,
                ]}
              >
                {passwordRequirements.symbol ? "✓" : "✗"}
              </Text>

              <Text
                style={[
                  styles.requirementText,
                  passwordRequirements.symbol && styles.validText,
                ]}
              >
                At least 1 symbol (!@#$%^&*, etc.)
              </Text>
            </View>

            <Pressable
              style={styles.modalButton}
              onPress={() => setShowPasswordModal(false)}
            >
              <Text style={styles.modalButtonText}>
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showMismatchModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMismatchModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Passwords Do Not Match
            </Text>

            <Text style={styles.mismatchMessage}>
              Your passwords are different. Please check both fields and try again.
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={() => setShowMismatchModal(false)}
            >
              <Text style={styles.modalButtonText}>
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showEmailExistsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmailExistsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Email Already Registered
            </Text>

            <Text style={styles.mismatchMessage}>
              This email is already registered. Try logging in instead.
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setShowEmailExistsModal(false);
                router.replace("/tabs/login");
              }}
            >
              <Text style={styles.modalButtonText}>
                Go to Login
              </Text>
            </Pressable>

            <Pressable
              style={styles.modalSecondaryButton}
              onPress={() => setShowEmailExistsModal(false)}
            >
              <Text style={styles.modalSecondaryButtonText}>
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Account Created Successfully!
            </Text>

            <Text style={styles.mismatchMessage}>
              Your account has been created successfully. You can now log in to your account.
            </Text>

            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setShowSuccessModal(false);
                router.replace("/tabs/login");
              }}
            >
              <Text style={styles.modalButtonText}>
                Go to Login
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <View style={styles.card}>
        <Text style={styles.badge}>
          Register
        </Text>

        <Text style={styles.title}>
          Create your account
        </Text>

        <Text style={styles.subtitle}>
          Join the Mabuli Leather Works portal for artisans and clients.
        </Text>

        <Text style={styles.label}>
          First Name
        </Text>

        <TextInput
          style={[
            styles.input,
            showRequiredError &&
              !firstName.trim() &&
              styles.inputError,
          ]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Name"
        />

        {showRequiredError && !firstName.trim() ? (
          <Text style={styles.requiredError}>
            Required field
          </Text>
        ) : null}

        <Text style={styles.label}>
          Last Name
        </Text>

        <TextInput
          style={[
            styles.input,
            showRequiredError &&
              !lastName.trim() &&
              styles.inputError,
          ]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />

        {showRequiredError && !lastName.trim() ? (
          <Text style={styles.requiredError}>
            Required field
          </Text>
        ) : null}

        <Text style={styles.label}>
          Email
        </Text>

        <TextInput
          style={[
            styles.input,
            showRequiredError &&
              !email.trim() &&
              styles.inputError,
          ]}
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {showRequiredError && !email.trim() ? (
          <Text style={styles.requiredError}>
            Required field
          </Text>
        ) : null}

        <Text style={styles.label}>
          Password
        </Text>

        <TextInput
          style={[
            styles.input,
            showRequiredError &&
              !password.trim() &&
              styles.inputError,
          ]}
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
        />

        {showRequiredError && !password.trim() ? (
          <Text style={styles.requiredError}>
            Required field
          </Text>
        ) : null}

        <Text style={styles.label}>
          Confirm Password
        </Text>

        <TextInput
          style={[
            styles.input,
            showRequiredError &&
              !confirmPassword.trim() &&
              styles.inputError,
          ]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm Password"
          secureTextEntry
        />

        {showRequiredError && !confirmPassword.trim() ? (
          <Text style={styles.requiredError}>
            Required field
          </Text>
        ) : null}

        {password !== confirmPassword &&
        confirmPassword.length > 0 ? (
          <Text style={styles.error}>
            Passwords do not match.
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.primaryButton,
            disabled && styles.primaryButtonDisabled,
          ]}
          onPress={onRegister}
          disabled={disabled}
        >
          <Text style={styles.primaryButtonText}>
            Register
          </Text>
        </Pressable>

        <View style={styles.row}>
          <Text style={styles.smallText}>
            Already have an account?{" "}
          </Text>

          <Pressable
            onPress={() => router.replace("/tabs/login")}
          >
            <Text style={styles.linkText}>
              Login
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9EEF5",
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#F7F9FC",
    borderRadius: 24,
    padding: 24,
  },

  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E6EDF7",
    color: "#173B70",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
    fontWeight: "700",
  },

  title: {
    fontSize: 36,
    fontWeight: "700",
    color: "#1B2B50",
  },

  subtitle: {
    marginTop: 8,
    marginBottom: 20,
    color: "#4A5670",
    fontSize: 16,
    lineHeight: 22,
  },

  label: {
    color: "#33415E",
    marginBottom: 6,
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E3",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: "#EEF3FA",
  },

  inputError: {
    borderColor: "#D42A2A",
    borderWidth: 1.5,
  },

  requiredError: {
    color: "#D42A2A",
    fontSize: 12,
    fontWeight: "500",
    marginTop: -8,
    marginBottom: 8,
  },

  error: {
    color: "#D42A2A",
    fontWeight: "600",
    marginBottom: 8,
  },

  primaryButton: {
    marginTop: 8,
    backgroundColor: "#173B70",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },

  primaryButtonDisabled: {
    opacity: 0.6,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 14,
  },

  smallText: {
    color: "#4A5670",
    fontSize: 15,
  },

  linkText: {
    color: "#173B70",
    textDecorationLine: "underline",
    fontSize: 15,
    fontWeight: "700",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  modalContainer: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#F7F9FC",
    borderRadius: 20,
    padding: 24,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1B2B50",
    marginBottom: 8,
  },

  modalSubtitle: {
    color: "#4A5670",
    fontSize: 15,
    marginBottom: 18,
    lineHeight: 21,
  },

  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  requirementIcon: {
    width: 24,
    fontSize: 18,
    fontWeight: "700",
    marginRight: 8,
    textAlign: "center",
  },

  requirementText: {
    flex: 1,
    color: "#33415E",
    fontSize: 15,
  },

  valid: {
    color: "#16803C",
  },

  invalid: {
    color: "#D42A2A",
  },

  validText: {
    color: "#16803C",
  },

  mismatchMessage: {
    color: "#33415E",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 8,
  },

  modalButton: {
    marginTop: 12,
    backgroundColor: "#173B70",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },

  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  modalSecondaryButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#CBD5E3",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },

  modalSecondaryButtonText: {
    color: "#33415E",
    fontSize: 16,
    fontWeight: "700",
  },
});