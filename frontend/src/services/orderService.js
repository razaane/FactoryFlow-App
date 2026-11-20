import api from "./api";

// liste paginée: { data, meta }
export async function getOrders({
  page = 1,
  limit = 10,
  status,
  product,
  search,
  from,
  to
} = {}) {
  const params = { page, limit };

  if (status) params.status = status;
  if (product) params.product = product;
  if (search) params.search = search;
  if (from) params.from = from;
  if (to) params.to = to;

  const response = await api.get("/production-orders", { params });
  return response.data;
}

export async function getOrder(id) {
  const response = await api.get(`/production-orders/${id}`);
  return response.data.data;
}

// payload = { items: [{ product, quantity }], assignedTo }
export async function createOrder(payload) {
  const response = await api.post("/production-orders", payload);
  return response.data.data;
}

export async function updateOrder(id, payload) {
  const response = await api.put(`/production-orders/${id}`, payload);
  return response.data.data;
}

export async function cancelOrder(id) {
  const response = await api.post(`/production-orders/${id}/cancel`);
  return response.data.data;
}