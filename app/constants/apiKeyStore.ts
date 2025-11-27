import * as SecureStore from 'expo-secure-store';

const API_KEY_FIELD = 'user_google_places_api_key';

export async function saveApiKey(key: string) {
  await SecureStore.setItemAsync(API_KEY_FIELD, key);
}

export async function loadApiKey() {
  return await SecureStore.getItemAsync(API_KEY_FIELD);
}

export async function deleteApiKey() {
  await SecureStore.deleteItemAsync(API_KEY_FIELD);
}
