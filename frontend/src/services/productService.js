import api from "./api";

// liste paginée: { data, pagination }
export async function getProducts({ page = 1, limit = 10, search = "" } = {}) {
  const params = { page, limit };

  if (search) {
    params.search = search;
  }

  const response = await api.get("/products", { params });
  return response.data;
}

export async function getProduct(id) {
  const response = await api.get(`/products/${id}`);
  return response.data.data;
}

export async function createProduct(data) {
  const response = await api.post("/products", data);
  return response.data.data;
}

export async function updateProduct(id, data) {
  const response = await api.put(`/products/${id}`, data);
  return response.data.data;
}