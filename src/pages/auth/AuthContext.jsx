import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { role: "Student" | "IT" | "Admin" | "Security", ... }

  // Helper: check if a JWT token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp is in seconds, Date.now() is in milliseconds
      return payload.exp * 1000 < Date.now();
    } catch {
      return true; // If we can't decode it, treat as expired
    }
  };

  // 1. Load auth state from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    // TODO: Re-enable token expiry check after testing
    const token = localStorage.getItem("token");
    if (isTokenExpired(token)) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      return;
    }

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

  // 2. Periodically check token expiry (every 60 seconds)
  // TODO: Re-enable after testing
  // useEffect(() => {
  //   const checkExpiry = () => {
  //     const token = localStorage.getItem("token");
  //     if (token && isTokenExpired(token)) {
  //       setUser(null);
  //       localStorage.removeItem("user");
  //       localStorage.removeItem("token");
  //       window.location.href = "/login";
  //     }
  //   };
  //   const interval = setInterval(checkExpiry, 60000);
  //   return () => clearInterval(interval);
  // }, []);

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