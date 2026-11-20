
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Forbidden() {

  const { logout } = useAuth();

  return (
    <div className="auth-page">
      <div className="card">

        <h1>Accès refusé</h1>

        <p>
          Vous n'avez pas le droit d'accéder à cette page.
        </p>

        <Link to="/login">Retour</Link>

        <button onClick={logout}>
          Se déconnecter
        </button>

      </div>
    </div>
  );
}

export default Forbidden;
