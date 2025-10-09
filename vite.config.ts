import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deploying to GitHub Pages at https://ThatChocolateGuy.github.io/react-radio
// requires assets to be served from "/react-radio/".
export default defineConfig({
  plugins: [react()],
  base: '/react-radio/',
  server: { 
    port: 5173,
    // Proxy configuration to help with CORS during development
    // This forwards requests to radio streams through our dev server
    proxy: {
      '/radio-proxy': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Allow the actual stream URL to be passed as a query parameter
            const url = new URL(req.url || '', 'http://localhost:5173');
            const streamUrl = url.searchParams.get('url');
            if (streamUrl) {
              proxyReq.path = streamUrl;
            }
          });
        },
      },
    },
  },
})
