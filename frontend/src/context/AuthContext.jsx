
import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  // Restore the user when the page is refreshed
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user");

    return saved ? JSON.parse(saved) : null;
  });

  // Login function
  async function login(email, password) {

    const response = await api.post("/auth/login", {
      email,
      password
    });

    // Support root response or nested data response
    const data = response.data.data || response.data;

    if (!data.token || !data.user) {
      throw new Error("Format de réponse du serveur invalide");
    }

    // Save authentication information for this tab session
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);

    return data.user;
  }

  // Logout function
  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook
export function useAuth() {
  return useContext(AuthContext);
}
