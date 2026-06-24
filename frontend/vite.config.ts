import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Tailwind v4 uses a Vite plugin instead of a config file
  ],
  server: {
    port: 5173,
    // Proxy /api calls to the NestJS backend in development.
    // This avoids CORS issues and means the frontend never hard-codes the backend URL.
    proxy: {
      '/api': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000',
    },
  },
})