// vite.config.ts
import { vite as maverick, transform } from "file:///Users/v.rahim.alwer/Desktop/Projects/maverick/packages/compiler/dist/index.js";
import { defineConfig } from "file:///Users/v.rahim.alwer/Desktop/Projects/maverick/node_modules/.pnpm/vite@3.2.4_@types+node@18.11.9/node_modules/vite/dist/node/index.js";
var SERVER = !!process.env.SERVER;
var vite_config_default = defineConfig({
  define: {
    __DEV__: "true",
    __TEST__: "true",
    __SERVER__: SERVER ? "true" : "false"
  },
  resolve: {
    alias: {
      "maverick.js/element": "/src/element",
      "maverick.js/dom": "/src/runtime/dom",
      "maverick.js/react": "/src/react",
      "maverick.js/ssr": "/src/runtime/ssr",
      "maverick.js/std": "/src/std",
      "maverick.js": "/src/runtime"
    }
  },
  plugins: [
    {
      name: "maverick-ssr",
      enforce: "pre",
      transform(code, id) {
        if (id.includes("tests/server")) {
          return transform(code, {
            filename: id,
            generate: "ssr",
            sourcemap: true
          });
        }
      }
    },
    maverick({
      include: ["tests/**/*.{jsx,tsx}"],
      hydratable: (id) => id.includes("hydrate") ? true : null
    })
  ],
  test: {
    include: [`tests/${SERVER ? "server" : "client"}/**/*.test.{ts,tsx}`],
    globals: true,
    environment: SERVER ? "edge-runtime" : "jsdom"
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdi5yYWhpbS5hbHdlci9EZXNrdG9wL1Byb2plY3RzL21hdmVyaWNrL3BhY2thZ2VzL21hdmVyaWNrXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvdi5yYWhpbS5hbHdlci9EZXNrdG9wL1Byb2plY3RzL21hdmVyaWNrL3BhY2thZ2VzL21hdmVyaWNrL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy92LnJhaGltLmFsd2VyL0Rlc2t0b3AvUHJvamVjdHMvbWF2ZXJpY2svcGFja2FnZXMvbWF2ZXJpY2svdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG5pbXBvcnQgeyB2aXRlIGFzIG1hdmVyaWNrLCB0cmFuc2Zvcm0gfSBmcm9tICdAbWF2ZXJpY2stanMvY29tcGlsZXInO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5cbmNvbnN0IFNFUlZFUiA9ICEhcHJvY2Vzcy5lbnYuU0VSVkVSO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBkZWZpbmU6IHtcbiAgICBfX0RFVl9fOiAndHJ1ZScsXG4gICAgX19URVNUX186ICd0cnVlJyxcbiAgICBfX1NFUlZFUl9fOiBTRVJWRVIgPyAndHJ1ZScgOiAnZmFsc2UnLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdtYXZlcmljay5qcy9lbGVtZW50JzogJy9zcmMvZWxlbWVudCcsXG4gICAgICAnbWF2ZXJpY2suanMvZG9tJzogJy9zcmMvcnVudGltZS9kb20nLFxuICAgICAgJ21hdmVyaWNrLmpzL3JlYWN0JzogJy9zcmMvcmVhY3QnLFxuICAgICAgJ21hdmVyaWNrLmpzL3Nzcic6ICcvc3JjL3J1bnRpbWUvc3NyJyxcbiAgICAgICdtYXZlcmljay5qcy9zdGQnOiAnL3NyYy9zdGQnLFxuICAgICAgJ21hdmVyaWNrLmpzJzogJy9zcmMvcnVudGltZScsXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHtcbiAgICAgIG5hbWU6ICdtYXZlcmljay1zc3InLFxuICAgICAgZW5mb3JjZTogJ3ByZScsXG4gICAgICB0cmFuc2Zvcm0oY29kZSwgaWQpIHtcbiAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCd0ZXN0cy9zZXJ2ZXInKSkge1xuICAgICAgICAgIHJldHVybiB0cmFuc2Zvcm0oY29kZSwge1xuICAgICAgICAgICAgZmlsZW5hbWU6IGlkLFxuICAgICAgICAgICAgZ2VuZXJhdGU6ICdzc3InLFxuICAgICAgICAgICAgc291cmNlbWFwOiB0cnVlLFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0sXG4gICAgbWF2ZXJpY2soe1xuICAgICAgaW5jbHVkZTogWyd0ZXN0cy8qKi8qLntqc3gsdHN4fSddLFxuICAgICAgaHlkcmF0YWJsZTogKGlkKSA9PiAoaWQuaW5jbHVkZXMoJ2h5ZHJhdGUnKSA/IHRydWUgOiBudWxsKSxcbiAgICB9KSxcbiAgXSxcbiAgLy8gaHR0cHM6Ly92aXRlc3QuZGV2L2NvbmZpZ1xuICB0ZXN0OiB7XG4gICAgaW5jbHVkZTogW2B0ZXN0cy8ke1NFUlZFUiA/ICdzZXJ2ZXInIDogJ2NsaWVudCd9LyoqLyoudGVzdC57dHMsdHN4fWBdLFxuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6IFNFUlZFUiA/ICdlZGdlLXJ1bnRpbWUnIDogJ2pzZG9tJyxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFNBQVMsUUFBUSxVQUFVLGlCQUFpQjtBQUM1QyxTQUFTLG9CQUFvQjtBQUU3QixJQUFNLFNBQVMsQ0FBQyxDQUFDLFFBQVEsSUFBSTtBQUU3QixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixRQUFRO0FBQUEsSUFDTixTQUFTO0FBQUEsSUFDVCxVQUFVO0FBQUEsSUFDVixZQUFZLFNBQVMsU0FBUztBQUFBLEVBQ2hDO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCx1QkFBdUI7QUFBQSxNQUN2QixtQkFBbUI7QUFBQSxNQUNuQixxQkFBcUI7QUFBQSxNQUNyQixtQkFBbUI7QUFBQSxNQUNuQixtQkFBbUI7QUFBQSxNQUNuQixlQUFlO0FBQUEsSUFDakI7QUFBQSxFQUNGO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUDtBQUFBLE1BQ0UsTUFBTTtBQUFBLE1BQ04sU0FBUztBQUFBLE1BQ1QsVUFBVSxNQUFNLElBQUk7QUFDbEIsWUFBSSxHQUFHLFNBQVMsY0FBYyxHQUFHO0FBQy9CLGlCQUFPLFVBQVUsTUFBTTtBQUFBLFlBQ3JCLFVBQVU7QUFBQSxZQUNWLFVBQVU7QUFBQSxZQUNWLFdBQVc7QUFBQSxVQUNiLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFNBQVMsQ0FBQyxzQkFBc0I7QUFBQSxNQUNoQyxZQUFZLENBQUMsT0FBUSxHQUFHLFNBQVMsU0FBUyxJQUFJLE9BQU87QUFBQSxJQUN2RCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsTUFBTTtBQUFBLElBQ0osU0FBUyxDQUFDLFNBQVMsU0FBUyxXQUFXLDZCQUE2QjtBQUFBLElBQ3BFLFNBQVM7QUFBQSxJQUNULGFBQWEsU0FBUyxpQkFBaUI7QUFBQSxFQUN6QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
