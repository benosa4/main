import { Navigate } from "react-router-dom";

import LoginForm from "./LoginForm";

interface AuthPageProps {
  isAuthenticated: boolean;
}

export const AuthPage = ({ isAuthenticated }: AuthPageProps) => {
  // Если уже залогинен — сразу идём на /home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <LoginForm />;
};

export default AuthPage;