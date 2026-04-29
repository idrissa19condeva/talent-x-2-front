import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

const LENGTH = 6;

interface Props {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (full: string) => void;
  error?: string;
  testID?: string;
  autoFocus?: boolean;
}

/**
 * Numeric OTP input rendered as a single, visible TextInput. Letter-spacing
 * gives the digits the spaced-out feel of a multi-cell OTP, while keeping the
 * keystroke handling totally standard — no overlay tricks, no per-cell
 * focus management.
 */
export function OtpField({ value, onChange, onComplete, error, testID, autoFocus }: Props) {
  const ref = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (autoFocus) {
      const t = setTimeout(() => ref.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D+/g, '').slice(0, LENGTH);
    onChange(digits);
    if (digits.length === LENGTH) onComplete?.(digits);
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.box,
          focused ? styles.boxFocused : null,
          !!error ? styles.boxError : null,
        ]}
      >
        <TextInput
          ref={ref}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          inputMode="numeric"
          maxLength={LENGTH}
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          importantForAutofill="no"
          selectionColor={colors.primary}
          placeholder="000000"
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel="verification code"
          testID={testID}
          style={styles.input}
        />
      </View>
      {error ? (
        <Text
          style={[typography.caption, styles.error]}
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  box: {
    height: 64,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  boxFocused: { borderColor: colors.primary, backgroundColor: colors.background },
  boxError: { borderColor: colors.danger },
  input: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: Platform.OS === 'ios' ? 12 : 8,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
    paddingVertical: 0,
  },
  error: { color: colors.danger },
});
