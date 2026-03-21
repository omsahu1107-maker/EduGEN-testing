import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    // Only use HTTPS in dev mode (needed for camera in Edge's Privacy Sandbox)
    ...(command === 'serve' ? [basicSsl()] : []),
  ],
  server: {
    port: 5174,
    https: command === 'serve' ? true : false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5001',
        changeOrigin: true,
      },
    },
  },
}))
