import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Build output and test artifacts. `eslint .` crawls these, and the
  // Playwright report/report dirs contain bundled JS that would otherwise fail
  // the lint gate with hundreds of unrelated errors.
  globalIgnores([
    'dist',
    'dist-e2e',
    'coverage',
    'playwright-report',
    'test-results',
    'blob-report',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Vitest runs with `globals: true` (see vite.config.js), so describe/it/
    // test/expect/vi are ambient in every test file. Declaring them here rather
    // than turning off `no-undef` keeps typo detection alive in those files.
    // `globals.node` supplies `global`, which two test files use.
    files: ['**/*.{test,spec}.{js,jsx}', 'src/setupTests.js'],
    languageOptions: {
      globals: { ...globals.vitest, ...globals.node },
    },
  },
  {
    // react-refresh only governs whether HMR hot-swaps a module or falls back
    // to a full page reload — it has no bearing on runtime correctness. These
    // modules deliberately export a hook or a JSX payload next to their
    // component, which is the standard React context pattern; splitting them
    // apart would add import coupling for a dev-only nicety.
    //
    // Listed explicitly (not as a `*Graph.jsx` glob) so a new module that
    // exports a stray non-component still fails the lint gate and forces a
    // conscious decision.
    files: [
      'src/auth/AuthProvider.jsx',
      'src/overview/StockHeaderContext.jsx',
      'src/theme/ThemeContext.jsx',
      'src/overview/components/CapitalExpendituresGraph.jsx',
      'src/overview/components/CostOfRevenueGraph.jsx',
      'src/overview/components/DividendsPayoutGraph.jsx',
      'src/overview/components/GrossProfitGraph.jsx',
      'src/overview/components/NetIncomeGraph.jsx',
      'src/overview/components/PricingGraph.jsx',
      'src/overview/components/ResearchAndDevelopmentGraph.jsx',
    ],
    rules: {
      // allowConstantExport is restated because overriding a rule's options
      // replaces the reactRefresh.configs.vite preset options rather than
      // merging with them.
      'react-refresh/only-export-components': [
        'error',
        {
          allowConstantExport: true,
          allowExportNames: ['useAuth', 'useStockHeader', 'useTheme', 'explanation'],
        },
      ],
    },
  },
])
