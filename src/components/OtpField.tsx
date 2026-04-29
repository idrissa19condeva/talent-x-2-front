import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

const LENGTH = 6;

interface Props {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (full: string) => void;
  error?: string;
  testID?: string;
  /** Currently ignored in the diagnostic build — user taps the field. */
  autoFocus?: boolean;
}

/**
 * DIAGNOSTIC BUILD.
 *
 * Stripped to the bare minimum on purpose. Mirrors the exact shape of the
 * working TextField on sign-in:
 *   - Plain wrapper View
 *   - One TextInput inside a styled wrapper View
 *   - No autoFocus, no inputMode, no autoComplete, no letterSpacing,
 *     no textContentType, no importantForAutofill, no maxLength.
 *
 * We log at three points so Metro tells us exactly where the chain breaks:
 *   1. Render — the value prop we receive each time
 *   2. onChangeText — the raw text the native input emits
 *   3. After regex strip — what we hand back to the parent
 */
export function OtpField({ value, onChange, onComplete, error, testID }: Props) {
  const [focused, setFocused] = useState(false);

  console.log('[OtpField] render value=', JSON.stringify(value));

  return (
    <View style={styles.wrapper}>
      <Text style={[typography.label, styles.label]}>Code</Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          !!error && styles.inputWrapError,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={(raw) => {
            console.log('[OtpField] onChangeText raw=', JSON.stringify(raw));
            const digits = raw.replace(/\D+/g, '').slice(0, LENGTH);
            console.log('[OtpField] onChangeText digits=', JSON.stringify(digits));
            onChange(digits);
            if (digits.length === LENGTH) onComplete?.(digits);
          }}
          onFocus={() => {
            console.log('[OtpField] onFocus');
            setFocused(true);
          }}
          onBlur={() => {
            console.log('[OtpField] onBlur');
            setFocused(false);
          }}
          keyboardType="number-pad"
          autoCorrect={false}
          placeholder="000000"
          placeholderTextColor={colors.textSubtle}
          accessibilityLabel="verification code"
          testID={testID}
          style={[styles.input, typography.body]}
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
  wrapper: { gap: spacing.xs },
  label: { color: colors.textMuted },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    height: 52,
  },
  inputWrapFocused: { borderColor: colors.primary },
  inputWrapError: { borderColor: colors.danger },
  input: { flex: 1, color: colors.text },
  error: { color: colors.danger },
});
