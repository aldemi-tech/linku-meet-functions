module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  ignorePatterns: [
    "/lib/**/*", // Ignore built files.
    "/generated/**/*", // Ignore generated files.
    "node_modules/**/*",
  ],
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "semi": ["error", "always"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error"],
  },
};