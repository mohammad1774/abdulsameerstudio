import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
    ],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,mjs}"],
    linterOptions: {
      reportUnusedDisableDirectives: "error",
    },
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      ...js.configs.recommended.rules,
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["src/**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ["*.config.js", "scripts/**/*.{js,mjs}", "tests/**/*.{js,mjs}", "vite.config.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];
