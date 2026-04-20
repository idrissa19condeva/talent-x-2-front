import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '@/theme';

export function Divider({ label }: { label?: string }) {
  if (!label) return <View style={styles.line} />;
  return (
    <View style={styles.row}>
      <View style={[styles.line, styles.flex]} />
      <Text style={[typography.caption, styles.label]}>{label}</Text>
      <View style={[styles.line, styles.flex]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginVertical: spacing.md },
  flex: { flex: 1 },
  label: { color: colors.textSubtle, textTransform: 'uppercase', letterSpacing: 1 },
});
