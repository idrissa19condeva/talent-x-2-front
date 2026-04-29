import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
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
 * Six-segment numeric OTP input.
 *
 * Layout: a single TextInput is absolute-filled across the row and made
 * visually invisible (transparent text, hidden caret). The cell row is
 * rendered on top with pointerEvents="none" so all taps fall through to the
 * input — that's what makes the keyboard open when the user taps any cell.
 */
export const OtpField = forwardRef<TextInput, Props>(function OtpField(
  { value, onChange, onComplete, error, testID, autoFocus },
  ref,
) {
  const localRef = useRef<TextInput>(null);
  const inputRef = (ref as React.RefObject<TextInput>) ?? localRef;
  const [focused, setFocused] = useState(false);

  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: false,
        }),
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
      <View style={styles.row}>
        {/* Real input, sized to fill the row, visually invisible. */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          keyboardType="number-pad"
          inputMode="numeric"
          textContentType={Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
          autoComplete="one-time-code"
          autoFocus={autoFocus}
          maxLength={LENGTH}
          caretHidden
          selectionColor="transparent"
          style={styles.input}
          accessibilityLabel="verification code"
          testID={testID}
        />

        {/* Visual cells overlayed; pointerEvents="none" lets taps reach the input. */}
        <View style={styles.cellsRow} pointerEvents="none">
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
        </View>
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
});

const CELL_W = 48;
const CELL_H = 56;

const styles = StyleSheet.create({
  wrapper: { gap: spacing.sm },
  row: { height: CELL_H, position: 'relative' },
  input: {
    ...StyleSheet.absoluteFillObject,
    color: 'transparent',
    backgroundColor: 'transparent',
    fontSize: 1, // any non-zero size to keep the input alive on Android
    letterSpacing: 0,
    textAlign: 'center',
    padding: 0,
  },
  cellsRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
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
  error: { color: colors.danger },
});
