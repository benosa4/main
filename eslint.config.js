import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'src/stories/**',
      'src/widgets/settings-panel/**',
      'src/widgets/emoji-panel/**',
      'src/features/gifting/**',
      'src/shared/nats/**',
      'src/**/*.test.ts',
      'src/features/premium/**',
      'src/features/stars/**',
      'src/features/wallets/**',
      'src/pages/**',
      'src/shared/db.ts',
      'src/shared/emoji/**',
      'src/emoji/emojiMap.ts',
      'scripts/**',
      'src/shared/config/appSettings.ts',
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
)
