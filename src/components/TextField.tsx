import { forwardRef, useState } from 'react';
import {
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputFocusEventData,
  TextInputProps,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, radius, spacing, typography } from '@/theme';

export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string;
  helperText?: string;
  secure?: boolean;
  testID?: string;
}

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, helperText, secure, onFocus, onBlur, testID, ...rest },
  ref,
) {
  const { t } = useTranslation('auth');
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secure));

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(true);
    onFocus?.(e);
  };
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[typography.label, styles.label]}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && styles.inputWrapFocused,
          !!error && styles.inputWrapError,
        ]}
      >
        <TextInput
          ref={ref}
          style={[styles.input, typography.body]}
          placeholderTextColor={colors.textSubtle}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          testID={testID}
          accessibilityLabel={label}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {secure ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            accessibilityRole="button"
            testID={testID ? `${testID}-toggle` : undefined}
            style={styles.toggle}
            hitSlop={8}
          >
            <Text style={[typography.label, styles.toggleText]}>
              {hidden ? t('show') : t('hide')}
            </Text>
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={[typography.caption, styles.error]} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      ) : helperText ? (
        <Text style={[typography.caption, styles.helper]}>{helperText}</Text>
      ) : null}
    </View>
  );
});

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
  toggle: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  toggleText: { color: colors.primary },
  error: { color: colors.danger },
  helper: { color: colors.textSubtle },
});
