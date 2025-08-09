import React, { useState } from "react";
import { LayoutWithFloatingBg } from "../../shared/ui/LayoutWithFloatingBg";

interface Activity {
  id: number;
  date: string;
  type: "Deposit" | "Withdrawal" | "Trade";
  amount: string;
  status: "Completed" | "Pending" | "Failed";
}

const mockActivity: Activity[] = [
  {
    id: 1,
    date: "Feb 20, 2025 14:45",
    type: "Deposit",
    amount: "0.5 BTC",
    status: "Completed",
  },
  {
    id: 2,
    date: "Feb 19, 2025 09:30",
    type: "Withdrawal",
    amount: "1.2 ETH",
    status: "Pending",
  },
  {
    id: 3,
    date: "Feb 18, 2025 22:10",
    type: "Trade",
    amount: "500 USDT",
    status: "Completed",
  },
  {
    id: 4,
    date: "Feb 17, 2025 17:05",
    type: "Deposit",
    amount: "0.1 BTC",
    status: "Failed",
  },
];

export function ActivityPage() {
  const [activities] = useState(mockActivity);

  return (
    <LayoutWithFloatingBg>
      <div className="container mx-auto px-6 py-8 flex-1 max-w-8xl text-white">
        <h1 className="text-4xl font-extrabold mb-6">Activity</h1>

        {/* Фильтры */}
        <div className="flex flex-wrap gap-4 mb-6">
          <input
            type="text"
            placeholder="Search"
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none"
          />
          <input
            type="date"
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none"
          />
          <input
            type="date"
            className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none"
          />
          <select className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none">
            <option>All</option>
            <option>Deposit</option>
            <option>Withdrawal</option>
            <option>Trade</option>
          </select>
          <select className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none">
            <option>10</option>
            <option>20</option>
            <option>50</option>
          </select>
        </div>

        {/* Таблица */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6">
          {activities.length > 0 ? (
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
                {activities.map((activity) => (
                  <tr key={activity.id} className="border-b border-white/10 hover:bg-white/10">
                    <td className="py-3 px-4 text-white">{activity.date}</td>
                    <td className="py-3 px-4 text-white">{activity.type}</td>
                    <td className="py-3 px-4 text-white">{activity.amount}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={activity.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-white/60">No results</p>
          )}
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

export default ActivityPage;
