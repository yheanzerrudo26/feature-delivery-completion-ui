import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '@/context/app-theme-context';
import { useEffect, useRef, useState } from 'react';

const SERVICES = {
  essential: {
    name: 'Essential Endurance',
    price: '₱800',
    icon: 'shield-checkmark-outline',
  },

  foundation: {
    name: 'The Foundation',
    price: '₱1,800',
    icon: 'construct-outline',
  },

  heritage: {
    name: 'The Heritage Glass',
    price: '₱3,500',
    icon: 'diamond-outline',
  },

  resurrection: {
    name: 'The Resurrection Protocol',
    price: 'Quote Required',
    icon: 'sparkles-outline',
  },
};

const QUICK_QUESTIONS = [
  {
    label: 'Which service do I need?',
    message: 'Which restoration service would be suitable for my leather item?',
  },
  {
    label: 'Scratches',
    message: 'My leather item has scratches and scuffs. What should I do?',
  },
  {
    label: 'Faded color',
    message: 'The color of my leather item has faded. Can MABULI restore it?',
  },
  {
    label: 'Mold or odor',
    message: 'My leather item has mold or an unusual odor. What should I do?',
  },
];

function getAssistantResponse(message) {
  const text = message.toLowerCase();

  if (
    text.includes('hello') ||
    text.includes('hi') ||
    text.includes('hey') ||
    text.includes('good morning') ||
    text.includes('good afternoon') ||
    text.includes('good evening')
  ) {
    return {
      text:
        'Hello! I’m the MABULI AI Assistant. I can help you understand leather condition concerns and our restoration services. You can tell me about the item, its damage, or ask which service may be suitable.',
    };
  }

  if (
    text.includes('service') ||
    text.includes('which') ||
    text.includes('recommend') ||
    text.includes('suitable') ||
    text.includes('need')
  ) {
    return {
      text:
        'I can help narrow it down. Essential Endurance is for basic cleaning and conditioning. The Foundation is for visible wear, scratches, fading, and edge wear. The Heritage Glass is for more detailed premium restoration. The Resurrection Protocol is for heavily damaged, vintage, or complex pieces and requires an assessment for a quote.',
      service: 'foundation',
    };
  }

  if (
    text.includes('scratch') ||
    text.includes('scuff') ||
    text.includes('gouge')
  ) {
    return {
      text:
        'For scratches, scuffs, or surface gouges, The Foundation may be relevant because it includes deep cleaning, conditioning, color touch-up, and edge care. The final treatment still depends on the actual condition of the leather.',
      service: 'foundation',
    };
  }

  if (
    text.includes('fade') ||
    text.includes('faded') ||
    text.includes('color') ||
    text.includes('discolor')
  ) {
    return {
      text:
        'For faded or uneven color, The Foundation includes color touch-up. If the piece needs more extensive color refinement and restoration, The Heritage Glass may be considered after assessment.',
      service: 'foundation',
    };
  }

  if (
    text.includes('dry') ||
    text.includes('dried') ||
    text.includes('crack') ||
    text.includes('cracking')
  ) {
    return {
      text:
        'Dry-looking leather may need cleaning and conditioning. Essential Endurance covers basic cleaning and leather conditioning. If there is visible cracking or more significant deterioration, a deeper assessment may be needed before selecting a service.',
      service: 'essential',
    };
  }

  if (
    text.includes('mold') ||
    text.includes('mildew') ||
    text.includes('fungus')
  ) {
    return {
      text:
        'Mold or mildew should be assessed carefully before restoration. Please avoid trying aggressive cleaning products on the leather because they may cause additional damage. MABULI can assess the biological condition and determine the appropriate restoration approach. Heavily affected pieces may require a specialized assessment.',
      service: 'resurrection',
    };
  }

  if (
    text.includes('odor') ||
    text.includes('smell') ||
    text.includes('bad smell')
  ) {
    return {
      text:
        'Unusual odor can be related to moisture, contamination, or biological activity. The item should be assessed before treatment. Please avoid masking the odor with strong household chemicals or fragrances because these may affect the leather.',
      service: 'resurrection',
    };
  }

  if (
    text.includes('sole') ||
    text.includes('separation') ||
    text.includes('separated') ||
    text.includes('edge')
  ) {
    return {
      text:
        'For sole, edge, or structural concerns, the condition should be documented during intake. The Foundation includes edge care, while more complex structural or heavily damaged cases may require a specialized assessment.',
      service: 'foundation',
    };
  }

  if (
    text.includes('vintage') ||
    text.includes('old bag') ||
    text.includes('old shoe') ||
    text.includes('heavily damaged') ||
    text.includes('severely damaged') ||
    text.includes('complex')
  ) {
    return {
      text:
        'For vintage, heavily damaged, or complex leather pieces, The Resurrection Protocol is designed for specialized restoration. It begins with a detailed assessment and custom treatment plan, so the price is provided after evaluation.',
      service: 'resurrection',
    };
  }

  if (
    text.includes('clean') ||
    text.includes('dirt') ||
    text.includes('dirty') ||
    text.includes('maintenance')
  ) {
    return {
      text:
        'For light dirt and routine maintenance, Essential Endurance includes surface cleaning and leather conditioning. If the item has visible wear or other damage, The Foundation may be more appropriate after assessment.',
      service: 'essential',
    };
  }

  if (
    text.includes('price') ||
    text.includes('cost') ||
    text.includes('how much') ||
    text.includes('₱') ||
    text.includes('peso')
  ) {
    return {
      text:
        'Our current listed services are: Essential Endurance at ₱800, The Foundation at ₱1,800, and The Heritage Glass at ₱3,500. The Resurrection Protocol requires an assessment and quotation because the treatment depends on the condition of the item.',
    };
  }

  if (
    text.includes('photo') ||
    text.includes('picture') ||
    text.includes('pictures')
  ) {
    return {
      text:
        'For a restoration request, clear photos are important for documenting the item’s condition. MABULI uses condition documentation such as front, side, heel, sole, and damage-detail photos to establish a baseline before restoration.',
    };
  }

  if (
    text.includes('process') ||
    text.includes('how does') ||
    text.includes('workflow') ||
    text.includes('request')
  ) {
    return {
      text:
        'The MABULI workflow starts with documenting the leather item and its pre-existing condition. The request can include condition information and required photos. The restoration service is then reviewed, followed by the appropriate restoration workflow and quality checking.',
    };
  }

  if (
    text.includes('bag') ||
    text.includes('shoe') ||
    text.includes('wallet') ||
    text.includes('leather')
  ) {
    return {
      text:
        'I can help assess the concern based on what you describe. Tell me what type of leather item you have and what you noticed, such as scratches, fading, dryness, stains, mold, odor, edge wear, or structural damage.',
    };
  }

  return {
    text:
      'I can help with MABULI leather restoration concerns. Try asking about scratches, faded color, dry leather, mold, odor, sole or edge damage, vintage pieces, service prices, required photos, or which restoration service may be suitable.',
  };
}

