import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// links = [{ to, label, end }]
function Navbar({ links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="navbar">
      <strong className="brand">FactoryFlow</strong>

      <nav className="nav-links">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-user">
        <span>{user?.name || user?.email}</span>
        <button type="button" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </header>
  );
}

export default Navbar;