import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken } from "../api/client";

export type Role = "CANDIDATE" | "RECRUITER";

export type User = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; name: string; githubLogin?: string }) => Promise<User>;
  logout: () => void;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const t = localStorage.getItem("talent_token");
    if (!t) {
      setUser(null);
      setLoading(false);
      return;
    }
    setAuthToken(t);
    try {
      const { data } = await api.get("/auth/me");
      setUser({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
      });
    } catch {
      setAuthToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMe();
  }, [loadMe]);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAuthToken(data.token);
    const u = data.user as User;
    setUser(u);
    return u;
  }, []);

  const register = useCallback(
    async (payload: { email: string; password: string; name: string; githubLogin?: string }) => {
      const { data } = await api.post("/auth/register", payload);
      setAuthToken(data.token);
      const u = data.user as User;
      setUser(u);
      return u;
    },
    [],
  );

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth dentro de AuthProvider");
  return v;
}