/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
    setupFiles: ["./tests/setup.integration.ts"],
    include: ["./app/**/integration/*.test.{ts,tsx}"],
  },
});