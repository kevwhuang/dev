import a11y from 'eslint-plugin-jsx-a11y';
import astro from 'eslint-plugin-astro';
import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import ts from 'typescript-eslint';

const ignores = {
    ignores: ['.astro/', 'dist/', '.netlify/'],
};

const overrides = {
    files: ['**/*.astro', '**/*.astro/*.ts'],
    rules: {
        '@stylistic/jsx-one-expression-per-line': 'off',
        '@stylistic/operator-linebreak': 'off',
    },
};

const style = stylistic.configs.customize({
    braceStyle: '1tbs',
    indent: 4,
    quotes: 'single',
    semi: true,
});

export default [
    ignores,
    js.configs.recommended,
    style,
    ...ts.configs.recommended,
    ...astro.configs.recommended,
    a11y.flatConfigs.recommended,
    overrides,
];
