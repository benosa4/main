import React from 'react';
import Card from '../../shared/ui/Card';


const ProfileSecurityTab = () => {
  return (
    <Card>
      <div className="space-y-6">
        {/* Смена пароля */}
        <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔑</span>
            <h2 className="text-xl font-semibold text-white/90">Password Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Last changed:</span>
              <span className="text-white/90">3 days ago</span>
            </div>
            
            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
              text-white rounded-xl font-medium hover:scale-[1.02] transition-transform">
              Change Password
            </button>
          </div>
        </div>

        {/* 2FA */}
        <div className="flex flex-col gap-4 p-4 bg-white/5 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <h2 className="text-xl font-semibold text-white/90">Two-Factor Authentication</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Status:</span>
              <span className="text-green-400">Active</span>
            </div>
            
            <div className="flex gap-3">
              <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 
                text-white rounded-xl font-medium hover:scale-[1.02] transition-transform">
                Manage 2FA
              </button>
              <button className="flex-1 py-3 bg-white/10 text-white rounded-xl 
                font-medium hover:bg-white/20 transition-colors">
                Recovery Codes
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileSecurityTab;