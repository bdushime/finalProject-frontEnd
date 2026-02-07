import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role: "Student" | "IT" | "Admin" | "Security", ... }

  // 1. Load auth state from localStorage on mount
  useEffect(() => {
    // 👇 CHANGED: Key must match what you used in Auth.jsx ('user')
    const storedUser = localStorage.getItem("user"); 
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        // If JSON is broken, clear everything
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    // 👇 CHANGED: Save to 'user' to match Auth.jsx
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // 👇 CHANGED: Clear 'user' AND 'token' so you are fully logged out
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    
    // Optional: Redirect to login immediately if needed
    window.location.href = "/"; 
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}