// ProfileGeneralTab.tsx
import React from 'react';
import Card from '../../shared/ui/Card';

interface User {
  username: string;
  email: string;
  phone: string;
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
}

interface InfoRowProps {
  label: string;
  value: string;
}

const ProfileGeneralTab = ({ user }: { user: User }) => {
  return (
    <Card>
      <div className="space-y-6">
        <Section title="Basic Information" icon="📌">
          <InfoRow label="Username" value={user.username} />
          <InfoRow label="Email" value={user.email} />
          <InfoRow label="Phone" value={user.phone} />
        </Section>
      </div>
    </Card>
  );
};

const Section = ({ title, icon, children }: SectionProps) => (
  <div>
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-xl font-semibold text-white/90">{title}</h2>
    </div>
    {children}
  </div>
);

const InfoRow = ({ label, value }: InfoRowProps) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl mb-3">
    <span className="text-white/70">{label}</span>
    <span className="font-medium text-white/90">{value}</span>
  </div>
);

export default ProfileGeneralTab;