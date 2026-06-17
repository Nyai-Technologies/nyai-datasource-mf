import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import federation from '@originjs/vite-plugin-federation';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        shared: {
          react: { singleton: true, requiredVersion: '^19.0.0' },
          'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
          'react-router-dom': { singleton: true, requiredVersion: '^7.0.0' },
        },
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          loadPaths: [path.resolve(__dirname, 'src/styles')],
        },
      },
    },
    build: {
      target: 'esnext',
      minify: false,
    },
    server: {
      port: 5001,
      proxy: {
        '/data-engine': {
          ...proxyTarget,
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const browserCookie = req.headers.cookie ?? '';
              if (!browserCookie.includes('access_token=')) {
                const token = env.VITE_DEV_TOKEN ?? '';
                if (token) proxyReq.setHeader('Cookie', `access_token=${token}`);
              }
            });
          },
        },
        '/compliance-service': proxyTarget,
      },
    },
  };
});
