import Vue from '@vitejs/plugin-vue';
import {defineConfig} from "vite";


export default defineConfig({
    plugins: [Vue()],
    // @ts-ignore
    test: {
        browser: {
            enabled: true,
            name: 'chrome', // browser name is required
        },
    }
})
