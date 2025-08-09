import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ChatPage from "../pages/chat/ChatPage";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/" element={<ChatPage />} />
    </Routes>
  </Router>
);

export default AppRoutes;
