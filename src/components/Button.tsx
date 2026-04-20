import { forwardRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
  fullWidth?: boolean;
}

export const Button = forwardRef<View, ButtonProps>(function Button(
  { label, variant = 'primary', loading, disabled, leftIcon, style, fullWidth = true, ...rest },
  ref,
) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      ref={ref as never}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        fullWidth && styles.fullWidth,
        variantStyles[variant].container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.textInverse : colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {leftIcon ? <View style={styles.icon}>{leftIcon}</View> : null}
          <Text style={[typography.bodyStrong, variantStyles[variant].text]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
  disabled: { opacity: 0.5 },
  content: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { marginRight: spacing.xs },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.primary },
    text: { color: colors.textInverse },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderWidth: StyleSheet.hairlineWidth * 4,
      borderColor: colors.border,
    },
    text: { color: colors.text },
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: 'transparent' },
    text: { color: colors.primary },
  }),
};
