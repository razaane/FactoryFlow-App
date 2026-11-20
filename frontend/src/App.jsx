import { Routes, Route } from "react-router-dom";
import HomeRedirect from "./components/HomeRedirect";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import OperatorLayout from "./layouts/OperatorLayout";
import Install from "./pages/Install";
import Login from "./pages/Login";
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";
import { ROLES } from "./utils/roles";
import Materials from "./pages/admin/Materials";
import MaterialDetail from "./pages/admin/MaterialDetail";
import Products from "./pages/admin/Products";

// placeholder: kaytbeddel b les vraies pages f les tickets jayin
function Placeholder({ title }) {
  return <h1>{title}</h1>;
}

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
          <Route index element={<Placeholder title="Tableau de bord" />} />
          <Route path="materials" element={<Materials />} />
          <Route path="materials/:id" element={<MaterialDetail />} />
          <Route path="products" element={<Products />} />
        </Route>
      </Route>

      {/* espace Opérateur (routes imbriquées) */}
      <Route element={<ProtectedRoute roles={[ROLES.OPERATOR]} />}>
        <Route path="/operator" element={<OperatorLayout />}>
          <Route index element={<Placeholder title="Mes ordres" />} />
        </Route>
      </Route>

      {/* URL inconnue */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;