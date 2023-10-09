import Vue from '@vitejs/plugin-vue';
import path from 'path'
import {defineConfig} from "vite";


export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    },
    plugins: [Vue()],
    // @ts-ignore
    test: {
        browser: {
            enabled: true,
            name: 'chrome', // browser name is required
        },
    }
})
