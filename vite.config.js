import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    input: ['assets/scss/layout/default.scss', 'assets/js/products.js'],
    refresh: true,
  })],
  server: {
    host: true
  }
})
