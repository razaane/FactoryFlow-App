import { useState } from "react";
import { AuthContext } from "./authContext";
import * as authService from "../services/authService";

// FP-85: récupérer la session ouverte si la page est rechargée
function readSavedUser() {
  try {
    const saved = sessionStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readSavedUser);

  async function login(email, password) {
    const data = await authService.login(email, password);

    sessionStorage.setItem("token", data.token);

    // si la réponse ne contient pas l'utilisateur, on le demande à /auth/me
    const loggedUser = data.user || (await authService.getProfile());

    sessionStorage.setItem("user", JSON.stringify(loggedUser));
    setUser(loggedUser);

    return loggedUser;
  }

  // FP-86: la déconnexion termine la session
  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}