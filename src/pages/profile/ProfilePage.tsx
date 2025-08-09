// ProfilePage.tsx
import React, { useState } from 'react';
import { LayoutWithFloatingBg } from '../../shared/ui/LayoutWithFloatingBg';
import ProfileGeneralTab from './ProfileGeneralTab';
import ProfileSecurityTab from './ProfileSecurityTab';
import ProfileApiKeyTab from './ProfileApiKeyTab';

interface UserData {
  avatar: string;
  username: string;
  email: string;
  userId: string;
  phone: string;
}

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'api'>('general');
  const userData: UserData = {
    avatar: 'https://example.com/avatar.jpg',
    username: '@webcrednet',
    email: 'user@example.com',
    userId: '#752816',
    phone: '+1 1234 567 890'
  };

  return (
    <LayoutWithFloatingBg>
      <div className="container mx-auto px-4 py-8 flex-1 max-w-8xl">
        
        {/* Шапка профиля */}
        <div className="flex items-center gap-6 mb-12 p-6 bg-white/5 rounded-2xl backdrop-blur-sm">
          <img 
            src={userData.avatar}
            alt="User Avatar"
            className="w-24 h-24 rounded-full border-4 border-purple-500/30"
          />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Profile</h1>
            <div className="flex items-center gap-3 text-purple-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"/>
              </svg>
              <span className="font-mono">{userData.userId}</span>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <div className="mb-8 flex gap-3 border-b border-white/10 pb-2">
          {(['general', 'security', 'api'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl flex items-center gap-2
                transition-all duration-300 text-lg
                ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
            >
              {tab === 'general' && '👤'}
              {tab === 'security' && '🔒'}
              {tab === 'api' && '🔑'}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Контент вкладок */}
        <div className="space-y-6">
          {activeTab === 'general' && <ProfileGeneralTab user={userData} />}
          {activeTab === 'security' && <ProfileSecurityTab />}
          {activeTab === 'api' && <ProfileApiKeyTab />}
        </div>
      </div>
    </LayoutWithFloatingBg>
  );
}
export default ProfilePage;