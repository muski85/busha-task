import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // '' prefix loads vars without the VITE_ prefix. These stay in the node
  // process and are never inlined into the client bundle, which is the whole
  // point: BUSHA_API_KEY is a secret key with full account access.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // the browser calls /api/balances, the key is attached here
        '/api': {
          target: env.BUSHA_BASE_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/v1'),
          headers: {
            Authorization: `Bearer ${env.BUSHA_API_KEY}`,
          },
        },
      },
    },
  }
})
