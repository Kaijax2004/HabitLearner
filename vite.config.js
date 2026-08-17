import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const devApiTarget = process.env.VITE_DEV_API_TARGET || 'http://localhost:8080'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'vue': 'vue/dist/vue.esm-bundler.js'
    }
  },
  // 生产环境配置
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia']
        }
      }
    }
  },
  // 开发环境配置
  server: {
    port: 3001,
    open: true,
    proxy: {
      '/api': {
        target: devApiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        configure: (proxy, options) => {
          // 生产环境移除详细代理日志
          if (process.env.NODE_ENV === 'development') {
            proxy.on('error', (err, req, res) => {
              console.log('代理错误:', err);
            });
          }
        }
      },
      '/uploads': {
        target: devApiTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
})

