import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import backend from "~backend/client";

interface User {
  id: number;
  email: string;
  username: string;
  displayName: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  register: (email: string, username: string, displayName: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("comic-user");
    if (stored) {
      setUser(JSON.parse(stored));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string) => {
    const response = await backend.auth.login({ email });
    const userData = {
      id: response.id,
      email: response.email,
      username: response.username,
      displayName: response.displayName,
      token: response.token,
    };
    setUser(userData);
    localStorage.setItem("comic-user", JSON.stringify(userData));
  };

  const register = async (email: string, username: string, displayName: string) => {
    const response = await backend.auth.register({ email, username, displayName });
    const userData = {
      id: response.id,
      email: response.email,
      username: response.username,
      displayName: response.displayName,
      token: response.token,
    };
    setUser(userData);
    localStorage.setItem("comic-user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("comic-user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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

export function useBackend() {
  return backend;
}
