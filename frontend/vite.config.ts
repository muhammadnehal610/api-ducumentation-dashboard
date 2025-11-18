
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: Use import.meta.url to get directory path without relying on Node.js types for __dirname.
      '@': path.resolve(new URL('.', import.meta.url).pathname, 'src'),
    },
  },
})