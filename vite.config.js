import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
export default defineConfig({
    plugins: [vue()],
    resolve: {
        alias: {
            '@': resolve(__dirname, 'resources/js'),
        },
    },
    server: {
        origin: 'http://localhost:5173',
        port: 5173,
    },
    build: {
        outDir: 'public/build',
        emptyOutDir: true,
        manifest: 'manifest.json', // 👈 THIS is the fix
        rollupOptions: {
            input: 'resources/js/app.ts',
        },
    },
    publicDir: false,
});
