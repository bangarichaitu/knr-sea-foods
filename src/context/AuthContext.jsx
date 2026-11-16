import { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      getProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const apiResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          method: "Get",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (apiResponse.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        setUser(null);
        setLoading(false);
        return;
      }
      const response = await apiResponse.json();
      console.log(response, "response");
      setUser(response.user);
      setLoading(false);
    } catch (error) {
      console.error("Profile error", error);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      const apiResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/logout`,
        {
          method: "Delete",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "true",
          },
        },
      );
      if (apiResponse.status === 200) {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
      }
    } catch (error) {
      console.error("Profile error", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, logout, getProfile, token, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
