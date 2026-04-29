import { StyleSheet, Text, View } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { typography } from '@/theme';

interface Props {
  label: string;
  /** Light text on dark backgrounds (welcome hero) vs muted on light (auth screens). */
  tone?: 'light' | 'muted';
}

export function TrustBadge({ label, tone = 'light' }: Props) {
  const color = tone === 'light' ? 'rgba(255,255,255,0.85)' : '#5B5F6A';
  return (
    <View style={styles.row}>
      <ShieldCheck size={14} color={color} />
      <Text style={[typography.caption, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
