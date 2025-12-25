import { resolve } from 'path'
import { defineConfig } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    build: {
      watch: process.env.NODE_ENV === 'development' ? {} : null,
      outDir: 'out/main',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.js')
        }
      }
    }
  },
  preload: {
    build: {
      watch: process.env.NODE_ENV === 'development' ? {} : null,
      outDir: 'out/preload',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.js')
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src')
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true
    },
    plugins: [react()],
    build: {
      outDir: 'out/renderer'
    }
  }
})
