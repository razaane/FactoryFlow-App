import api from "./api";

// liste des opérateurs pour l'affectation des ordres
export async function getOperators() {
  const response = await api.get("/users", {
    params: { role: "Operateur", limit: 100 }
  });
  return response.data.items;
}