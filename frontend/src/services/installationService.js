import api from "./api";

export async function getInstallationStatus() {
  const response = await api.get("/installation/status");
  return response.data.data || response.data;
}

export async function installApp({ name, email, password }) {
  const response = await api.post("/installation", { name, email, password });
  return response.data;
}