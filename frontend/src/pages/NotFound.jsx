
import { Link } from "react-router-dom";

function NotFound() {

  return (
    <div className="auth-page">

      <div className="card">

        <h1>404</h1>

        <p>Page introuvable.</p>

        <Link to="/login">
          Retour à la connexion
        </Link>

      </div>

    </div>
  );
}

export default NotFound;
