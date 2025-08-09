import { useEffect, useState } from "react";
import { walletStore } from "./model";

export const useWallets = () => {
  const [wallets, setWallets] = useState(walletStore.wallets);

  useEffect(() => {
    walletStore.loadWallets().then(() => {
      setWallets(walletStore.wallets);
    });
  }, []);

  return wallets;
};
