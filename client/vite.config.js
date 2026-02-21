import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// HTTPS is required so Edge allows getUserMedia / enumerateDevices.
// Without HTTPS, Edge's Privacy Sandbox returns 0 video devices even
// when the site permission is "Allowed".
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),   // self-signed cert → secure context → camera works
  ],
  server: {
    port: 5173,
    https: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
})
