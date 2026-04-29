import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';

export function useAppleAvailable(): boolean {
  const [available, setAvailable] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') {
      setAvailable(false);
      return;
    }
    let mounted = true;
    AppleAuthentication.isAvailableAsync()
      .then((v) => mounted && setAvailable(v))
      .catch(() => mounted && setAvailable(false));
    return () => {
      mounted = false;
    };
  }, []);
  return available;
}
