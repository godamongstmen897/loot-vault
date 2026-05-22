import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    include: ["src/**/*.{test,spec}.ts", "src/**/*.{test,spec}.tsx"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      reportsDirectory: "coverage",
      include: ["src/contracts/**/*.ts", "src/lib/contracts/**/*.ts"],
      exclude: ["src/contracts/**/dist/**", "**/*.d.ts"],
    },
  },
});
