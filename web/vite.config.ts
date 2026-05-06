import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      svgr({
        // SVG as React components
        svgrOptions: {
          exportType: 'default',
        },
        include: '**/*.svg',
      }),
    ],

    // Test configuration
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/setupTests.ts'],
      css: true,
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
      exclude: ['tests/**/*', 'e2e/**/*'],
    },

    // Define aliases
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    // Development server configuration
    server: {
      port: 3000,
      host: true,
      open: true,
      proxy: {
        // Proxy API requests to backend
        '/api': {
          target: 'http://localhost:2020',
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('proxy error', err);
            });
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log(
                'Sending Request to the Target:',
                req.method,
                req.url
              );
            });
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log(
                'Received Response from the Target:',
                proxyRes.statusCode,
                req.url
              );
            });
          },
        },
      },
    },

    // Build configuration
    build: {
      outDir: 'build',
      // Dev sourcemaps are handled by Vite automatically
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('react-router-dom')) return 'router';
          },
        },
      },
    },

    // CSS configuration
    css: {
      modules: {
        // CSS Modules configuration
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          // SCSS global imports if needed
          additionalData: ``,
        },
      },
    },

    // Environment variables configuration
    define: {
      // Keep existing REACT_APP_ variables for compatibility
      ...Object.keys(env).reduce((prev, key) => {
        if (key.startsWith('REACT_APP_')) {
          prev[`process.env.${key}`] = JSON.stringify(env[key]);
        }
        return prev;
      }, {}),
    },

    // Additional configuration
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  };
});
