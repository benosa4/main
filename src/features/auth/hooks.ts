import { useEffect, useState } from "react";
import { autorun } from "mobx";
import { authStore } from "./model";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authStore.isAuthenticated);
  const [token, setToken] = useState(authStore.token);

  useEffect(() => {
    authStore.initializeAuth();

    const dispose = autorun(() => {
      setIsAuthenticated(authStore.isAuthenticated);
      setToken(authStore.token);
    });

    return () => dispose();
  }, []);

  return { isAuthenticated, token, login: authStore.login, logout: authStore.logout };
};
