/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { netlifyPlugin } from "@netlify/remix-adapter/plugin";

export default defineConfig({
    plugins: [tsconfigPaths(),netlifyPlugin()],
    test: {
        globals: true,
        environment: "jsdom",
        css: true,
        setupFiles: "./tests/setup.unit.ts",
        include: ["./app/**/*.test.{ts,tsx}"],
        exclude: ["./app/**/integration/*.test.{ts,tsx}"],
    }
});
