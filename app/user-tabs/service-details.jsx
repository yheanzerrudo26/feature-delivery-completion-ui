import { useAppTheme } from "@/context/app-theme-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SERVICES = [
  {
    id: "essential",
    name: "Essential Endurance",
    price: "₱800",
    icon: "shield-checkmark-outline",
    tagline: "Essential care and conditioning",
    description:
      "A basic restoration service for leather pieces that need proper cleaning, conditioning, and basic finishing to maintain their overall condition.",
    suitableFor: [
      "Light surface dirt",
      "Dry or dull leather",
      "Routine leather maintenance",
      "Minor signs of wear",
    ],
    includes: ["Surface cleaning", "Leather conditioning", "Basic finishing"],
  },
  {
    id: "foundation",
    name: "The Foundation",
    price: "₱1,800",
    icon: "construct-outline",
    tagline: "Deeper care for visible wear",
    description:
      "A deeper restoration service for leather pieces showing visible wear, surface damage, fading, or edge deterioration.",
    suitableFor: [
      "Visible scratches and scuffs",
      "Surface wear",
      "Color fading",
      "Dry or tired-looking leather",
      "Edge wear",
    ],
    includes: [
      "Deep cleaning",
      "Leather conditioning",
      "Color touch-up",
      "Edge care",
    ],
  },
  {
    id: "heritage",
    name: "The Heritage Glass",
    price: "₱3,500",
    icon: "diamond-outline",
    tagline: "Premium restoration and refinement",
    description:
      "A premium restoration protocol for valuable leather pieces requiring a detailed assessment, deeper restoration, color refinement, and protective finishing.",
    suitableFor: [
      "Significant surface wear",
      "Noticeable color deterioration",
      "Premium or valuable leather pieces",
      "Items requiring detailed refinement",
    ],
    includes: [
      "Full assessment",
      "Deep restoration",
      "Color refinement",
      "Protective finish",
    ],
  },
  {
    id: "resurrection",
    name: "The Resurrection Protocol",
    price: "Quote Required",
    icon: "sparkles-outline",
    tagline: "Specialized restoration for complex cases",
    description:
      "A specialized restoration protocol for heavily damaged, vintage, or complex leather pieces that require a customized treatment plan.",
    suitableFor: [
      "Heavy damage",
      "Severe deterioration",
      "Vintage leather pieces",
      "Complex restoration cases",
      "Cases requiring specialized treatment",
    ],
    includes: [
      "Detailed assessment",
      "Custom treatment plan",
      "Specialized restoration",
    ],
  },
];

const getServiceById = (id) => {
  return SERVICES.find((item) => item.id === id);
};

