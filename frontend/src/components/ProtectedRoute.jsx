import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// roles = ["Admin"] wla ["Operateur"]
function ProtectedRoute({ roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;