import api from "./api";

export async function login(email, password) {
  const response = await api.post("/auth/login", { email, password });
  // tolérant: { token, user } wla { data: { token, user } }
  return response.data.data || response.data;
}

export async function getProfile() {
  const response = await api.get("/auth/me");
  const body = response.data.data || response.data;
  return body.user || body;
}