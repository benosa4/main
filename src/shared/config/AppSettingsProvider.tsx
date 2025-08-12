import React, { useEffect, useState } from 'react';
import appSettingsStore from './appSettings';
import { profileStore } from '../../features/profile/model';
import { menuStore } from '../../features/menu/model';

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      appSettingsStore.init().catch(() => {}),
      profileStore.load().catch(() => {}),
    ])
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
