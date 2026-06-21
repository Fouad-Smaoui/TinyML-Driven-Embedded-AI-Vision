import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary"],
      // Pure logic (perception/metrics/ping) is what's actually unit
      // tested here; presentational components and shadcn primitives are
      // covered by the Playwright smoke test instead, not duplicated here.
      include: ["lib/**", "hooks/**"],
    },
  },
});
