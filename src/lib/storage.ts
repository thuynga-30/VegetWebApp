import AsyncStorage from "@react-native-async-storage/async-storage";

export const KEYS = { token: "gf_token", user: "gf_user" } as const;

let memoryToken: string | null = null;

export function setMemoryToken(token: string | null) {
  memoryToken = token;
}

export async function getToken(): Promise<string | null> {
  if (memoryToken) return memoryToken;
  try {
    memoryToken = await AsyncStorage.getItem(KEYS.token);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export const storage = {
  get: (k: string) => AsyncStorage.getItem(k),
  set: (k: string, v: string) => AsyncStorage.setItem(k, v),
  remove: (k: string) => AsyncStorage.removeItem(k),
};
