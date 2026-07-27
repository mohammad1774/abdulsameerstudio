/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/**", "node_modules/**", "playwright-report/**", "test-results/**"],
  rules: {
    "color-hex-length": "long",
    "declaration-no-important": true,
    "selector-class-pattern": [
      "^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$",
      {
        message: "Use kebab-case class names.",
      },
    ],
  },
};
