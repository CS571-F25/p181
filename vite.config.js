import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: '/p181/',
  build: {
    outDir: 'docs'
  },
  server: {
    // Ensure the dev server handles the base path correctly
    strictPort: false,
    // Handle all routes by serving index.html
    middlewareMode: false,
  }
})
