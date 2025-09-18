// import js from "@eslint/js";
// import globals from "globals";
// import tseslint from "typescript-eslint";
// import pluginReact from "eslint-plugin-react";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
//   tseslint.configs.recommended,
//   pluginReact.configs.flat.recommended,
// ]);
import { defineConfig } from 'eslint/config';
import js from '@eslint/js';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  // Basic ESLint recommended rules
  js.configs.recommended,
  
  
  // React configuration
  {
    name: 'react-setup',
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Rules to catch your specific issues
  {
    name: 'debug-element-type-invalid',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Catch import/export mismatches
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      
      // Catch unused imports that might return undefined
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      
      // React-specific rules to catch component issues
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/no-unused-state': 'warn',
      'react/jsx-no-undef': 'error',
      
      // Catch function vs object issues
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // TypeScript rules for component types
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-types': 'error',
    },
  },

  // Next.js specific configuration
  {
    name: 'nextjs-config',
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Catch server/client component issues
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js App Router
    },
  },

  // Ignore files
  {
    name: 'ignores',
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
    ],
  },
]);
