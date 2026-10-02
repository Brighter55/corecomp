import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    // Vitest's default include matches **/*.spec.ts, which would sweep up the
    // Playwright specs under e2e/ and run them in the wrong runner. They are
    // Playwright's, not vitest's.
    exclude: [...configDefaults.exclude, 'e2e/**'],
  }
});
