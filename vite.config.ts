import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const proxyTarget = {
    target: env.VITE_API_ORIGIN ?? 'https://dev.nyai.ai',
    changeOrigin: true,
    secure: false,
  };

  return {
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'datasourceMf',
        filename: 'remoteEntry.js',
        exposes: {
          // Full DataSources section (with internal routing) — use as a sub-app
          './DataSourcesApp': './src/expose/DataSourcesApp.tsx',
          // Individual pages — import directly when needed
          './DataSourcesList': './src/pages/DataSources/DataSourcesList/DataSourcesList.tsx',
          './DataSourceTypeSelect': './src/pages/DataSources/DataSourceTypeSelect/DataSourceTypeSelect.tsx',
          './AddDataSource': './src/pages/DataSources/NewDataSource/AddDataSource.tsx',
          './DataSourceEdit': './src/pages/DataSources/DataSourceEdit/DataSourceEdit.tsx',
          // Shared utilities
          './api': './src/lib/api.ts',
          './types': './src/types/types.ts',
        },
        shared: ['react', 'react-dom', 'react-router-dom'],
      }),
    ],
    build: {
      target: 'esnext',
      minify: false,
      assetsDir: '',
      rollupOptions: {
        output: {
          assetFileNames: '[name][extname]',
          chunkFileNames: '[name]-[hash].js',
          entryFileNames: '[name]-[hash].js',
        },
      },
    },
    preview: {
      allowedHosts: ['datasource-mf-dev.nyai.ai'],
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
      proxy: {
        '/api': {
          target: env.VITE_AUTH_ORIGIN ?? 'https://compliance.dev.nyai.ai',
          changeOrigin: true,
          secure: false,
          bypass: (req) => {
            if (req.url && req.url.endsWith('.js')) return req.url;
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              const browserCookie = req.headers.cookie ?? '';
              const authHeader = req.headers['authorization'] ?? '';
              const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
              const token = bearerToken || (env.VITE_DEV_TOKEN ?? '');
              console.log('[proxy /api]', req.url, '| injecting token:', token ? 'yes' : 'no');
              if (!browserCookie.includes('access_token=') && token) {
                proxyReq.setHeader('Cookie', `access_token=${token}`);
              }
            });
          },
        },
        '/data-engine': {
          target: env.VITE_API_ORIGIN ?? 'https://dev.nyai.ai',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const browserCookie = req.headers.cookie ?? '';
              const authHeader = req.headers['authorization'] ?? '';
              const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
              const token = bearerToken || (env.VITE_DEV_TOKEN ?? '');
              console.log('[proxy /data-engine]', req.url, '| injecting token:', token ? 'yes' : 'no');
              if (!browserCookie.includes('access_token=') && token) {
                proxyReq.setHeader('Cookie', `access_token=${token}`);
              }
            });
          },
        },
      },
    },
    server: {
      port: 5001,
      cors: true,
      origin: 'http://localhost:5001',
      proxy: {
        '/api': {
          target: env.VITE_AUTH_ORIGIN ?? 'https://compliance.dev.nyai.ai',
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('referer');
              // Inject token as cookie if the browser can't send it (localhost)
              const browserCookie = req.headers.cookie ?? '';
              if (!browserCookie.includes('access_token=')) {
                const authHeader = req.headers['authorization'] ?? '';
                const bearerToken = authHeader.startsWith('Bearer ')
                  ? authHeader.slice(7)
                  : '';
                const token = bearerToken || (env.VITE_DEV_TOKEN ?? '');
                if (token) proxyReq.setHeader('Cookie', `access_token=${token}`);
              }
            });
          },
        },
        '/data-engine': {
          ...proxyTarget,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const browserCookie = req.headers.cookie ?? '';
              const authHeader = req.headers['authorization'] ?? '';
              const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
              const token = bearerToken || (env.VITE_DEV_TOKEN ?? '');
              console.log('[proxy /data-engine]', req.url, '| cookie:', browserCookie || '(none)', '| auth header:', authHeader || '(none)', '| injecting token:', token ? 'yes' : 'no');
              if (!browserCookie.includes('access_token=') && token) {
                proxyReq.setHeader('Cookie', `access_token=${token}`);
              }
            });
          },
        },
        '/compliance-service': proxyTarget,
      },
    },
  };
});
