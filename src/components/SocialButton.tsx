import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, typography } from '@/theme';
import { GoogleGlyph, FacebookGlyph, AppleGlyph } from './SocialGlyphs';

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
  const palette = paletteMap[provider];

  const handlePress = () => {
    if (isDisabled) return;
    Haptics.selectionAsync().catch(() => undefined);
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [
        styles.base,
        palette.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.text.color} />
      ) : (
        <View style={styles.row}>
          <View style={styles.icon}>
            {provider === 'google' ? <GoogleGlyph size={18} /> : null}
            {provider === 'facebook' ? <FacebookGlyph size={18} /> : null}
            {provider === 'apple' ? <AppleGlyph size={18} color={palette.text.color} /> : null}
          </View>
          <Text style={[typography.bodyStrong, palette.text]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pressed: { opacity: 0.9, transform: [{ scale: 0.997 }] },
  disabled: { opacity: 0.5 },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: spacing.sm },
});

const paletteMap: Record<SocialProvider, { container: object; text: { color: string } }> = {
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
