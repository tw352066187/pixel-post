import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages: https://tw352066187.github.io/pixel-post/
  base: '/pixel-post/',
})
