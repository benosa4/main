import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        icon: true,
      },
    }),],
  assetsInclude: ['*.wasm'], // Включаем поддержку WASM файлов
  server: {
    fs: {
      // Разрешаем доступ к файлам вне корня проекта
      allow: ['..']
    }
  },
  build: {
    rollupOptions: {
      external: ['*.wasm'] // Исключаем WASM из сборки
    }
  }
})
