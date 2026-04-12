// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from 'eslint-plugin-unused-imports';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'drizzle.config.ts'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // ✅ Tắt toàn bộ no-unsafe vì Drizzle ORM chưa type đầy đủ
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      // ✅ Tắt require-await (Drizzle query trả về PromiseLike, không cần await)
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-explicit-any': 'warn', // hạ từ error xuống warn

      // ✅ unused-imports tự động xóa import thừa
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
      // Tắt rule gốc để tránh conflict với unused-imports
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },
);