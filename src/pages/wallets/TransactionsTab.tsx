import React from "react";

interface Transaction {
  id: number;
  date: string;
  address: string;
  txId: string;
  status: "Rejected" | "Pending" | "Confirmed";
  amount: string;
  details?: string;
}

interface TransactionsTabProps {
  transactions: Transaction[];
  expandedTxIds: number[];
  toggleExpand: (txId: number) => void;
}

export function TransactionsTab({ transactions, expandedTxIds, toggleExpand }: TransactionsTabProps) {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 mt-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-white/20 text-white uppercase">
            <th className="py-3 px-4 text-left font-semibold">Date</th>
            <th className="py-3 px-4 text-left font-semibold">Address / TxID</th>
            <th className="py-3 px-4 text-left font-semibold">Status</th>
            <th className="py-3 px-4 text-left font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => {
            const isExpanded = expandedTxIds.includes(tx.id);
            return (
              <React.Fragment key={tx.id}>
                <tr
                  className="border-b border-white/10 hover:bg-white/10 cursor-pointer"
                  onClick={() => toggleExpand(tx.id)}
                >
                  <td className="py-3 px-4 text-white">{tx.date}</td>
                  <td className="py-3 px-4 text-white">{tx.address}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="py-3 px-4 text-white">{tx.amount}</td>
                </tr>
                {isExpanded && (
                  <tr className="bg-white/10">
                    <td colSpan={4} className="py-3 px-4 text-white">{tx.details}</td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* Бейдж статуса */
function StatusBadge({ status }: { status: string }) {
  const colors = { Rejected: "bg-red-500", Pending: "bg-yellow-500", Confirmed: "bg-green-500" };
  return <span className={`px-3 py-1 text-white rounded-full ${colors[status as keyof typeof colors]}`}>{status}</span>;
}

export default TransactionsTab;
