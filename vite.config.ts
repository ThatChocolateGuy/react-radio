import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deploying to GitHub Pages at https://ThatChocolateGuy.github.io/react-radio
// requires assets to be served from "/react-radio/".
export default defineConfig({
  plugins: [react()],
  base: '/react-radio/',
  server: { port: 5173 },
})
