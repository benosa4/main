import { Navigate } from "react-router-dom";

import LoginForm from "./LoginForm";

interface AuthPageProps {
  isAuthenticated: boolean;
}

export const AuthPage = ({ isAuthenticated }: AuthPageProps) => {
  // Если уже залогинен — сразу идём в /chat
  if (isAuthenticated) {
    return <Navigate to="/chat" replace />;
  }

  return <LoginForm />;
};

export default AuthPage;
