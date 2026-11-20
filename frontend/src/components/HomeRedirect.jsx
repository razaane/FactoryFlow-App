import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getInstallationStatus } from "../services/installationService";
import { getErrorMessage } from "../utils/getErrorMessage";
import { getHomePath } from "../utils/roles";

function HomeRedirect() {
  const { user } = useAuth();
  const [target, setTarget] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) return;

    let cancelled = false;

    getInstallationStatus()
      .then((status) => {
        if (!cancelled) setTarget(status.installed ? "/login" : "/install");
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (user) {
    return <Navigate to={getHomePath(user.role)} replace />;
  }

  if (error) {
    return (
      <div className="auth-page">
        <div className="card">
          <p className="error" role="alert">{error}</p>
        </div>
      </div>
    );
  }

  if (!target) {
    return <p className="center-text">Chargement...</p>;
  }

  return <Navigate to={target} replace />;
}

export default HomeRedirect;