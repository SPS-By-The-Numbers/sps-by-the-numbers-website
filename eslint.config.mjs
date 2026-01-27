import { defineConfig, globalIgnores } from "eslint/config";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "node:path";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores([
    "tools/**/*",
    "functions/**/*",
    "functions-python/**/*",
    "node_modules/**/*",
    "coverage",
    ".*/**/*",
  ]),
  {
    extends: compat.extends("next/core-web-vitals"),

    rules: {
      "@next/next/no-img-element": 0,
      "@next/next/no-html-link-for-pages": 0,
    },
  },
  pluginPrettierRecommended,
]);
