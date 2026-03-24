import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { MsalProvider, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { msalInstance, initializeMsal } from "../services/auth";
import type { AppUser, AppRole } from "../types";

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function AuthContextInner({ children }: { children: ReactNode }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && accounts.length > 0) {
      const account = accounts[0];
      // TODO: Determine role from Azure AD groups or a roles list
      const role: AppRole = "facilitator";
      setUser({
        id: account.localAccountId,
        displayName: account.name || "",
        email: account.username,
        role,
        isAuthenticated: true,
      });
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [isAuthenticated, accounts]);

  const login = async () => {
    try {
      await instance.loginPopup({ scopes: ["User.Read"] });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const logout = async () => {
    try {
      await instance.logoutPopup();
      setUser(null);
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [msalReady, setMsalReady] = useState(false);

  useEffect(() => {
    initializeMsal().then(() => setMsalReady(true));
  }, []);

  if (!msalReady) {
    return <div>Loading...</div>;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <AuthContextInner>{children}</AuthContextInner>
    </MsalProvider>
  );
}
