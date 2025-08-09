// features/auth/PrivateRoute.tsx
import { Navigate, Outlet } from "react-router-dom";

interface PrivateRouteProps {
  isAuthenticated: boolean;
}

export const PrivateRoute = ({ isAuthenticated }: PrivateRouteProps) => {
  // Если не залогинен — редирект на "/"
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  // Иначе показываем дочерний роут (Home)
  return <Outlet />;
};
