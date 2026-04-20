import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { colors, radius, spacing, typography } from '@/theme';

export type SocialProvider = 'google' | 'facebook' | 'apple';

interface Props {
  provider: SocialProvider;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  testID?: string;
}

export function SocialButton({ provider, label, onPress, loading, disabled, testID }: Props) {
  const isDisabled = disabled || loading;
  const palette = styleMap[provider];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        palette.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text.color as string} />
      ) : (
        <View style={styles.row}>
          <FontAwesome
            name={iconMap[provider]}
            size={18}
            color={palette.text.color as string}
            style={styles.icon}
          />
          <Text style={[typography.bodyStrong, palette.text]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const iconMap: Record<SocialProvider, keyof typeof FontAwesome.glyphMap> = {
  google: 'google',
  facebook: 'facebook',
  apple: 'apple',
};

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
});

const styleMap: Record<SocialProvider, { container: object; text: { color: string } }> = {
  google: {
    container: { backgroundColor: colors.background, borderColor: colors.borderStrong },
    text: { color: colors.text },
  },
  facebook: {
    container: { backgroundColor: '#1877F2', borderColor: '#1877F2' },
    text: { color: colors.textInverse },
  },
  apple: {
    container: { backgroundColor: '#000000', borderColor: '#000000' },
    text: { color: colors.textInverse },
  },
};
