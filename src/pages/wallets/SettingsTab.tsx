import React from "react";

export function SettingsTab() {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl p-6 mt-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Wallet Settings</h2>

      {/* Изменение названия кошелька */}
      <div className="mb-6">
        <label className="block text-lg font-semibold mb-2">Update wallet label</label>
        <div className="flex gap-4">
          <input
            type="text"
            value="!!NEW!!"
            className="flex-1 bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
          />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all">
            Update Wallet
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all">
            Delete Wallet
          </button>
        </div>
      </div>

      {/* Изменение пароля */}
      <div>
        <label className="block text-lg font-semibold mb-2">Update Wallet Password</label>
        <div className="flex gap-4">
          <input
            type="password"
            placeholder="Current password"
            className="flex-1 bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
          />
          <input
            type="password"
            placeholder="New password"
            className="flex-1 bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="flex-1 bg-white/20 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50"
          />
        </div>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all">
          Update Password
        </button>
      </div>
    </div>
  );
}

export default SettingsTab;