export default function ChatbotScreen() {
  const { palette } = useAppTheme();
  const { width } = useWindowDimensions();
  const listRef = useRef(null);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Hello! I\'m the MABULI AI Assistant. I can help you understand leather condition concerns and our restoration services. What would you like to know?',
    },
  ]);

  const isSmallScreen = width < 380;

  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);
    return () => clearTimeout(timer);
  }, [messages]);

  const sendMessage = (messageText = input) => {
    const trimmed = messageText.trim();

    if (!trimmed) {
      return;
    }

    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: trimmed,
    };

    const response = getAssistantResponse(trimmed);

    const assistantMessage = {
      id: `${Date.now()}-assistant`,
      role: 'assistant',
      text: response.text,
      service: response.service,
    };

    setMessages((current) => [
      ...current,
      userMessage,
      assistantMessage,
    ]);

    setInput('');
  };

  const openService = (serviceId) => {
    router.push({
      pathname: '/user-tabs/service-details',
      params: {
        service: serviceId,
      },
    });
  };

  const renderMessage = ({ item }) => {
    const isAssistant = item.role === 'assistant';
    const recommendedService = item.service
      ? SERVICES[item.service]
      : null;

    return (
      <View
        style={[
          styles.messageRow,
          isAssistant
            ? styles.assistantRow
            : styles.userRow,
        ]}
      >
        {isAssistant && (
          <View
            style={[
              styles.botAvatar,
              { backgroundColor: palette.softCard },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={17}
              color={palette.accent}
            />
          </View>
        )}

        <View
          style={[
            styles.messageColumn,
            !isAssistant && styles.userMessageColumn,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              isAssistant
                ? {
                    backgroundColor: palette.card,
                    borderColor: palette.softCard,
                  }
                : {
                    backgroundColor: palette.accent,
                    borderColor: palette.accent,
                  },
            ]}
          >
            <Text
              style={[
                styles.messageText,
                {
                  color: isAssistant
                    ? palette.textPrimary
                    : '#FFFFFF',
                },
              ]}
            >
              {item.text}
            </Text>
          </View>

          {recommendedService && (
            <Pressable
              onPress={() => openService(item.service)}
              style={[
                styles.recommendation,
                {
                  backgroundColor: palette.softCard,
                },
              ]}
            >
              <View
                style={[
                  styles.recommendationIcon,
                  {
                    backgroundColor: palette.card,
                  },
                ]}
              >
                <Ionicons
                  name={recommendedService.icon}
                  size={19}
                  color={palette.accent}
                />
              </View>

              <View style={styles.recommendationContent}>
                <Text
                  style={[
                    styles.recommendationLabel,
                    { color: palette.textSecondary },
                  ]}
                >
                  POSSIBLE SERVICE
                </Text>

                <Text
                  style={[
                    styles.recommendationName,
                    { color: palette.textPrimary },
                  ]}
                >
                  {recommendedService.name}
                </Text>

                <Text
                  style={[
                    styles.recommendationPrice,
                    { color: palette.accent },
                  ]}
                >
                  {recommendedService.price}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[
        styles.screen,
        { backgroundColor: palette.background },
      ]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View
          style={[
            styles.header,
            {
              paddingHorizontal: isSmallScreen ? 14 : 18,
              borderBottomColor: palette.softCard,
            },
          ]}
        >
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: palette.softCard },
            ]}
          >
            <Ionicons
              name="sparkles"
              size={21}
              color={palette.accent}
            />
          </View>

          <View style={styles.headerText}>
              <Text
                style={[
                  styles.headerTitle,
                  { color: palette.textPrimary },
                ]}
              >
                Restoration Chat
              </Text>

            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: palette.accent },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  { color: palette.textSecondary },
                ]}
              >
                Leather restoration assistant
              </Text>
            </View>
          </View>
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({ animated: true })
          }
          contentContainerStyle={[
            styles.chatContent,
            {
              paddingHorizontal: isSmallScreen ? 12 : 16,
            },
          ]}
        />

        <View
          style={[
            styles.quickSection,
            { backgroundColor: palette.background },
          ]}
        >
          <FlatList
            horizontal
            data={QUICK_QUESTIONS}
            keyExtractor={(item) => item.label}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.quickContent}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => sendMessage(item.message)}
                style={[
                  styles.quickButton,
                  { backgroundColor: palette.softCard },
                ]}
              >
                <Text
                  style={[
                    styles.quickText,
                    { color: palette.textPrimary },
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            )}
          />
        </View>

        <View
          style={[
            styles.inputArea,
            {
              backgroundColor: palette.background,
              borderTopColor: palette.softCard,
            },
          ]}
        >
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: palette.card,
                borderColor: palette.softCard,
              },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about your leather item..."
              placeholderTextColor={palette.textSecondary}
              style={[
                styles.input,
                { color: palette.textPrimary },
              ]}
              multiline
              maxLength={500}
              onFocus={() => {
                setTimeout(() => {
                  listRef.current?.scrollToEnd({ animated: true });
                }, 120);
              }}
              onSubmitEditing={() => sendMessage()}
            />

            <Pressable
              onPress={() => sendMessage()}
              disabled={!input.trim()}
              style={[
                styles.sendButton,
                {
                  backgroundColor: input.trim()
                    ? palette.accent
                    : palette.softCard,
                },
              ]}
            >
              <Ionicons
                name="arrow-up"
                size={20}
                color={
                  input.trim()
                    ? '#FFFFFF'
                    : palette.textSecondary
                }
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  header: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerText: {
    flex: 1,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  statusText: {
    fontSize: 11,
  },

  chatContent: {
    paddingTop: 16,
    paddingBottom: 12,
    gap: 14,
  },

  messageRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },

  assistantRow: {
    justifyContent: 'flex-start',
  },

  userRow: {
    justifyContent: 'flex-end',
  },

  botAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },

  messageColumn: {
    maxWidth: '82%',
    gap: 7,
  },

  userMessageColumn: {
    alignItems: 'flex-end',
  },

  messageBubble: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },

  recommendation: {
    width: '100%',
    minHeight: 68,
    borderRadius: 16,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  recommendationIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },

  recommendationContent: {
    flex: 1,
    gap: 2,
  },

  recommendationLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    fontWeight: '600',
  },

  recommendationName: {
    fontSize: 13,
    fontWeight: '700',
  },

  recommendationPrice: {
    fontSize: 11,
    fontWeight: '600',
  },

  quickSection: {
    paddingVertical: 8,
  },

  quickContent: {
    paddingHorizontal: 12,
    gap: 8,
  },

  quickButton: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 18,
  },

  quickText: {
    fontSize: 11,
    fontWeight: '600',
  },

  inputArea: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  inputContainer: {
    minHeight: 50,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 18,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },

  input: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    maxHeight: 105,
    paddingTop: 8,
    paddingBottom: 8,
  },

  sendButton: {
    width: 39,
    height: 39,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});