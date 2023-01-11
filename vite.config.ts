import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({ entryRoot:'src/index.ts', outputDir:'dist/components' }) // workaround bug using parent dir, should be 'dist'
  ],
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

/**
     "declaration": true,
    "declarationDir": "dist",
    "noEmit": true

 */