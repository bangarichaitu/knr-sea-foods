import { useNavigate } from "react-router";

export const BackButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded cursor-pointer"
    >
      Back
    </button>
  );
};
