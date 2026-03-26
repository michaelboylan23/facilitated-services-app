import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { AppUser, AppRole } from "../types";

// PINs for local dev fallback (set in .env or SWA app settings)
const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "";
const FACILITATOR_PIN = import.meta.env.VITE_FACILITATOR_PIN || "";

// SWA auth client principal shape
interface SwaClientPrincipal {
  identityProvider: string;
  userId: string;
  userDetails: string;
  userRoles: string[];
}

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  loginWithMicrosoft: () => void;
  loginWithPin: (name: string, pin: string) => { success: boolean; error?: string };
  joinSession: (name: string, sessionCode: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  loginWithMicrosoft: () => {},
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

function mapSwaRolesToAppRole(swaRoles: string[]): AppRole {
  if (swaRoles.includes("admin")) return "admin";
  if (swaRoles.includes("facilitator")) return "facilitator";
  // All authenticated Microsoft users default to facilitator
  if (swaRoles.includes("authenticated")) return "facilitator";
  return "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(loadPersistedUser);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to get SWA auth info from /.auth/me
  useEffect(() => {
    let cancelled = false;

    async function checkSwaAuth() {
      try {
        const res = await fetch("/.auth/me");
        if (!res.ok) throw new Error("Not available");
        const data = await res.json();
        const principal: SwaClientPrincipal | null = data.clientPrincipal;

        if (principal && !cancelled) {
          const swaUser: AppUser = {
            id: principal.userId,
            displayName: principal.userDetails,
            email: principal.userDetails,
            role: mapSwaRolesToAppRole(principal.userRoles),
            isAuthenticated: true,
          };
          setUser(swaUser);
          persistUser(swaUser);
        }
      } catch {
        // SWA auth not available (local dev) — fall back to persisted session
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    checkSwaAuth();
    return () => { cancelled = true; };
  }, []);

  const loginWithMicrosoft = useCallback(() => {
    // Redirect to SWA built-in Entra ID login
    window.location.href = "/.auth/login/aad?post_login_redirect_uri=" + encodeURIComponent(window.location.pathname);
  }, []);

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
    // If on SWA, also clear the SWA auth session
    if (window.location.hostname !== "localhost") {
      window.location.href = "/.auth/logout?post_logout_redirect_uri=/login";
      return;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithMicrosoft, loginWithPin, joinSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
