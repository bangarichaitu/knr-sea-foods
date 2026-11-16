import { Routes, Route } from "react-router";
import { StockReport } from "./components/stockReports/StockReport";
import { StockInList } from "./components/stockins/StockInList";
import { StockOutList } from "./components/stockouts/StockOutList";
import { HotelList } from "./components/hotels/HotelList";
import { CategoryList } from "./components/categories/CategoryList";
import { UsersList } from "./components/users/UsersList";
import { CreateUser } from "./components/users/CreateUser";
import { ViewUser } from "./components/users/ViewUser";
import { Registration } from "./Registration";
import { Login } from "./Login";
import { Dashboard } from "./components/dashboard/Dashboard";
import { ProtectedRoutes } from "./routes/ProtectedRoutes";
import { PublicRoutes } from "./routes/PublicRoutes";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Profile } from "./components/dashboard/Profile";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { CompanyList } from "./components/companies/CompanyList";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<PublicRoutes />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/users" element={<UsersList />} />
              <Route path="/companies" element={<CompanyList />} />
              <Route path="/users/create" element={<CreateUser />} />
              <Route path="/users/:id/edit" element={<CreateUser />} />
              <Route path="/users/:id" element={<ViewUser />} />
              <Route path="/hotels" element={<HotelList />} />
              <Route path="/categories" element={<CategoryList />} />
              <Route path="/stockins" element={<StockInList />} />
              <Route path="/stockouts" element={<StockOutList />} />
              <Route path="/stockreports" element={<StockReport />} />
            </Route>
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
