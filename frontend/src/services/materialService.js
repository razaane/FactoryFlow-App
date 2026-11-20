import api from "./api";

// liste paginée: { items, pagination }
export async function getMaterials({ page = 1, limit = 10, search = "" } = {}) {
  const params = { page, limit };

  if (search) {
    params.search = search;
  }

  const response = await api.get("/raw-materials", { params });
  return response.data;
}

export async function getMaterial(id) {
  const response = await api.get(`/raw-materials/${id}`);
  return response.data.data;
}

export async function createMaterial(data) {
  const response = await api.post("/raw-materials", data);
  return response.data.data;
}

export async function updateMaterial(id, data) {
  const response = await api.put(`/raw-materials/${id}`, data);
  return response.data.data;
}

export async function addStockEntry(id, quantity) {
  const response = await api.post(`/raw-materials/${id}/stock-entries`, {
    quantity
  });
  return response.data.data;
}

// historique: { data, pagination }
export async function getMovements({ material, type, page = 1, limit = 10 } = {}) {
  const params = { page, limit };

  if (material) params.material = material;
  if (type) params.type = type;

  const response = await api.get("/stock-movements", { params });
  return response.data;
}