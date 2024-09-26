import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: ['./vitest.setup.mjs', 'jest-webextension-mock'],
    environment: 'jsdom',
    hookTimeout: 100000,
  },
})
