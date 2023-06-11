import { defineConfig } from 'vite'
import path from 'path'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '~bootstrap': path.resolve(__dirname, 'node_modules/bootstrap'),
      '~bootswatch': path.resolve(__dirname, 'node_modules/bootswatch'),
      '~icons': path.resolve(__dirname, 'node_modules/bootstrap-icons/'),
    }
  }
})
