const API_URL = import.meta.env.VITE_API_URL;
const handleResponse = async (response) => {
  const responseText = await response.text();

  let responseData = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  // Handle expired or revoked JWT
  const errorMessage =
    typeof responseData === "object" && responseData !== null
      ? responseData.error || responseData.message
      : "";

  const tokenExpired =
    response.status === 401 ||
    (typeof errorMessage === "string" &&
      /signature has expired|token has expired|revoked token|invalid token/i.test(
        errorMessage,
      ));

  if (tokenExpired) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";

    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    if (typeof responseData === "object" && responseData !== null) {
      throw responseData;
    }

    throw new Error(
      typeof responseData === "string" ? responseData : "Request failed",
    );
  }

  return responseData;
};

const request = async (endpoint, options = {}, token) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "ngrok-skip-browser-warning": "true",
    },
  });

  return handleResponse(response);
};

export const userService = {
  getUsers: (token, page, search) =>
    request(`/users?page=${page}&search=${search}`, { method: "GET" }, token),

  createUser: (data, token) =>
    request(
      "/users",
      {
        method: "POST",
        body: JSON.stringify({ user: data }),
      },
      token,
    ),

  getUser: (id, token) => request(`/users/${id}`, { method: "GET" }, token),

  updateUser: (id, data, token) =>
    request(
      `/users/${id}`,
      {
        method: "PUT",
        body: JSON.stringify({ user: data }),
      },
      token,
    ),

  deleteUser: (id, token) =>
    request(`/users/${id}`, { method: "DELETE" }, token),

  // Toggle Status
  toggleStatus: async (id, token) =>
    request(`/users/${id}/toggle_status`, { method: "PATCH" }, token),
};
