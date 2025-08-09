import { useEffect, useState } from "react";
import { initKeycloak, login } from "../api";
import Button from "../../../shared/ui/Button";
import Input from "../../../shared/ui/Input";
import Card from "../../../shared/ui/Card";

const LoginForm = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initKeycloak().then(setIsAuthenticated);
  }, []);

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-center">🔑 Вход</h2>

      {isAuthenticated ? (
        <p className="text-green-600 text-center">✅ Уже авторизован</p>
      ) : (
        <>
          <Input label="Логин" type="text" placeholder="Введите логин" />
          <Input label="Пароль" type="password" placeholder="Введите пароль" />
          <Button onClick={login} className="w-full mt-4">
            Войти с Keycloak
          </Button>
        </>
      )}
    </Card>
  );
};

export default LoginForm;
