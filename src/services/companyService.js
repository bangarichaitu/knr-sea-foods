import api from "../Api";

const companyService = {
  getAll: (token) =>
    api.get("/companies", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getById: (token, id) =>
    api.get(`/companies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (token, data) =>
    api.post("/companies", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (token, id, data) =>
    api.put(`/companies/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // delete: (token, id) =>
  //   api.delete(`/companies/${id}`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }),
  toggleStatus: (token, id) =>
    api.patch(`/companies/${id}/toggle_status`, null, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default companyService;
