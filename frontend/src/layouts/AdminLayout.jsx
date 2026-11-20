import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const links = [
  { to: "/admin", label: "Tableau de bord", end: true },
  { to: "/admin/materials", label: "Matières premières" },
  { to: "/admin/products", label: "Produits" },
  { to: "/admin/orders", label: "Ordres" }
];

function AdminLayout() {
  return (
    <div className="layout">
      <Navbar links={links} />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;