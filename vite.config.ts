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
        manualChunks(id) {
          // Node modules chunking
          if (id.includes('node_modules')) {
            // React and related
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('@headlessui') || id.includes('@heroicons') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            // Form and validation
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'form-vendor';
            }
            // Utilities
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'utils-vendor';
            }
            // AI and content
            if (id.includes('marked') || id.includes('dompurify') || id.includes('jsdom')) {
              return 'ai-vendor';
            }
            // Everything else in vendor
            return 'vendor';
          }
          
          // App code chunking
          if (id.includes('src/components/admin')) {
            return 'admin';
          }
          if (id.includes('src/components/ai')) {
            return 'ai-dashboard';
          }
          if (id.includes('src/services/ai/providers')) {
            return 'ai-providers';
          }
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