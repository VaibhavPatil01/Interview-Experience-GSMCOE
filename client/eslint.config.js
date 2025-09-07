// eslint.config.js
import js from "@eslint/js";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default [
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      parser: "@babel/eslint-parser",
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"],
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
    },
    rules: {
      "no-unused-vars": "warn",
      "react/react-in-jsx-scope": "off", // Not needed with React 17+
      "react/jsx-uses-react": "off",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
