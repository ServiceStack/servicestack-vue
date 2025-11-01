import Vue from "@vitejs/plugin-vue";
import path from "path";
import { defineConfig } from "vite";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [Vue()],
  // @ts-ignore
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      // at least one instance is required
      instances: [{ browser: "chromium" }],
    },
  },
});
