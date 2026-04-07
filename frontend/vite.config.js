import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@emotion/react': fileURLToPath(new URL('./node_modules/@emotion/react', import.meta.url)),
            '@emotion/styled': fileURLToPath(new URL('./node_modules/@emotion/styled', import.meta.url)),
            '@tanstack/react-query': fileURLToPath(new URL('./node_modules/@tanstack/react-query', import.meta.url)),
            'notistack': fileURLToPath(new URL('./src/lib/notistack.js', import.meta.url)),
        },
        dedupe: [
            'react',
            'react-dom',
            '@emotion/react',
            '@emotion/styled',
            '@tanstack/react-query',
        ],
    },
    server: {
        port: 5173,
    },
    optimizeDeps: {
        include: [
            '@emotion/react',
            '@emotion/styled',
            '@tanstack/react-query',
        ],
    },
})
