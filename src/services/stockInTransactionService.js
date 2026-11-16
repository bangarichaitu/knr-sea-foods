import api from "../Api";

const stockInTransactionService = {
  getAll: (token, filters = {}) =>
    api.get("/stock_ins", {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    }),

  create: (token, data) =>
    api.post("/stock_ins", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default stockInTransactionService;
