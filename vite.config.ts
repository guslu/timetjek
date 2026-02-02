import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import laravel from 'laravel-vite-plugin'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    laravel({
      input: ['resources/js/app.ts'],
      refresh: true,
    }),
    vue(),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },

  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
})
