import * as SecureStore from 'expo-secure-store';
import type { TokenCache } from '@clerk/clerk-expo/dist/cache';

// Clerk-recommended secure token cache. Keeps JWTs out of AsyncStorage.
export const tokenCache: TokenCache = {
  async getToken(key) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Swallow — never block auth flow on storage errors.
    }
  },
  async clearToken(key) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Swallow.
    }
  },
};
