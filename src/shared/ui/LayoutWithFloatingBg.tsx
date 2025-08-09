// LayoutWithFloatingBg.tsx
import React from 'react';
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

export function LayoutWithFloatingBg({ children, noFrame = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen relative bg-white text-gray-900 overflow-hidden">
      {noFrame ? (
        <main className="flex-1 relative z-10">{children}</main>
      ) : (
        <>
          {/* Верхнее меню удалено */}
          <main className="flex-1 relative z-10 pt-8 pb-12">{children}</main>
          <Footer />
        </>
      )}
    </div>
  );
}
