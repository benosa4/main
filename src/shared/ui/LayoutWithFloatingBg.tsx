// LayoutWithFloatingBg.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import { appSettingsStore } from '../config/appSettings';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  /**
   * When true, renders children without the header and footer.
   * This is useful for pages that need to occupy the whole screen
   * like the chat page.
   */
  noFrame?: boolean;
}

export const LayoutWithFloatingBg = observer(function LayoutWithFloatingBg({ children, noFrame = false }: LayoutProps) {
  const showAnims = appSettingsStore.state.animations;
  const theme = appSettingsStore.state.theme;
  return (
    <div className="flex flex-col min-h-screen relative bg-gradient-to-br from-purple-900/80 via-indigo-900/80 to-blue-900/80 text-white overflow-hidden">

      {/* Анимированные элементы фона (можно отключить в настройках) */}
      {showAnims && (
        <>
          <div className="absolute top-[-15%] left-[-10%] w-[40vw] h-[40vw]
              bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full
              blur-3xl animate-float1" />
          <div className="absolute bottom-[-20%] right-[-15%] w-[50vw] h-[50vw]
              bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full
              blur-3xl animate-float2" />
        </>
      )}

      {noFrame ? (
        <main className="flex-1 relative z-10">{children}</main>
      ) : (
        <>
          <Header />
          <main className="flex-1 relative z-10 pt-8 pb-12">{children}</main>
          <Footer />
        </>
      )}
    </div>
  );
});
