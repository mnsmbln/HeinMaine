import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk
          firebase: ['firebase/app', 'firebase/firestore'],
          // Split React into its own chunk
          react: ['react', 'react-dom'],
          // Split icons into their own chunk
          icons: ['react-icons'],
        },
      },
    },
  },
})
