import { Routes, Route } from "react-router-dom";
import HomeRedirect from "./components/HomeRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import OperatorLayout from "./layouts/OperatorLayout";
import Dashboard from "./pages/admin/Dashboard";
import MaterialDetail from "./pages/admin/MaterialDetail";
import Materials from "./pages/admin/Materials";
import OrderCreate from "./pages/admin/OrderCreate";
import OrderDetail from "./pages/admin/OrderDetail";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Install from "./pages/Install";
import Login from "./pages/Login";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";
import History from "./pages/operator/History";
import MyOrders from "./pages/operator/MyOrders";
import OperatorOrderDetail from "./pages/operator/OperatorOrderDetail";
import { ROLES } from "./utils/roles";

function App() {
  return (
    <Routes>
      {/* routes publiques */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/install" element={<Install />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* espace Admin (routes imbriquées) */}
      <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="materials" element={<Materials />} />
          <Route path="materials/:id" element={<MaterialDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/new" element={<OrderCreate />} />
          <Route path="orders/:id" element={<OrderDetail />} />
        </Route>
      </Route>

      {/* espace Opérateur (routes imbriquées) */}
      <Route element={<ProtectedRoute roles={[ROLES.OPERATOR]} />}>
        <Route path="/operator" element={<OperatorLayout />}>
          <Route index element={<MyOrders />} />
          <Route path="orders/:id" element={<OperatorOrderDetail />} />
          <Route path="history" element={<History />} />
        </Route>
      </Route>

      {/* URL inconnue */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;