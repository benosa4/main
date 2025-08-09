import { makeAutoObservable } from "mobx";
import keycloak, { initKeycloak } from "./api";

class AuthStore {
  isAuthenticated = false;
  token: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async initializeAuth() {
    try {
      this.isAuthenticated = await initKeycloak();
      this.token = keycloak.token || null;

      keycloak.onTokenExpired = () => {
        this.updateToken();
      };
    } catch (error) {
      console.error("Keycloak initialization failed", error);
      this.isAuthenticated = false;
      this.token = null;
    }
  }

  updateToken = async () => {
    try {
      const refreshed = await keycloak.updateToken(30);

      if (refreshed) {
        this.token = keycloak.token || null;
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
        this.token = null;
      }
    } catch (error) {
      console.error("Failed to refresh token", error);
      this.isAuthenticated = false;
      this.token = null;
    }
  };

  login() {
    keycloak.login();
  }

  logout() {
    keycloak.logout();
    this.isAuthenticated = false;
    this.token = null;
  }
}

export const authStore = new AuthStore();
