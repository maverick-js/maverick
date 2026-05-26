/// <reference types="vite-plus/test" />
import { defineConfig } from "vite-plus";

const SERVER = !!process.env.SERVER;

const entries = {
  index: "src/core/index.ts",
  element: "src/element/index.ts",
  react: "src/react/index.ts",
  std: "src/std/index.ts",
};

const shared = {
  format: "esm" as const,
  deps: { neverBundle: ["react"] },
  hash: false,
  clean: false,
  fixedExtension: false,
  outputOptions: { minifyInternalExports: false },
};

function rscPlugin() {
  return {
    name: "maverick-rsc-env",
    resolveId(id: string) {
      if (id === "@virtual/env") return id;
    },
    load(id: string) {
      if (id === "@virtual/env") {
        return `export const IS_SERVER = typeof document === 'undefined';`;
      }
    },
    transform(code: string, id: string) {
      if (id === "@virtual/env") return;
      return 'import { IS_SERVER } from "@virtual/env";\n' + code;
    },
  };
}

export default defineConfig({
  define: {
    __DEV__: "true",
    __TEST__: "true",
    __SERVER__: SERVER ? "true" : "false",
  },
  resolve: {
    alias: {
      "maverick.js/element/server": "/src/element/server",
      "maverick.js/element": "/src/element",
      "maverick.js/react": "/src/react",
      "maverick.js/std": "/src/std",
      "maverick.js": "/src/core",
    },
  },
  test: {
    include: [`tests/${SERVER ? "server" : "client"}/**/*.test.{ts,tsx}`],
    globals: true,
    environment: SERVER ? "edge-runtime" : "jsdom",
  },
  pack: [
    // Development build (also generates .d.ts)
    {
      ...shared,
      entry: entries,
      outDir: "dist/dev",
      dts: { tsgo: true },
      define: { __DEV__: "true", __SERVER__: "false", __TEST__: "false" },
    },
    // Production build
    {
      ...shared,
      entry: entries,
      outDir: "dist/prod",
      define: { __DEV__: "false", __SERVER__: "false", __TEST__: "false" },
    },
    // Server build
    {
      ...shared,
      entry: entries,
      outDir: "dist/server",
      define: { __DEV__: "false", __SERVER__: "true", __TEST__: "false" },
    },
    // RSC development build
    {
      ...shared,
      entry: { dev: "src/react/rsc.ts" },
      outDir: "dist/rsc",
      define: { __DEV__: "true", __SERVER__: "IS_SERVER", __TEST__: "false" },
      plugins: [rscPlugin()],
    },
    // RSC production build
    {
      ...shared,
      entry: { prod: "src/react/rsc.ts" },
      outDir: "dist/rsc",
      define: { __DEV__: "false", __SERVER__: "IS_SERVER", __TEST__: "false" },
      plugins: [rscPlugin()],
    },
  ],
});
