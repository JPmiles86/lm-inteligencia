import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Add bundle visualization in analyze mode
    process.env.ANALYZE && visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    // Add gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Add brotli compression
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/config': path.resolve(__dirname, './config'),
      '@/content': path.resolve(__dirname, './content'),
    },
  },
  
  server: {
    port: 3001,
    host: true,
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    rollupOptions: {
      output: {
        // Manual chunk splitting
        manualChunks: {
          // React and core dependencies
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI libraries
          'ui-vendor': [
            '@headlessui/react',
            '@heroicons/react',
            'framer-motion',
          ],
          
          // Form and validation
          'form-vendor': [
            'react-hook-form',
            'zod',
          ],
          
          // Utilities
          'utils-vendor': [
            'date-fns',
            'clsx',
            'tailwind-merge',
          ],
          
          // AI and content processing
          'ai-vendor': [
            'marked',
            'dompurify',
          ],
          
          // Admin components (lazy loaded)
          'admin': [
            './src/components/admin/SimplifiedAdminDashboard',
            './src/components/admin/SimplifiedSettings',
            './src/components/admin/BlogManagement',
          ],
          
          // AI components (lazy loaded)
          'ai-dashboard': [
            './src/components/ai/AIContentDashboard',
            './src/components/ai/GenerationWorkspace',
            './src/components/ai/ContextManager',
          ],
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name?.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType!)) {
            extType = 'img';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        
        // Entry file naming
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
    exclude: [
      // Exclude heavy libraries that should be lazy loaded
      '@tinymce/tinymce-react',
    ],
  },
})