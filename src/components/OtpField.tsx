import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  Easing,
} from 'react-native';
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
 * Six-segment numeric OTP input. Renders as a row of pill cells, but reads
 * from a single hidden TextInput so paste and IME work as expected.
 */
export const OtpField = forwardRef<TextInput, Props>(function OtpField(
  { value, onChange, onComplete, error, testID, autoFocus },
  ref,
) {
  const localRef = useRef<TextInput>(null);
  const inputRef = (ref as React.RefObject<TextInput>) ?? localRef;
  const [focused, setFocused] = useState(false);

  // Pulse the active cell so it feels alive while the user types.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    ).start();
  }, [pulse]);

  const cells = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');
  const activeIndex = Math.min(value.length, LENGTH - 1);

  const handleChange = (raw: string) => {
    const digits = raw.replace(/\D+/g, '').slice(0, LENGTH);
    onChange(digits);
    if (digits.length === LENGTH) onComplete?.(digits);
  };

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => inputRef.current?.focus()}
        accessibilityRole="text"
        style={styles.row}
      >
        {cells.map((char, i) => {
          const isActive = focused && i === activeIndex && !char;
          return (
            <View
              key={i}
              style={[
                styles.cell,
                char ? styles.cellFilled : null,
                isActive ? styles.cellActive : null,
                !!error ? styles.cellError : null,
              ]}
              testID={testID ? `${testID}-cell-${i}` : undefined}
            >
              <Text style={[typography.h1, styles.cellChar]}>{char}</Text>
              {isActive ? (
                <Animated.View style={[styles.caret, { opacity: pulse }]} />
              ) : null}
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType="number-pad"
        textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        maxLength={LENGTH}
        style={styles.hiddenInput}
        accessibilityLabel="verification code"
        testID={testID}
      />

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
});

const CELL_W = 48;
const CELL_H = 56;

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.xs },
  cell: {
    width: CELL_W,
    height: CELL_H,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cellActive: { borderColor: colors.primary },
  cellError: { borderColor: colors.danger },
  cellChar: { color: colors.text, fontVariant: ['tabular-nums'] },
  caret: { width: 2, height: 24, backgroundColor: colors.primary, position: 'absolute' },
  hiddenInput: {
    position: 'absolute',
    height: CELL_H,
    width: '100%',
    opacity: 0,
  },
  error: { color: colors.danger },
});
