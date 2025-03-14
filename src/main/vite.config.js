import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      fastRefresh: true,
      // Add proper configuration for development
      babel: {
        plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]]
      }
    })
  ],
  server: {
    hmr: {
      protocol: 'ws'
    }
  }
})
