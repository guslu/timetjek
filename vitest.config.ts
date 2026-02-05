import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['resources/js/**/*.{test,spec}.{ts,vue}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['resources/js/**/*.{ts,vue}'],
      exclude: ['resources/js/**/*.{test,spec}.ts', 'resources/js/env.d.ts', 'resources/js/**/AnimatedNetworkBackground.vue'],
    },
  },
})
