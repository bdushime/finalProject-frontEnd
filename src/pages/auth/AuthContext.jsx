import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "sonner";

const AuthContext = createContext(null);

// Helper: decode the JWT payload (returns null if not decodable).
const decodeToken = (token) => {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

// Helper: check if a JWT token is expired
const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now();
};

// Module-level helper so both the timer AND the Axios interceptor (via the
// "auth:force-logout" event below) can trigger a uniform logout flow.
const forceLogout = (reason) => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  if (reason) {
    try { toast.error(reason); } catch (_) { /* sonner may not be mounted yet */ }
  }
  if (typeof window !== "undefined") {
    // Small delay so the toast has a chance to render before the hard nav.
    setTimeout(() => { window.location.href = "/login"; }, 800);
  }
};

// Read + validate the stored session synchronously. Returns the user object if
// the token is still valid, or null otherwise (clearing storage in that case).
// Done outside the component so it can seed useState's initializer on the
// very first render — before ProtectedRoute checks for a user.
const hydrateStoredUser = () => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("token");
  if (isTokenExpired(token)) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
  const storedUser = localStorage.getItem("user");
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser);
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    return null;
  }
};

export function AuthProvider({ children }) {
  // Hydrate synchronously so a refresh on a protected route doesn't bounce to
  // /login during the first render. Previously this lived in a useEffect that
  // ran after ProtectedRoute had already redirected.
  const [user, setUser] = useState(hydrateStoredUser);

  // 2. Schedule a precise auto-logout at the token's exp time.
  // Re-runs whenever the user changes (e.g. on login), which picks up the
  // freshly-stored token and arms a new timer.
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem("token");
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return;

    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      setUser(null);
      forceLogout("Your session has expired. Please log in again.");
      return;
    }

    const timer = setTimeout(() => {
      setUser(null);
      forceLogout("Your session has expired. Please log in again.");
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [user]);

  // 3. Listen for force-logout events from the Axios interceptor
  // (fires when a 401 comes back from the API — i.e. the server rejected the token).
  useEffect(() => {
    const handler = (e) => {
      setUser(null);
      forceLogout(e?.detail?.reason || "Your session is invalid. Please log in again.");
    };
    window.addEventListener("auth:force-logout", handler);
    return () => window.removeEventListener("auth:force-logout", handler);
  }, []);

  const login = (userData) => {
    setUser(userData);
    // 👇 CHANGED: Save to 'user' to match Auth.jsx
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUser = (updates) => {
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      const nextUser = { ...prevUser, ...updates };
      localStorage.setItem("user", JSON.stringify(nextUser));
      return nextUser;
    });
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
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
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