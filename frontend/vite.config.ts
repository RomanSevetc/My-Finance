import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Фиксируем порт
    strictPort: true, // Запрещаем автоматический выбор другого порта, если 5174 занят
  }
})
