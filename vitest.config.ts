import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
    exclude: ['**/node_modules/**', '**/dist/**', 'design-reference/**'],
    setupFiles: ['src/test/setup.ts'],
  },
})
