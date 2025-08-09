import { makeAutoObservable } from "mobx";
import { fetchWallets } from "./api";

class WalletStore {
  wallets = [];

  constructor() {
    makeAutoObservable(this);
  }

  async loadWallets() {
    this.wallets = await fetchWallets();
  }
}

export const walletStore = new WalletStore();
