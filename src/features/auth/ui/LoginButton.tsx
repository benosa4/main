import Button from "../../../shared/ui/Button";
import { login } from "../api";

const LoginButton = () => {
  return (
    <Button onClick={login} variant="primary">
      Войти с Keycloak
    </Button>
  );
};

export default LoginButton;
