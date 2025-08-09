// src/pages/SendTransactionPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutWithFloatingBg } from '../../shared/ui/LayoutWithFloatingBg';

export function SendTransactionPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // При нажатии "Back" на первом шаге — уходим на /wallets
  function handleBack() {
    if (step === 1) {
      navigate('/wallets');
    } else {
      setStep(step - 1);
    }
  }

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Последний шаг: отправляем транзакцию
      alert('Transaction submitted!');
      navigate('/wallets');
    }
  }

  return (
    <LayoutWithFloatingBg>
      <div className="container mx-auto px-6 py-8 flex-1">
        <h1 className="text-3xl font-bold mb-4 text-white">Send transaction</h1>

        {/* Индикация шагов (STEP 1 / 2 / 3) */}
        <div className="flex items-center gap-4 mb-8">
          <StepIndicator label="STEP 1" active={step === 1} />
          <StepIndicator label="STEP 2" active={step === 2} />
          <StepIndicator label="STEP 3" active={step === 3} />
        </div>

        {/* Основной контент шага */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl shadow p-6 text-gray-800">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
        </div>

        {/* Кнопки управления шагами */}
        <div className="flex justify-between mt-6">
          <button
            onClick={handleBack}
            className="
              bg-white/10 hover:bg-white/20
              text-white font-semibold
              py-2 px-6
              rounded-md
              transition-colors
            "
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <button
            onClick={handleNext}
            className="
              bg-purple-600 hover:bg-purple-700
              text-white font-semibold
              py-2 px-6
              rounded-md
              transition-colors
            "
          >
            {step < 3 ? 'Next' : 'Submit'}
          </button>
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
}

/* ===============================
   Шаги формы
=============================== */
function Step1() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 1</h2>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recipient address
        </label>
        <input
          type="text"
          required
          className="
            w-full
            border border-gray-300
            rounded-md p-2
            focus:outline-none focus:ring-2 focus:ring-purple-600
          "
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Amount (BTC)
        </label>
        <input
          type="number"
          required
          step="0.00000001"
          className="
            w-full
            border border-gray-300
            rounded-md p-2
            focus:outline-none focus:ring-2 focus:ring-purple-600
          "
        />
      </div>
    </>
  );
}

function Step2() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 2</h2>
      <p className="text-gray-700 mb-4">
        Here you can confirm details or set additional parameters.
      </p>
      {/* Пример дополнительного поля */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Transaction fee
        </label>
        <input
          type="number"
          defaultValue="0.0001"
          className="
            w-full
            border border-gray-300
            rounded-md p-2
            focus:outline-none focus:ring-2 focus:ring-purple-600
          "
        />
      </div>
    </>
  );
}

function Step3() {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Step 3</h2>
      <p className="text-gray-700 mb-4">
        Final confirmation: please review all details before submitting.
      </p>
      {/* Здесь можно вывести сводку адреса, суммы, комиссии и т.д. */}
    </>
  );
}

/* ===============================
   Индикатор шага (STEP 1 / STEP 2 / STEP 3)
=============================== */
function StepIndicator({ label, active }: { label: string; active: boolean }) {
  return (
    <div
      className={`
        px-4 py-2 rounded-full text-sm font-semibold
        border-2
        ${active ? 'bg-purple-600 text-white border-purple-600' : 'bg-white/10 text-white border-white/20'}
      `}
    >
      {label}
    </div>
  );
}

export default SendTransactionPage;