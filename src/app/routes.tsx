import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthPage } from "../pages/auth";
import { PrivateRoute } from "../features/auth";
import Home from "../pages/home/Home";
import Wallets from "../pages/wallets/Wallets";

const AppRoutes = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<AuthPage isAuthenticated={isAuthenticated} />}
        />
        <Route
          element={<PrivateRoute isAuthenticated={isAuthenticated} />}
        >
          <Route path="/home" element={<Home />} />
          <Route path="/wallets" element={<Wallets />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
