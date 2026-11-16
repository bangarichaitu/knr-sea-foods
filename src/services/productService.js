import api from "../Api";
const productService = {
  getProducts: async (token) => {
    const response = await api.get("/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product) => {
    const response = await api.post("/products", {
      product,
    });
    return response.data;
  },

  updateProduct: async (id, product) => {
    const response = await api.put(`/products/${id}`, {
      product,
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};

export default productService;
