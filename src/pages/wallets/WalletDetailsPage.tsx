import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LayoutWithFloatingBg } from "../../shared/ui/LayoutWithFloatingBg";
import TransactionsTab from "./TransactionsTab";
import SignMessageTab from "./SignMessageTab";
import SettingsTab from "./SettingsTab";


interface Transaction {
  id: number;
  date: string;
  address: string;
  txId: string;
  status: "Rejected" | "Pending" | "Confirmed";
  amount: string;
  details?: string;
}

export function WalletDetailsPage() {
  const navigate = useNavigate();

  const wallet = {
    name: "MyBTC Wallet",
    total: "1.2345 BTC",
    locked: "0.05 BTC",
  };

  const [transactions] = useState<Transaction[]>([
    {
      id: 1,
      date: "Sep 12, 2023 15:30",
      address: "1A2b3C4D5E6F...",
      txId: "abcd1234",
      status: "Rejected",
      amount: "0.1 BTC",
      details: "Fee: 0.0005 BTC\nBlock: #123456\nMore info...",
    },
    {
      id: 2,
      date: "Sep 11, 2023 10:15",
      address: "1QWErty1234...",
      txId: "efgh5678",
      status: "Pending",
      amount: "0.05 BTC",
      details: "Fee: 0.0002 BTC\nBlock: #123450\nMore info...",
    },
    {
      id: 3,
      date: "Sep 10, 2023 08:45",
      address: "1ZxCvBnM0987...",
      txId: "ijkl9012",
      status: "Confirmed",
      amount: "0.3 BTC",
      details: "Fee: 0.0001 BTC\nBlock: #123440\nMore info...",
    },
  ]);

  const [activeTab, setActiveTab] = useState<"transactions" | "sign" | "settings">("transactions");
  const [expandedTxIds, setExpandedTxIds] = useState<number[]>([]);

  function handleTabChange(tab: "transactions" | "sign" | "settings") {
    setActiveTab(tab);
  }

  function toggleExpand(txId: number) {
    setExpandedTxIds((prev) =>
      prev.includes(txId) ? prev.filter((id) => id !== txId) : [...prev, txId]
    );
  }

  return (
    <LayoutWithFloatingBg>
      <div className="container mx-auto px-6 py-8 flex-1 text-white">
        {/* Кнопка "Назад" */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-white flex items-center space-x-2 bg-white/10 hover:bg-white/20 transition-all px-3 py-2 rounded-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </button>

        {/* Заголовок кошелька + кнопки */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold">{wallet.name}</h1>
            <p className="text-white/80 mt-2">
              Total: <span className="font-semibold">{wallet.total}</span> | Locked:{" "}
              <span className="font-semibold">{wallet.locked}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate("/send-transaction")}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg shadow-lg transition-transform hover:scale-105"
            >
              Send
            </button>
            <button
              onClick={() => navigate("/receive-transaction")}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-lg transition-transform hover:scale-105"
            >
              Receive
            </button>
          </div>
        </div>

        {/* Вкладки */}
        <div className="flex gap-6 border-b border-white/20 pb-2">
          <button
            onClick={() => handleTabChange("transactions")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "transactions" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => handleTabChange("sign")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "sign" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Sign a message
          </button>
          <button
            onClick={() => handleTabChange("settings")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "settings" ? "bg-white/20 text-white" : "text-white/50 hover:text-white"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Вкладки */}
        {activeTab === "transactions" && (
          <TransactionsTab transactions={transactions} expandedTxIds={expandedTxIds} toggleExpand={toggleExpand} />
        )}
        {activeTab === "sign" && <SignMessageTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </LayoutWithFloatingBg>
  );
}

export default WalletDetailsPage;