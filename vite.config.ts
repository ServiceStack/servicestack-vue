import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
    
import fs from 'fs'
import path from 'path'
import { env } from 'process'


const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateArg = process.argv.map(arg => arg.match(/--name=(?<value>.+)/i)).filter(Boolean)[0];
const certificateName = certificateArg ? certificateArg!.groups!.value : "myapp.client";

if (!certificateName) {
    console.error('Invalid certificate name. Run this script in the context of an npm/yarn script or pass --name=<<app>> explicitly.')
    process.exit(-1);
}

const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:5001';
const apiUrl = process.env.NODE_ENV === 'development' ? target : ''
const baseUrl = process.env.NODE_ENV === 'development'
    ? "https://locahost:5173"
    : process.env.DEPLOY_HOST ? `https://${process.env.DEPLOY_HOST}` : undefined

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
  },
  server: {
      proxy: {
          '^/api': {
              target,
              secure: false
          }
      },
      port: 5173,
      ...(fs.existsSync(keyFilePath) && fs.existsSync(certFilePath) ? {
          https: {
              key: fs.readFileSync(keyFilePath),
              cert: fs.readFileSync(certFilePath),
          }
      } : {})
  }  
})
