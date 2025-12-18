"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, api } from "@/lib/mock-db";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (u: string, p: string) => Promise<boolean>;
  register: (u: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("mock_user");
    if (stored) setUser(JSON.parse(stored));
    setIsLoading(false);
  }, []);

  const login = async (u: string, p: string) => {
    const foundUser = await api.login(u, p);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("mock_user", JSON.stringify(foundUser));
      // Refresh to ensure state updates everywhere
      router.refresh(); 
      return true;
    }
    return false;
  };

  const register = async (u: string, p: string) => {
    await api.register(u, p);
    // Auto-login logic could go here
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock_user");
    localStorage.removeItem("access_token");
    
    // FIX: Redirect to Home instead of /auth/login
    router.push("/"); 
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};