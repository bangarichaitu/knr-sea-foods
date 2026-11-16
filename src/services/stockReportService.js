import api from "../Api";

const stockReportService = {
  getAll: (token, filters = {}) =>
    api.get("/stock_report", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: filters,
    }),
};

export default stockReportService;
