import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

export default function ProtectedLayout() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  console.log('[AppLayout] isLoaded=', isLoaded, 'isSignedIn=', isSignedIn, 'userId=', userId);
  if (!isLoaded) return null;
  if (!isSignedIn) return <Redirect href="/(auth)/welcome" />;

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: '#fff' },
      }}
    />
  );
}
