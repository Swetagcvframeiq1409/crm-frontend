"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { DEMO_USERS } from "@/data/users";

const AuthContext = createContext(null);

const SESSION_KEY = "crm_session";

/** Derives display-friendly fields from a stored user record. */
function deriveUser(u) {
  const parts = u.name.trim().split(" ");
  return {
    id: u.id,
    name: u.name,
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
    initials: parts.map((p) => p[0]).slice(0, 2).join("").toUpperCase(),
    email: u.email,
    role: u.role,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [ready, setReady] = useState(false);

  // Restore session on mount before any render-gated redirect fires
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage is only available in the browser.
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  function login(email, password) {
    const match = DEMO_USERS.find(
      (u) =>
        u.email.trim().toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );
    if (!match) return { success: false, error: "Invalid email or password." };

    const derived = deriveUser(match);
    setUser(derived);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(derived));
    return { success: true };
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, loggedIn: !!user, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
