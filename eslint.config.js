import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { ignores: ["mocks/handlers.ts", "mocks/*.*", "**/*test*.*", "test*.tsx"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      // Note: you must disable the base rule as it can report incorrect errors
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": "error",
    },
  },
  ...tseslint.configs.recommended,
];
