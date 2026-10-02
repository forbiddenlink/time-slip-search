import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    // eslint-plugin-react auto-detection calls an API removed in ESLint 10; pin the version.
    settings: { react: { version: '19' } },
  },
  {
    // Pre-existing violations when linting was re-enabled (Next 16 dropped `next lint`).
    // Kept visible as warnings so the gate blocks new breakage without a mass refactor.
    // Follow-up: fix these and flip them back to 'error'.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-require-imports': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/immutability': 'warn',
      'react/no-unescaped-entities': 'warn',
      'prefer-const': 'warn',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'next-env.d.ts', 'public/**'],
  },
]

export default eslintConfig
