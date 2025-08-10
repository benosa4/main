import React, { useEffect, useState } from 'react';
import { appSettingsStore } from './appSettings';

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    appSettingsStore
      .init()
      .catch(() => {})
      .finally(() => {
        if (mounted) setReady(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
};

export default AppSettingsProvider;

