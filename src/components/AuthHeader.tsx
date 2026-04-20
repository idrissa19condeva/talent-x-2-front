import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface Props {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={[typography.display, styles.title]} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={[typography.body, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.xl },
  title: { color: colors.text },
  subtitle: { color: colors.textMuted },
});
