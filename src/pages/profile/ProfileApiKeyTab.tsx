import React from 'react';
import Card from '../../shared/ui/Card';

const ProfileApiKeyTab = () => {
  const apiKeys = [
    { name: 'Production', key: 'sk_live_*******', created: '2023-08-15' },
    { name: 'Test', key: 'sk_test_*******', created: '2023-08-10' }
  ];

  return (
    <Card>
      <div className="space-y-6">
        {/* Существующие ключи */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔑</span>
            <h2 className="text-xl font-semibold text-white/90">Active API Keys</h2>
          </div>
          
          {apiKeys.map((key, index) => (
            <div key={index} className="p-4 bg-white/5 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-white/90 font-medium">{key.name}</h3>
                  <p className="text-sm text-white/60">Created: {key.created}</p>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg 
                    hover:bg-white/20 transition-colors">
                    Copy
                  </button>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg 
                    hover:bg-red-500/30 transition-colors">
                    Revoke
                  </button>
                </div>
              </div>
              <code className="text-sm text-white/60 break-all">{key.key}</code>
            </div>
          ))}
        </div>

        {/* Создание нового ключа */}
        <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <h2 className="text-xl font-semibold text-white/90">Create New API Key</h2>
          </div>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Key name"
              className="w-full p-3 bg-white/10 border border-white/20 rounded-lg
                text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
            />
            
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                text-white rounded-xl font-medium hover:scale-[1.02] transition-transform">
                Generate Key
              </button>
              <button className="flex-1 py-3 bg-white/10 text-white rounded-xl 
                font-medium hover:bg-white/20 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileApiKeyTab;