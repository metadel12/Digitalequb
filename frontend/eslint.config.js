import js from '@eslint/js'
import react from 'eslint-plugin-react'

export default [
    {
        ignores: ['dist/**', 'src/types/**'],
    },
    js.configs.recommended,
    react.configs.flat.recommended,
    react.configs.flat['jsx-runtime'],
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                window: 'readonly',
                document: 'readonly',
                console: 'readonly',
                localStorage: 'readonly',
                sessionStorage: 'readonly',
                navigator: 'readonly',
                location: 'readonly',
                history: 'readonly',
                fetch: 'readonly',
                Blob: 'readonly',
                FileReader: 'readonly',
                FormData: 'readonly',
                Audio: 'readonly',
                Notification: 'readonly',
                CustomEvent: 'readonly',
                AbortController: 'readonly',
                XMLHttpRequest: 'readonly',
                WebSocket: 'readonly',
                XMLSerializer: 'readonly',
                URL: 'readonly',
                URLSearchParams: 'readonly',
                performance: 'readonly',
                requestAnimationFrame: 'readonly',
                cancelAnimationFrame: 'readonly',
                IntersectionObserver: 'readonly',
                ResizeObserver: 'readonly',
                MutationObserver: 'readonly',
                setTimeout: 'readonly',
                clearTimeout: 'readonly',
                setInterval: 'readonly',
                clearInterval: 'readonly',
                Intl: 'readonly',
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
            'react/display-name': 'off',
            'no-unused-vars': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]
