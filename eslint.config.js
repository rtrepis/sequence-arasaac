import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRedux from "eslint-plugin-react-redux";
import prettier from "eslint-plugin-prettier";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/*.test.*",
      "**/*.spec.*",
      "src/setupTests.ts",
      ".private/**",
    ],
  },

  js.configs.recommended,

  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },

  // React
  react.configs.flat.recommended,
  {
    settings: {
      react: { version: "detect" },
    },
  },

  // React Hooks
  {
    plugins: { "react-hooks": reactHooks },
    rules: reactHooks.configs.recommended.rules,
  },

  // React Redux
  {
    plugins: { "react-redux": reactRedux },
    rules: {
      "react-redux/useSelector-prefer-selectors": "warn",
    },
  },

  // TypeScript (ÚNIC lloc amb @typescript-eslint)
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-expressions": "warn",
    },
  },

  // Prettier
  {
    plugins: { prettier },
    rules: {
      "prettier/prettier": "warn",
    },
  },

  // Ajustos globals sense plugins
  {
    rules: {
      "react/react-in-jsx-scope": "off",
      "no-unused-vars": "off",
      "no-unused-expressions": "off",
      "no-console": "warn",
    },
  },
];
