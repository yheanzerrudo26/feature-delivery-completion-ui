import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "@/context/app-theme-context";

const SERVICES = [
  {
    id: "essential",
    name: "Essential Endurance",
    price: "₱800",
    icon: "shield-checkmark-outline",
    tagline: "Essential care and conditioning",
    shortDescription:
      "Essential care for leather pieces needing cleaning, conditioning, and basic finishing.",
  },
  {
    id: "foundation",
    name: "The Foundation",
    price: "₱1,800",
    icon: "construct-outline",
    tagline: "Deeper care for visible wear",
    shortDescription:
      "Deeper restoration for visible wear, surface damage, fading, and edge deterioration.",
  },
  {
    id: "heritage",
    name: "The Heritage Glass",
    price: "₱3,500",
    icon: "diamond-outline",
    tagline: "Premium restoration and refinement",
    shortDescription:
      "Premium restoration with detailed assessment, refinement, and protective finishing.",
  },
  {
    id: "resurrection",
    name: "The Resurrection Protocol",
    price: "Quote Required",
    icon: "sparkles-outline",
    tagline: "Specialized restoration for complex cases",
    shortDescription:
      "Specialized restoration for heavily damaged, vintage, or complex leather pieces.",
  },
];

export default function ServicesScreen() {
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 380;

  const openService = (service) => {
    router.push({
      pathname: "/user-tabs/service-details",
      params: {
        service: service.id,
      },
    });
  };

  const openChatbot = () => {
    router.push("/user-tabs/chatbot");
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
                styles.title,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              Our Services
            </Text>
          </View>
        </View>

        <View style={styles.intro}>
          <Text
            style={[
              styles.introTitle,
              {
                color: palette.textPrimary,
              },
            ]}
          >
            Restoration Services
          </Text>

          <Text
            style={[
              styles.introText,
              {
                color: palette.textSecondary,
              },
            ]}
          >
            Explore our restoration protocols and learn which service may be
            suitable for your leather item.
          </Text>
        </View>

        <View style={styles.serviceList}>
          {SERVICES.map((service) => (
            <Pressable
              key={service.id}
              onPress={() => openService(service)}
              style={({ pressed }) => [
                styles.serviceCard,
                {
                  backgroundColor: palette.card,
                  opacity: pressed ? 0.88 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: palette.softCard,
                  },
                ]}
              >
                <Ionicons
                  name={service.icon}
                  size={30}
                  color={palette.accent}
                />
              </View>

              <View style={styles.serviceContent}>
                <View style={styles.serviceHeader}>
                  <Text
                    style={[
                      styles.serviceName,
                      {
                        color: palette.textPrimary,
                      },
                    ]}
                  >
                    {service.name}
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={19}
                    color={palette.textSecondary}
                  />
                </View>

                <Text
                  style={[
                    styles.price,
                    {
                      color: palette.accent,
                    },
                  ]}
                >
                  {service.price}
                </Text>

                <Text
                  style={[
                    styles.description,
                    {
                      color: palette.textSecondary,
                    },
                  ]}
                >
                  {service.shortDescription}
                </Text>

                <View style={styles.viewDetails}>
                  <Text
                    style={[
                      styles.viewDetailsText,
                      {
                        color: palette.textPrimary,
                      },
                    ]}
                  >
                    View service details
                  </Text>

                  <Ionicons
                    name="chatbubbles-outline"
                    size={16}
                    color={palette.accent}
                  />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={openChatbot}
          style={({ pressed }) => [
            styles.aiCard,
            {
              backgroundColor: palette.card,
              opacity: pressed ? 0.88 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.aiIcon,
              {
                backgroundColor: palette.softCard,
              },
            ]}
          >
            <Ionicons
              name="sparkles-outline"
              size={27}
              color={palette.accent}
            />
          </View>

          <View style={styles.aiContent}>
            <Text
              style={[
                styles.aiTitle,
                {
                  color: palette.textPrimary,
                },
              ]}
            >
              MABULI AI Assistant
            </Text>

            <Text
              style={[
                styles.aiText,
                {
                  color: palette.textSecondary,
                },
              ]}
            >
              Not sure which restoration service may fit your item's
              condition? Ask the MABULI AI Assistant.
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={21}
            color={palette.textSecondary}
          />
        </Pressable>
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
    gap: 22,
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

  title: {
    fontSize: 26,
    fontWeight: "700",
    marginTop: 3,
  },

  intro: {
    gap: 7,
  },

  introTitle: {
    fontSize: 21,
    fontWeight: "700",
  },

  introText: {
    fontSize: 14,
    lineHeight: 21,
  },

  serviceList: {
    gap: 14,
  },

  serviceCard: {
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 15,
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  serviceContent: {
    flex: 1,
    gap: 7,
  },

  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  serviceName: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
  },

  description: {
    fontSize: 13,
    lineHeight: 19,
  },

  viewDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },

  viewDetailsText: {
    fontSize: 12,
    fontWeight: "600",
  },

  aiCard: {
    borderRadius: 20,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  aiIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  aiContent: {
    flex: 1,
    gap: 4,
  },

  aiTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  aiText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
