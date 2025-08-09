export const fetchWallets = async () => {
    const response = await fetch("/api/wallets");
    return response.json();
  };
  