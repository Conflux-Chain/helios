import {defineConfig} from 'vitest/config'
export default defineConfig({
  test: {
    projects: ['packages/*'],
    coverage: {
      // Vitest 4 otherwise omits untested source files from the report.
      include: [
        '{packages,scripts,websites,examples}/**/*.{js,cjs,mjs,ts,mts,tsx,jsx}',
        '*.{js,cjs,mjs,ts}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '{packages,scripts,websites,examples}/**/.*/**',
        'coverage/**',
        '**/*.d.ts',
        '**/*.{test,spec}.*',
        '**/{vite,vitest,jest,webpack,babel,eslint,prettier,rollup,build}.config.*',
        '**/__tests__/**',
      ],
    },
  },
})
