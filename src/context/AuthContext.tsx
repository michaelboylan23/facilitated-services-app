import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AppUser, AppRole } from "../types";

// PINs are checked against environment variables (set in SWA app settings)
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "";
const FACILITATOR_PIN = import.meta.env.VITE_FACILITATOR_PIN || "";

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  loginWithPin: (name: string, pin: string) => { success: boolean; error?: string };
  joinSession: (name: string, sessionCode: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  loginWithPin: () => ({ success: false }),
  joinSession: () => ({ success: false }),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const SESSION_KEY = "fs_auth_user";

function loadPersistedUser(): AppUser | null {
  try {
    const stored = sessionStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function persistUser(user: AppUser | null) {
  if (user) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(SESSION_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(loadPersistedUser);

  const loginWithPin = useCallback((name: string, pin: string) => {
    if (!name.trim()) {
      return { success: false, error: "Please enter your name." };
    }
    if (!pin.trim()) {
      return { success: false, error: "Please enter a PIN." };
    }

    let role: AppRole | null = null;
    if (ADMIN_PIN && pin === ADMIN_PIN) {
      role = "admin";
    } else if (FACILITATOR_PIN && pin === FACILITATOR_PIN) {
      role = "facilitator";
    }

    if (!role) {
      return { success: false, error: "Invalid PIN." };
    }

    const newUser: AppUser = {
      id: crypto.randomUUID(),
      displayName: name.trim(),
      email: "",
      role,
      isAuthenticated: true,
    };
    setUser(newUser);
    persistUser(newUser);
    return { success: true };
  }, []);

  const joinSession = useCallback((name: string, _sessionCode: string) => {
    if (!name.trim()) {
      return { success: false, error: "Please enter your name." };
    }
    // TODO: Validate session code against active assessments
    const newUser: AppUser = {
      id: crypto.randomUUID(),
      displayName: name.trim(),
      email: "",
      role: "user" as AppRole,
      isAuthenticated: true,
    };
    setUser(newUser);
    persistUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    persistUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading: false, loginWithPin, joinSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
