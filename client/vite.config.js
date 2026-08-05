import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: ['/app', '/shared']
    },
    proxy: {
      '/api': {
        target: 'http://langops-website-server:3200',
        changeOrigin: true,
        secure: false
      }
    },
    host: "0.0.0.0",
    port: 5173, 
    hmr: {
      clientPort: 5173
    }
  }
})
