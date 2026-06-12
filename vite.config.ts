import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/react-autobattler/dist',
  build: {
    rollupOptions: {
      output: {
        // Keeps the primary entry file name consistent (e.g., index.js)
        entryFileNames: 'assets/[name].js',

        // Keeps code-split chunk names consistent (e.g., vendor.js)
        chunkFileNames: 'assets/[name].js',

        // Keeps CSS and media asset names consistent (e.g., index.css)
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
