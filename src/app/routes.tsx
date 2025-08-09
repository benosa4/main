import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthPage } from "../pages/auth";
import { PrivateRoute } from "../features/auth";
import ChatPage from "../pages/chat/ChatPage";

const AppRoutes = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<AuthPage isAuthenticated={isAuthenticated} />}
        />
        <Route element={<PrivateRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
