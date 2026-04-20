import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

// Entry bootstrap: ClerkLoaded already guarantees session restoration ran,
// so `isLoaded` is essentially true here — but we keep a guard for fast-refresh.
export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <View style={styles.center} testID="bootstrap-loading">
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={isSignedIn ? '/(app)' : '/(auth)/welcome'} />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
