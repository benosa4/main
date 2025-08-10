import React, { useEffect, useState } from 'react';
import appSettingsStore from './appSettings';
import { menuStore } from '../../features/menu/model';

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
    // sync version to menu when store changes (rudimentary)
    const id = setInterval(() => {
      if (menuStore.version !== appSettingsStore.state.version) {
        menuStore.version = appSettingsStore.state.version;
      }
    }, 250);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  if (!ready) return null;
  return <>{children}</>;
};

export default AppSettingsProvider;
