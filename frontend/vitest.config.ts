import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "node_modules/**",
        "build/**",
        "**/*.test.tsx",
        "**/*.test.ts",
        "**/*.spec.tsx",
        "**/*.spec.ts",
        "test/**",
        "app/entry.client.tsx",
        "app/entry.server.tsx",
        "app/root.tsx", // Often just boilerplate
      ],
      include: ["app/**/*.tsx", "app/**/*.ts"],
      all: true,
      thresholds: {
        global: {
          branches: 70, // Slightly lower for frontend due to UI components
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
});
