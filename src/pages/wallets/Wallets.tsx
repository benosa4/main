import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutWithFloatingBg } from '../../shared/ui/LayoutWithFloatingBg';

/** Демонстрационные данные кошельков */
const mockWallets = [
  {
    id: 1,
    icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=023',
    name: 'Bitcoin',
    total: '0.123 BTC',
    locked: '0.010 BTC',
  },
  {
    id: 2,
    icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.png?v=023',
    name: 'Ethereum',
    total: '2.56 ETH',
    locked: '0.05 ETH',
  },
  {
    id: 3,
    icon: 'https://cryptologos.cc/logos/tether-usdt-logo.png?v=023',
    name: 'Tether',
    total: '1000 USDT',
    locked: '100 USDT',
  },
  {
    id: 4,
    icon: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png?v=023',
    name: 'BNB',
    total: '10 BNB',
    locked: '0 BNB',
  },
  {
    id: 5,
    icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.png?v=023',
    name: 'Dogecoin',
    total: '120 DOGE',
    locked: '0 DOGE',
  },
  // Добавьте больше для теста пагинации, если нужно
];

export function Wallets() {
  const navigate = useNavigate();
  const [wallets] = useState(mockWallets);

  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(wallets.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentWallets = wallets.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <LayoutWithFloatingBg>
      <div className="container mx-auto px-6 py-8 flex-1 text-gray-800">
        {/* Заголовок и кнопка "Add Wallet" */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Wallets</h1>
          <button
            className="
              bg-purple-600 hover:bg-purple-700
              text-white px-4 py-2
              rounded-full transition-colors
            "
          >
            + Add Wallet
          </button>
        </div>

        {/* Карточка для списка кошельков */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl shadow p-6">
          {/* Поиск и фильтр */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            {/* Поле поиска */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="
                  pl-10 pr-4 py-2
                  rounded-md
                  border border-gray-300
                  focus:outline-none focus:ring-2 focus:ring-purple-600
                "
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                <circle cx="10" cy="10" r="6" stroke="currentColor" />
              </svg>
            </div>

            {/* Фильтр по активам */}
            <div>
              <select
                className="
                  border border-gray-300
                  rounded-md
                  py-2 px-3
                  focus:outline-none focus:ring-2 focus:ring-purple-600
                "
              >
                <option>All assets</option>
                <option>BTC</option>
                <option>ETH</option>
                <option>USDT</option>
                <option>BNB</option>
                <option>DOGE</option>
              </select>
            </div>
          </div>

          {/* Таблица кошельков */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/10 text-white uppercase">
                  <th className="py-3 px-4 text-left font-semibold">Asset</th>
                  <th className="py-3 px-4 text-left font-semibold">Total</th>
                  <th className="py-3 px-4 text-left font-semibold">Locked</th>
                  <th className="py-3 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentWallets.map((wallet) => (
                  <tr
                    key={wallet.id}
                    className="border-b border-white/10 hover:bg-white/5"
                  >
                    {/* Кликабельная часть строки (Asset / Total / Locked) */}
                    <td
                      className="py-3 px-4 flex items-center gap-2 cursor-pointer"
                      onClick={() => navigate(`/wallet/${wallet.id}`)}
                    >
                      {wallet.icon && (
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-5 h-5 object-contain"
                        />
                      )}
                      <span className="text-white font-medium hover:underline">
                        {wallet.name}
                      </span>
                    </td>
                    <td
                      className="py-3 px-4 text-white cursor-pointer"
                      onClick={() => navigate(`/wallet/${wallet.id}`)}
                    >
                      {wallet.total}
                    </td>
                    <td
                      className="py-3 px-4 text-white cursor-pointer"
                      onClick={() => navigate(`/wallet/${wallet.id}`)}
                    >
                      {wallet.locked}
                    </td>

                    {/* Колонка Actions (Send / Receive) НЕ уводит на другую страницу */}
                    <td
                      className="py-3 px-4 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="inline-flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // Переход на страницу отправки (пример)
                                navigate(`/send-transaction?walletId=${wallet.id}`);
                            }}
                            className="
                            bg-orange-500 hover:bg-orange-600
                            text-white font-semibold
                            px-4 py-2 rounded-md shadow transition-all duration-300
                            hover:scale-105 hover:shadow-xl
                          "
                          >
                          Send
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/receive-transaction")
                            // Логика для Receive (пример)
                          }}
                          className="
    relative z-10
    bg-green-600 hover:bg-green-700
    text-white font-semibold
    px-4 py-2 rounded-md shadow
    transition-all duration-300 hover:scale-105 hover:shadow-xl
  "
                        >
                          Receive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="flex justify-center mt-4 gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`
                  px-3 py-1 rounded-md
                  ${
                    currentPage === page
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }
                `}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
}

export default Wallets;
