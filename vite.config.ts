import { defineConfig } from 'vite-plus';

const checkableStagedFiles = (files: readonly string[]) => {
  const filtered = files.filter((file) => !file.includes('/packages/analyze/tests/fixtures/'));
  return filtered.length
    ? `vp check --fix ${filtered.map((file) => JSON.stringify(file)).join(' ')}`
    : [];
};

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
    ignorePatterns: ['packages/analyze/tests/fixtures'],
  },
  staged: {
    '*.{js,ts,jsx,tsx}': checkableStagedFiles,
  },
});
