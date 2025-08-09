import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutWithFloatingBg } from '../../shared/ui/LayoutWithFloatingBg';
import CreateNewAddressModal from './CreateNewAddressModal';

interface Address {
  id: number;
  label: string;
  qrCode: string;
  address: string;
}

export function ReceiveTransactionPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: 1,
      label: 'Address #1',
      qrCode: 'https://via.placeholder.com/50',
      address: 'QJrYWYWRTrtTcqSSpymxWwUtuvDvgYbCTg5',
    },
    {
      id: 2,
      label: 'new',
      qrCode: 'https://via.placeholder.com/50',
      address: 'Qp6fP6nSR1yJXXMWxgVLNvtwRLWgvefZcA',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Добавление нового адреса
  const handleAddAddress = (label: string) => {
    setAddresses([
      ...addresses,
      {
        id: addresses.length + 1,
        label,
        qrCode: 'https://via.placeholder.com/50',
        address: `Q${Math.random().toString(36).substring(2, 15)}`,
      },
    ]);
    setIsModalOpen(false);
  };

  return (
    <LayoutWithFloatingBg>
      <div className="container mx-auto px-6 py-8 text-white">
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

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Addresses</h1>
          <div className="flex gap-2">
            <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all">
              Disable address auto-generating
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              + Add Address
            </button>
          </div>
        </div>

        {/* Список адресов */}
        <div className="space-y-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-4 shadow-md"
            >
              <img src={addr.qrCode} alt="QR Code" className="w-12 h-12 mr-4" />
              <div className="flex-1">
                <p className="text-sm text-white/70">Label</p>
                <p className="font-semibold">{addr.label}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-white/70">Address</p>
                <a
                  href={`https://blockchain.com/btc/address/${addr.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline break-all"
                >
                  {addr.address}
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Модальное окно */}
        <CreateNewAddressModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddAddress}
        />
      </div>
    </LayoutWithFloatingBg>
  );
}

export default ReceiveTransactionPage;
