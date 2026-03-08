import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  TenantUser,
  StoreConfig,
  getCurrentUser,
  login as storageLogin,
  signup as storageSignup,
  logout as storageLogout,
  getUserStore,
} from "@/lib/multiTenantStorage";

interface AuthContextType {
  user: TenantUser | null;
  store: StoreConfig | null;
  isLoading: boolean;
  login: (email: string, password: string) => TenantUser;
  signup: (email: string, password: string, name: string) => TenantUser;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<TenantUser | null>(null);
  const [store, setStore] = useState<StoreConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const u = getCurrentUser();
    setUser(u);
    if (u?.storeId) {
      setStore(getUserStore(u.id) || null);
    } else {
      setStore(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    setIsLoading(false);
  }, [refreshUser]);

  const login = useCallback((email: string, password: string) => {
    const u = storageLogin(email, password);
    setUser(u);
    if (u.storeId) {
      setStore(getUserStore(u.id) || null);
    }
    return u;
  }, []);

  const signup = useCallback((email: string, password: string, name: string) => {
    const u = storageSignup(email, password, name);
    setUser(u);
    setStore(null);
    return u;
  }, []);

  const logout = useCallback(() => {
    storageLogout();
    setUser(null);
    setStore(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, store, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