export default function ServiceDetailsScreen() {
  const { palette } = useAppTheme();
  const { service } = useLocalSearchParams();
  const { width } = useWindowDimensions();

  const serviceKey = Array.isArray(service) ? service[0] : service;
  const selectedService = getServiceById(serviceKey);

  const isSmallScreen = width < 380;

  if (!selectedService) {
    return (
      <SafeAreaView
        style={[
          styles.screen,
          {
            backgroundColor: palette.background,
          },
        ]}
      >
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={palette.accent}
          />

          <Text
            style={[
              styles.errorTitle,
              {
                color: palette.textPrimary,
              },
            ]}
          >
            Service not found
          </Text>

          <Text
            style={[
              styles.errorText,
              {
                color: palette.textSecondary,
              },
            ]}
          >
            We could not find the selected MABULI service.
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={[
              styles.errorButton,
              {
                backgroundColor: palette.accent,
              },
            ]}
          >
            <Text style={styles.errorButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const askAI = () => {
    router.push({
      pathname: "/user-tabs/chatbot",
      params: {
        service: selectedService.id,
      },
    });
  };

  const startRequest = () => {
    router.push({
      pathname: "/user-tabs/atelier-checklist",
      params: {
        service: selectedService.id,
      },
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.screen,
        {
          backgroundColor: palette.background,
        },
      ]}
      edges={["top"]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          {
            paddingHorizontal: isSmallScreen ? 14 : 18,
          },
        ]}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: palette.softCard,
              },
            ]}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={palette.textPrimary}
            />
          </Pressable>

          <View style={styles.headerText}>
            <Text
              style={[
                styles.eyebrow,
                {
                  color: palette.textSecondary,
                },
              ]}
            >
              MABULI ATELIER
            </Text>

            <Text
              style={[
                styles.headerTitle,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              Service Details
            </Text>
          </View>
        </View>

        {/* SERVICE HERO */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: palette.card,
            },
          ]}
        >
          <View
            style={[
              styles.serviceIcon,
              {
                backgroundColor: palette.softCard,
              },
            ]}
          >
            <Ionicons
              name={selectedService.icon}
              size={34}
              color={palette.accent}
            />
          </View>

          <Text
            style={[
              styles.serviceName,
              {
                color: palette.textPrimary,
              },
            ]}
          >
            {selectedService.name}
          </Text>

          <Text
            style={[
              styles.tagline,
              {
                color: palette.textSecondary,
              },
            ]}
          >
            {selectedService.tagline}
          </Text>

          <Text
            style={[
              styles.price,
              {
                color: palette.accent,
              },
            ]}
          >
            {selectedService.price}
          </Text>
        </View>

        {/* ABOUT */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: palette.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={palette.accent}
            />

            <Text
              style={[
                styles.sectionTitle,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              About this service
            </Text>
          </View>

          <Text
            style={[
              styles.bodyText,
              {
                color: palette.textSecondary,
              },
            ]}
          >
            {selectedService.description}
          </Text>
        </View>

        {/* SUITABLE FOR */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: palette.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="clipboard-outline"
              size={21}
              color={palette.accent}
            />

            <Text
              style={[
                styles.sectionTitle,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              Suitable for
            </Text>
          </View>

          <View style={styles.list}>
            {selectedService.suitableFor.map((item) => (
              <View key={item} style={styles.listRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={palette.accent}
                />

                <Text
                  style={[
                    styles.listText,
                    {
                      color: palette.textSecondary,
                    },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* WHAT'S INCLUDED */}
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: palette.card,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Ionicons
              name="checkmark-circle-outline"
              size={21}
              color={palette.accent}
            />

            <Text
              style={[
                styles.sectionTitle,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              What&apos;s included
            </Text>
          </View>

          <View style={styles.list}>
            {selectedService.includes.map((item) => (
              <View key={item} style={styles.includeCard}>
                <Ionicons name="checkmark" size={18} color={palette.accent} />

                <Text
                  style={[
                    styles.listText,
                    {
                      color: palette.textPrimary,
                    },
                  ]}
                >
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* NEXT STEP */}
        <View
          style={[
            styles.nextStepCard,
            {
              backgroundColor: palette.softCard,
            },
          ]}
        >
          <Ionicons
            name="arrow-forward-circle-outline"
            size={24}
            color={palette.accent}
          />

          <View style={styles.nextStepContent}>
            <Text
              style={[
                styles.nextStepTitle,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              What happens next?
            </Text>

            <Text
              style={[
                styles.nextStepText,
                {
                  color: palette.textSecondary,
                },
              ]}
            >
              Your item will go through the MABULI Atelier Checklist for
              condition documentation before restoration begins.
            </Text>
          </View>
        </View>

        {/* ACTIONS */}
        <View style={styles.actions}>
          <Pressable
            onPress={askAI}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: palette.softCard,
              },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={20}
              color={palette.accent}
            />

            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              Ask MABULI AI
            </Text>
          </Pressable>

          <Pressable
            onPress={startRequest}
            style={[
              styles.primaryButton,
              {
                backgroundColor: palette.accent,
              },
            ]}
          >
            <Ionicons name="document-text-outline" size={19} color="#FFFFFF" />

            <Text style={styles.primaryButtonText}>
              Start Restoration Request
            </Text>

            <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  container: {
    paddingTop: 16,
    paddingBottom: 35,
    gap: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerText: {
    flex: 1,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },

  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "600",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 3,
  },

  heroCard: {
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    gap: 8,
  },

  serviceIcon: {
    width: 70,
    height: 70,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },

  serviceName: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  tagline: {
    fontSize: 13,
    textAlign: "center",
  },

  price: {
    fontSize: 19,
    fontWeight: "700",
    marginTop: 4,
  },

  sectionCard: {
    borderRadius: 20,
    padding: 18,
    gap: 13,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  bodyText: {
    fontSize: 14,
    lineHeight: 21,
  },

  list: {
    gap: 10,
  },

  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },

  listText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  includeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  nextStepCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  nextStepContent: {
    flex: 1,
    gap: 5,
  },

  nextStepTitle: {
    fontSize: 15,
    fontWeight: "700",
  },

  nextStepText: {
    fontSize: 12,
    lineHeight: 18,
  },

  actions: {
    gap: 10,
    marginTop: 2,
  },

  secondaryButton: {
    minHeight: 52,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },

  primaryButton: {
    minHeight: 54,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    gap: 12,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  errorText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  errorButton: {
    marginTop: 8,
    minHeight: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  errorButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
