import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { initKeycloak, keycloak } from "../features/auth/api";

import { observer } from "mobx-react-lite";
import { natsStore } from "../shared/nats/model";
import { NatsBridge } from "../shared/nats/NatsBridge";
import ChatPage from "../pages/chat/ChatPage";
import { SendBox } from "../shared/nats/SendBox";
import { NatsLogPanel } from "../shared/nats/NatsLogPanel";

// Пример: храним состояние в самом App
function App() {
  const [isKeycloakReady, setIsKeycloakReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initKeycloak()
      .then((authenticated) => {
        console.log("✅ Keycloak init:", authenticated);
        setIsKeycloakReady(true);
        setIsAuthenticated(authenticated || false);
      })
      .catch((err) => {
        console.error("Keycloak init error:", err);
        setIsKeycloakReady(true);
        setIsAuthenticated(false);
      });

    // При успешном логине Keycloak сам обновит token
    keycloak.onAuthSuccess = () => {
      console.log("✅ onAuthSuccess: token=", keycloak.token);
      setIsAuthenticated(true);
    };

    // При логауте
    keycloak.onAuthLogout = () => {
      console.log("🔴 onAuthLogout");
      setIsAuthenticated(false);
    };
  }, []);

  // Пока Keycloak не готов — показываем "загрузка"
  if (!isKeycloakReady) {
    return (
      <div>
        <h1 className="text-red-500 text-4xl">Проверка Tailwind</h1>
        Загрузка Keycloak...
      </div>
    );
  }

  return (
    <Router>
      {isAuthenticated && <NatsBridge />}
      <Routes>
        {/* Единственная страница: Chat как корень */}
        <Route path="/" element={<ChatPage />} />
      </Routes>
      {/* Вспомогательные виджеты остаются неблокирующими */}
      {isAuthenticated && natsStore.connected && <NatsLogPanel />}
      {isAuthenticated && natsStore.connected && <SendBox />}
    </Router>
  );
}

export default observer(App);
