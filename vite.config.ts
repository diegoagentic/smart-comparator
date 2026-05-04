import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES === 'true' ? '/demo-strata/' : '/',
  server: {
    port: 8085,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom')) return 'react-vendor'
          if (/[\\/]react[\\/]/.test(id) || id.includes('react/jsx-runtime')) return 'react-vendor'
          if (id.includes('recharts')) return 'chart-vendor'
          if (id.includes('framer-motion')) return 'motion-vendor'
          if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf-vendor'
          if (id.includes('lucide-react') || id.includes('@heroicons')) return 'icons-vendor'
          if (id.includes('@headlessui')) return 'headlessui-vendor'
          return 'vendor'
        },
      },
    },
  },
})
