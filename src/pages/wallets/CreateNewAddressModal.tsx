import React, { useState } from 'react';

interface CreateNewAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (label: string) => void;
}

const CreateNewAddressModal: React.FC<CreateNewAddressModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [label, setLabel] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">
          Create new address
        </h2>

        <input
          type="text"
          placeholder="Address label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="
            w-full border border-gray-300 rounded-md p-2 text-gray-800
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
        />

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (label.trim()) {
                onSubmit(label);
                setLabel('');
              }
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-all"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewAddressModal;
