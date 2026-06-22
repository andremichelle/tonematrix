import js from "@eslint/js"
import globals from "globals"

export default [
    js.configs.recommended,
    {
        // Modern ES modules across the whole project.
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module"
        }
    },
    {
        // Browser code (main thread).
        files: ["src/**/*.js"],
        languageOptions: {globals: {...globals.browser}}
    },
    {
        // AudioWorklet global scope.
        files: ["src/processor.js"],
        languageOptions: {
            globals: {
                registerProcessor: "readonly",
                AudioWorkletProcessor: "readonly",
                sampleRate: "readonly",
                currentTime: "readonly",
                currentFrame: "readonly"
            }
        }
    },
    {
        // Node tooling.
        files: ["serve.mjs", "eslint.config.mjs"],
        languageOptions: {globals: {...globals.node}}
    }
]
