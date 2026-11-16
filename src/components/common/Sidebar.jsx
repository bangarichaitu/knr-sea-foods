import { NavLink } from "react-router";

export const Sidebar = () => {
  return (
    <aside className="w-60 bg-gray-900 text-white min-h-screen p-4">
      <img src="/src/assets/seafood.jpg" alt="KNR SEA FOODS" />

      {/* Divider */}
      <div className="border-b border-gray-700 mb-4"></div>

      <nav>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Dashboard{" "}
        </NavLink>
        <NavLink
          to="/users"
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Users
        </NavLink>
        <NavLink
          to="/companies"
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Companies
        </NavLink>
        <NavLink
          to="/hotels"
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Hotels
        </NavLink>
        <NavLink
          to="/categories"
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Categories
        </NavLink>

        <NavLink
          to="/stockins"
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Stock Ins
        </NavLink>
        <NavLink
          to="/stockouts"
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Stock Outs
        </NavLink>
        <NavLink
          to="/stockreports"
          className={({ isActive }) =>
            `block rounded px-3 py-2 my-1 ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`
          }
        >
          {" "}
          Stock Reports
        </NavLink>
      </nav>
    </aside>
  );
};
