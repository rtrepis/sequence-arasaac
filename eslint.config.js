import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRedux from "eslint-plugin-react-redux";
import prettier from "eslint-plugin-prettier";

export default [
  // 🔹 Fitxers a lintar
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: [
      "dist/**",
      "node_modules/**",
      "**/*.test.*",
      "**/*.spec.*",
      "src/setupTests.ts",
      ".private/**",
    ],
  },

  // 🔹 Config base JS
  js.configs.recommended,

  // 🔹 TypeScript (Flat, oficial)
  ...tseslint.configs.recommended,

  // 🔹 Entorn
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
  },

  // 🔹 React
  react.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // 🔹 React Hooks (molt important)
  {
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: reactHooks.configs.recommended.rules,
  },

  // 🔹 React Redux (bones pràctiques)
  {
    plugins: {
      "react-redux": reactRedux,
    },
    rules: {
      "react-redux/useSelector-prefer-selectors": "warn",
      "react-redux/useSelector-prefer-shallow-equal": "warn",
    },
  },

  // 🔹 Prettier (només errors de format)
  {
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "warn",
    },
  },

  // 🔹 Ajustos pràctics (sense soroll)
  {
    rules: {
      // React 17+ JSX transform
      "react/react-in-jsx-scope": "off",

      // TS ja ho fa millor
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],

      // expressions tipus: condition && fn()
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": "warn",

      // qualitat
      "no-console": "warn",
    },
  },
];
