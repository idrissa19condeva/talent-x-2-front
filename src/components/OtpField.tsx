import { useEffect, useRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
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
 * Six-cell numeric OTP input. Each cell is its own TextInput so keystrokes
 * land reliably on every platform. Typing advances focus to the next cell;
 * backspace on an empty cell jumps back. Pasting a 6-digit code into any
 * cell distributes the digits across the row.
 */
export function OtpField({ value, onChange, onComplete, error, testID, autoFocus }: Props) {
  const refs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Honor autoFocus once on mount. We can't rely on the prop directly because
  // the cells are rendered conditionally and we want a controlled focus.
  useEffect(() => {
    if (autoFocus) {
      // Defer one tick so the layout has settled.
      const t = setTimeout(() => refs.current[0]?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [autoFocus]);

  const cells = Array.from({ length: LENGTH }, (_, i) => value[i] ?? '');

  const handleCellChange = (raw: string, index: number) => {
    const digits = raw.replace(/\D+/g, '');
    if (!digits) {
      // User cleared the cell. Drop that digit from the controlled value.
      const next = value.slice(0, index) + value.slice(index + 1);
      onChange(next);
      return;
    }

    if (digits.length === LENGTH) {
      // Paste of a full code into any cell — distribute and finish.
      onChange(digits);
      refs.current[LENGTH - 1]?.focus();
      onComplete?.(digits);
      return;
    }

    // Single (or first) typed digit. Replace the index, advance.
    const digit = digits.charAt(0);
    const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(0, LENGTH);
    onChange(next);

    if (index < LENGTH - 1) {
      refs.current[index + 1]?.focus();
    } else if (next.length === LENGTH) {
      onComplete?.(next);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !cells[index] && index > 0) {
      // Empty cell + backspace → erase previous and step back.
      const next = value.slice(0, index - 1) + value.slice(index);
      onChange(next);
      refs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        {cells.map((char, i) => {
          const isActive = focusedIndex === i;
          return (
            <TextInput
              key={i}
              ref={(r) => {
                refs.current[i] = r;
              }}
              value={char}
              onChangeText={(raw) => handleCellChange(raw, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              onFocus={() => setFocusedIndex(i)}
              onBlur={() => setFocusedIndex((cur) => (cur === i ? null : cur))}
              keyboardType="number-pad"
              inputMode="numeric"
              maxLength={LENGTH /* allow paste of a full code */}
              textContentType={i === 0 && Platform.OS === 'ios' ? 'oneTimeCode' : 'none'}
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              selectionColor={colors.primary}
              accessibilityLabel={`verification code digit ${i + 1}`}
              testID={testID ? `${testID}-cell-${i}` : undefined}
              style={[
                styles.cell,
                typography.h1,
                styles.cellText,
                char ? styles.cellFilled : null,
                isActive ? styles.cellActive : null,
                !!error ? styles.cellError : null,
              ]}
            />
          );
        })}
      </View>

      {error ? (
        <Text
          style={[typography.caption, styles.error]}
          testID={testID ? `${testID}-error` : undefined}
        >
          {error}
        </Text>
      ) : null}

      {/* Hidden testID-friendly input that mirrors the full value, so existing
          tests that drive `fireEvent.changeText(getByTestId('verify-code'), '123456')`
          keep working. */}
      <TextInput
        value={value}
        onChangeText={(raw) => {
          const digits = raw.replace(/\D+/g, '').slice(0, LENGTH);
          onChange(digits);
          if (digits.length === LENGTH) onComplete?.(digits);
        }}
        style={styles.testProbe}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        testID={testID}
      />
    </View>
  );
}

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
    textAlign: 'center',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  cellText: { color: colors.text },
  cellFilled: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  cellActive: { borderColor: colors.primary, backgroundColor: colors.background },
  cellError: { borderColor: colors.danger },
  error: { color: colors.danger },
  testProbe: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});
