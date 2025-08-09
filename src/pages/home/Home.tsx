import React from "react";
import { useNavigate } from "react-router-dom";
import { LayoutWithFloatingBg } from "../../shared/ui/LayoutWithFloatingBg";

const mockTransactions = [
  { id: 1, date: "Feb 20, 2025", type: "Deposit", amount: "0.5 BTC", status: "Completed" },
  { id: 2, date: "Feb 19, 2025", type: "Withdrawal", amount: "1.2 ETH", status: "Pending" },
  { id: 3, date: "Feb 18, 2025", type: "Trade", amount: "500 USDT", status: "Completed" },
  { id: 4, date: "Feb 17, 2025", type: "Deposit", amount: "0.1 BTC", status: "Failed" },
];

export function HomePage() {
  const navigate = useNavigate();

  return (
    <LayoutWithFloatingBg>
      <div className="container mx-auto px-6 py-8 flex-1 text-white text-center">
        {/* Баланс */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-extrabold mb-2">Total Balance</h1>
          <p className="text-4xl font-bold text-green-400">1.7345 BTC</p>
          <p className="text-lg text-white/80">≈ 67,500 USD</p>
        </div>

        {/* Быстрые кнопки */}
        <div className="flex justify-center gap-6 mb-8">
          <button
            onClick={() => navigate("/send-transaction")}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Send
          </button>
          <button
            onClick={() => navigate("/receive-transaction")}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Receive
          </button>
          <button
            onClick={() => navigate("/swap")}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg shadow-lg transition-transform hover:scale-105"
          >
            Swap
          </button>
        </div>

        {/* Последние транзакции */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Recent Transactions</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/20 text-white uppercase">
                <th className="py-3 px-4 text-left font-semibold">Date</th>
                <th className="py-3 px-4 text-left font-semibold">Type</th>
                <th className="py-3 px-4 text-left font-semibold">Amount</th>
                <th className="py-3 px-4 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/10 hover:bg-white/10">
                  <td className="py-3 px-4 text-white">{tx.date}</td>
                  <td className="py-3 px-4 text-white">{tx.type}</td>
                  <td className="py-3 px-4 text-white">{tx.amount}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={tx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Уведомления */}
        <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-6 py-4 rounded-lg text-center">
          ⚠️ Reminder: Enable 2FA for better security.
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
}

function StatusBadge({ status }: { status: "Completed" | "Pending" | "Failed" }) {
  const colors = {
    Completed: "bg-green-500",
    Pending: "bg-yellow-500",
    Failed: "bg-red-500",
  };
  return <span className={`px-3 py-1 text-white rounded-full ${colors[status]}`}>{status}</span>;
}

export default HomePage;
