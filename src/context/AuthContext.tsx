import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@/types/user";
import { KEYS, setMemoryToken, storage } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  /** false cho tới khi đọc xong phiên đăng nhập đã lưu */
  ready: boolean;
  login: (u: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [raw, token] = await Promise.all([storage.get(KEYS.user), storage.get(KEYS.token)]);
        if (raw && token) {
          setMemoryToken(token);
          setUser(JSON.parse(raw));
        }
      } catch {
        /* dữ liệu lưu bị hỏng -> coi như chưa đăng nhập */
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const login = useCallback(async (u: User, token: string) => {
    setMemoryToken(token);
    await Promise.all([storage.set(KEYS.token, token), storage.set(KEYS.user, JSON.stringify(u))]);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    setMemoryToken(null);
    await Promise.all([storage.remove(KEYS.token), storage.remove(KEYS.user)]);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, ready, login, logout }), [user, ready, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
