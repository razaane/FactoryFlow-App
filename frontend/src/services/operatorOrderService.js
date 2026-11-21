import api from "./api";

// mes ordres: { data, meta }
export async function getMyOrders({ page = 1, limit = 10, status } = {}) {
  const params = { page, limit };

  if (status) {
    params.status = status;
  }

  const response = await api.get("/operator/orders", { params });
  return response.data;
}

export async function getMyOrder(id) {
  const response = await api.get(`/operator/orders/${id}`);
  return response.data.data;
}

export async function startOrder(id) {
  const response = await api.post(`/operator/orders/${id}/start`);
  return response.data.data;
}

export async function finishOrder(id) {
  const response = await api.post(`/operator/orders/${id}/finish`);
  return response.data.data;
}

// historique: { data, meta }
export async function getHistory({ page = 1, limit = 10 } = {}) {
  const response = await api.get("/operator/orders/history", {
    params: { page, limit }
  });
  return response.data;
}