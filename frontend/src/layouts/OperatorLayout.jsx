import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const links = [
  { to: "/operator", label: "Mes ordres", end: true },
  { to: "/operator/history", label: "Historique" }
];

function OperatorLayout() {
  return (
    <div className="layout">
      <Navbar links={links} />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

export default OperatorLayout;