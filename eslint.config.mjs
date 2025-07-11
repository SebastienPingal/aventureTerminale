import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "**/node_modules/**",
      "**/prisma/generated/**",
      "**/app/generated/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        {
          "allowObjectTypes": "always"
        }
      ]
    }
  }
];

export default eslintConfig;
