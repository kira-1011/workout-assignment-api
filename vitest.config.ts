import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Use globals like describe, it, expect without importing
		globals: true,
		// Environment for testing (node for backend APIs)
		environment: "node",
		// Include pattern for test files
		include: ["src/**/*.{test,spec}.ts"],
		// Setup file runs before all tests
		setupFiles: ["src/test/setup.ts"],
		// Test environment variables
		env: {
			DATABASE_URL: "postgresql://test:test@localhost:5432/test_db",
			JWT_SECRET: "test-secret-key-minimum-32-characters-long",
			JWT_EXPIRES_IN: "3600000",
		},
		// Coverage configuration
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
		},
	},
});
