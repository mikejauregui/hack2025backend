import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";
import { useLocation } from "wouter";

interface User {
  id: string;
  email: string;
  name: string;
  email_verified: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signin: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  signout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("session_token"));
  const [loading, setLoading] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const refreshUser = async () => {
    try {
      const res = await api.get("/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token invalid
        logoutCleanup();
      }
    } catch (error) {
      console.error("Failed to fetch user", error);
      logoutCleanup();
    } finally {
      setLoading(false);
    }
  };

  const logoutCleanup = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("session_token");
  };

  const signin = async (email: string, password: string) => {
    const res = await api.post("/auth/signin", { email, password });
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to sign in");
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("session_token", data.token);
  };

  const signup = async (formData: any) => {
    const res = await api.post("/auth/signup", formData);
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to sign up");
    }
    const data = await res.json();
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("session_token", data.token);
  };

  const signout = async () => {
    try {
        await api.post("/auth/signout", {});
    } catch (e) {
        console.error("Logout error", e);
    }
    logoutCleanup();
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user, signin, signup, signout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
