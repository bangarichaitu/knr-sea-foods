import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const response = error.response;

    const errorMessage =
      response?.data?.error ||
      response?.data?.message ||
      response?.data?.errors?.join(" ") ||
      "";

    const tokenExpired =
      response?.status === 401 ||
      (typeof errorMessage === "string" &&
        /signature has expired|token has expired|revoked token|invalid token/i.test(
          errorMessage,
        ));

    if (tokenExpired) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(new Error("Session expired. Please log in again."));
    }

    return Promise.reject(error);
  },
);

export default api;
