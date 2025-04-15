import { defineConfig } from "vitest/config"
import { resolve } from "path"

export default defineConfig({
	test: {
		globals: true,
		environment: "jsdom",
		setupFiles: "src/setupTests.js",
	},
	// build: {
	// 	rollupOptions: {
	// 		input: {
	// 			main: resolve(__dirname, "index.html"),
	// 			basic: resolve(__dirname, "index.basic.html"),
	// 			advanced: resolve(__dirname, "index.advanced.html"),
	// 		},
	// 	},
	// },
})
