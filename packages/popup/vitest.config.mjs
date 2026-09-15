import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'
import {fileURLToPath} from 'node:url'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /.*\.js$/,
    exclude: [],
  },
  test: {
    environment: 'jsdom',
    setupFiles: [fileURLToPath(new URL('./vitest.setup.mjs', import.meta.url))],
  },
})
