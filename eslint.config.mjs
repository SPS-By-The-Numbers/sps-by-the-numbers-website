import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  globalIgnores([
    "tools/**/*",
    "functions/**/*",
    "functions-python/**/*",
    "node_modules/**/*",
    "coverage",
    ".*/**/*",
  ]),
  ...nextCoreWebVitals,
  {
    rules: {
      "@next/next/no-img-element": 0,
      "@next/next/no-html-link-for-pages": 0,
    },
  },
  pluginPrettierRecommended,
]);
