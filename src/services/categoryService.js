import api from "../Api";

const categoryService = {
  getAll: (token) =>
    api.get("/categories", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getById: (token, id) =>
    api.get(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (token, data) =>
    api.post("/categories", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (token, id, data) =>
    api.put(`/categories/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  delete: (token, id) =>
    api.delete(`/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default categoryService;
