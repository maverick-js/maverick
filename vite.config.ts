import { defineConfig } from "vite-plus";

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
    trailingComma: "all",
    printWidth: 100,
    tabWidth: 2,
  },
  staged: {
    "*.{js,ts,jsx,tsx}": "vp check --fix",
  },
});
