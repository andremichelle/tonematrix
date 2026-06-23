import {defineConfig} from "vite"

// Relative base so the build works both on GitHub Pages project sites
// (https://andremichelle.github.io/tonematrix/) and on custom domains.
export default defineConfig({
    base: "./",
    build: {
        outDir: "dist",
        target: "es2020"
    }
})
