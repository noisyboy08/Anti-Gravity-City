import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    chunkSizeWarningLimit: 1200, // Three.js is inherently large
    rollupOptions: {
      output: {
        manualChunks: {
          'react-core': ['react', 'react-dom'],
          'three-engine': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation': ['framer-motion', 'gsap'],
          'ui-icons': ['lucide-react']
        }
      }
    }
  }
})
