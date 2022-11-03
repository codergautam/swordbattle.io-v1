module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-unused-vars': 1,
    'max-len': [2, { ignoreComments: true }],
    'react/react-in-jsx-scope': 0,
    'react/jsx-filename-extension': [1, { extensions: ['.js', '.jsx'] }],
    'function-paren-newline': [2, 'consistent'],
    'no-plusplus': [2, { allowForLoopAfterthoughts: true }],
    'max-classes-per-file': 0,
    'react/forbid-prop-types': 0,
    'react/require-default-props': 0,
    'no-console': 0,
    'linebreak-style': 1,
    'no-octal-escape': 0,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      plugins: [
        '@typescript-eslint',
      ],
      extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        'lines-between-class-members': 0,
        'import/no-unresolved': 0,
        'import/extensions': 0,
      },
    },
  ],
};
