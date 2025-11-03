// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // 👈 ADDED: Import 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 👈 ADDED: Resolve configuration for @/ alias
  resolve: {
    alias: {
      '@/': path.resolve(__dirname, './src') + '/',
    },
  },
})