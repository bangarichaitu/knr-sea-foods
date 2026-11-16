import api from "../Api";

const stockOutTransactionService = {
  getAll: (token, filters = {}) =>
    api.get("/stock_outs", {
      headers: { Authorization: `Bearer ${token}` },
      params: filters,
    }),

  create: (token, data) =>
    api.post("/stock_outs", data, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export default stockOutTransactionService;
