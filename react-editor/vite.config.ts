import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // 忽略特定文件的警告
        if (
          warning.loc?.file?.includes("src/ReactPlayground/template/App.tsx")
        ) {
          return;
        }
        warn(warning);
      },
    },
  },
  esbuild: {
    // 忽略构建时的错误
    logOverride: { "this-is-undefined-in-esm": "silent" },
  },
});
