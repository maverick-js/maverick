import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    useTabs: false,
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    tabWidth: 2,
    ignorePatterns: ['packages/cli/tests/analyze/fixtures'],
  },
  staged: {
    '*.{js,ts,jsx,tsx}': 'vp check --fix',
  },
});
