import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname,'src/index.ts'),
      name: 'VueTw',
      fileName: (fmt,name) => fmt == 'es' ? `vue-tw.mjs` : `vue-tw.${fmt}.js`,
    },
    rollupOptions: {
      external:['vue','@servicestack/client'],
      output: {
        globals: {
          vue: 'Vue',
          '@servicestack/client': 'Servicestack'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
