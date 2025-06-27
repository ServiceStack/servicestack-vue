import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({ 
      tsconfigPath: './tsconfig.json',
      outDir: 'dist',
      rollupTypes: true,
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname,'src/index.ts'),
      name: 'ServiceStackVue',
      fileName: (fmt,name) => fmt == 'es' ? `servicestack-vue.mjs` : `servicestack-vue.${fmt}.cjs`,
    },
    rollupOptions: {
      external:['vue','@servicestack/client'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          '@servicestack/client': 'Servicestack',
          '@servicestack/vue': 'ServicestackVue'
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
