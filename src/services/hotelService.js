import api from "../Api";

const hotelService = {
  getAll: (token) =>
    api.get("/hotels", {
      headers: { Authorization: `Bearer ${token}` },
    }),

  getById: (token, id) =>
    api.get(`/hotels/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  create: (token, data) =>
    api.post("/hotels", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  update: (token, id, data) =>
    api.put(`/hotels/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // delete: (token, id) =>
  //   api.delete(`/hotels/${id}`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }),
  toggleStatus: (token, id) =>
    api.patch(`/hotels/${id}/toggle_status`, null, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default hotelService;
