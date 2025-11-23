import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
   test: {
    globals: true,
    environment: "happy-dom",
    setupFiles: "./src/setupTests.js", 
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true,  // 🔥 THIS IS THE FIX FOR WINDOWS + DOCKER
      interval: 1000,     // Check for changes every second
    },
    hmr: {
      host: 'reservation.local',
    },
  },
})
