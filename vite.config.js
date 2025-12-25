import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import obfuscator from 'rollup-plugin-obfuscator'

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.js'
      }
    ]),
    renderer(),
    obfuscator({
      compact: true,
      controlFlowFlattening: true
    })
  ],
  server: {
    hmr: true,
    watch: {
      usePolling: true
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  renderer: {
    server: {
      host: '0.0.0.0',
      port: 8000
    }
  }
})
