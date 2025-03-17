import { sentryVitePlugin } from "@sentry/vite-plugin";
/// <reference types="vitest" />
/// <reference types="vite/client"/>

import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { remixDevTools } from "remix-development-tools";
import { netlifyPlugin } from "@netlify/remix-adapter/plugin";

export default defineConfig({
  plugins: [
    remixDevTools(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
    tsconfigPaths(),
    sentryVitePlugin({
      org: "freelance-h1z",
      project: "ameeraz-management",
    }),
    netlifyPlugin(),
  ],

  build: {
    sourcemap: true,
  },
});
