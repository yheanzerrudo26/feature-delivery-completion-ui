import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/context/app-theme-context';

const DEFAULT_STEPS = ['Details', 'Photos', 'Assess', 'Submit'];

export function StepProgress({
  steps = DEFAULT_STEPS,
  activeIndex = 0,
  completedThrough = -1,
}) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.stepRow}>
      {steps.map((label, index) => {
        const done = index <= completedThrough || index < activeIndex;
        const active = index === activeIndex;
        const lineDone = index < activeIndex || index <= completedThrough;

        return (
          <View key={label} style={styles.stepItem}>
            <View style={styles.stepNodeRow}>
              {index > 0 ? (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor: lineDone
                        ? palette.accent
                        : palette.softCard,
                    },
                  ]}
                />
              ) : (
                <View style={styles.stepLineSpacer} />
              )}
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: done || active ? palette.accent : palette.card,
                    borderColor: done || active ? palette.accent : '#C5CDD9',
                  },
                ]}
              >
                {done && !active ? (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      { color: active || done ? '#FFFFFF' : palette.textSecondary },
                    ]}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 ? (
                <View
                  style={[
                    styles.stepLine,
                    {
                      backgroundColor:
                        index < activeIndex ? palette.accent : palette.softCard,
                    },
                  ]}
                />
              ) : (
                <View style={styles.stepLineSpacer} />
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                {
                  color: active || done ? palette.accent : palette.textSecondary,
                  fontWeight: active ? '700' : '500',
                },
              ]}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function RequestScreenHeader({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightLabel,
}) {
  const { palette } = useAppTheme();

  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable
          onPress={onBack || (() => router.back())}
          style={[styles.backButton, { backgroundColor: palette.softCard }]}
        >
          <Ionicons name="chevron-back" size={20} color={palette.textPrimary} />
        </Pressable>
      ) : (
        <View style={styles.backSpacer} />
      )}
      <View style={styles.headerText}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.textPrimary }]}>{title}</Text>
          {rightLabel ? (
            <Text style={[styles.rightLabel, { color: palette.textSecondary }]}>
              {rightLabel}
            </Text>
          ) : null}
        </View>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: palette.textSecondary }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function SectionCard({ children, style }) {
  const { palette } = useAppTheme();
  return (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: palette.card, borderColor: palette.softCard },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  icon,
  variant = 'primary',
}) {
  const { palette } = useAppTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.button,
        isPrimary && { backgroundColor: palette.accent },
        variant === 'secondary' && {
          backgroundColor: palette.card,
          borderWidth: 1.5,
          borderColor: palette.accent,
        },
        isDanger && { backgroundColor: '#D42A2A' },
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={isPrimary || isDanger ? '#FFFFFF' : palette.accent}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          {
            color:
              isPrimary || isDanger
                ? '#FFFFFF'
                : disabled
                  ? palette.textSecondary
                  : palette.accent,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function InfoBanner({ text, tone = 'info' }) {
  const tones = {
    info: { bg: '#E8F1FF', border: '#B7D0F5', icon: 'information-circle-outline', color: '#1B4F8A' },
    warn: { bg: '#FFF6E5', border: '#F0D7A0', icon: 'warning-outline', color: '#8A6510' },
    success: { bg: '#E8F8EF', border: '#A8DFC0', icon: 'checkmark-circle-outline', color: '#157651' },
    danger: { bg: '#FDECEC', border: '#F0B4B4', icon: 'close-circle-outline', color: '#B42318' },
  };
  const config = tones[tone] || tones.info;

  return (
    <View
      style={[
        styles.banner,
        { backgroundColor: config.bg, borderColor: config.border },
      ]}
    >
      <Ionicons name={config.icon} size={18} color={config.color} />
      <Text style={[styles.bannerText, { color: config.color }]}>{text}</Text>
    </View>
  );
}

export function FieldLabel({ children }) {
  const { palette } = useAppTheme();
  return (
    <Text style={[styles.fieldLabel, { color: palette.textSecondary }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepLine: {
    flex: 1,
    height: 2,
  },
  stepLineSpacer: {
    flex: 1,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
  },
  stepLabel: {
    fontSize: 11,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 4,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  backSpacer: {
    width: 8,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
  },
  rightLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  button: {
    minHeight: 52,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  banner: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
});
