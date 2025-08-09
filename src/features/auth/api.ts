import Keycloak from "keycloak-js";

export const keycloak = new Keycloak({
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
});

// Инициализация БЕЗ флагов. Просто экспортируем функцию.
export function initKeycloak() {
  return keycloak.init({
    onLoad: "check-sso",
    checkLoginIframe: false,
    pkceMethod: "S256",
  });
}

// Логин
export function login() {
  // Без повторной инициализации. Просто keycloak.login().
  return keycloak.login({ redirectUri: window.location.origin + "/home" });
}

// Logout
export function logout() {
  return keycloak.logout({ redirectUri: window.location.origin });
}

// Получить текущий токен
export function getToken() {
  return keycloak.token;
}

export default keycloak;
