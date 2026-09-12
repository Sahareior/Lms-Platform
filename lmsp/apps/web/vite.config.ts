import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  resolve: {
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  build: {
    // Split stable vendor libraries into their own chunks so they are
    // cached independently and never re-downloaded when app code changes.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules\/(react|react-dom|react-router|react-router-dom|@reduxjs\/toolkit|react-redux|@my-monorepo\/store)/,
              priority: 20,
            },
            {
              name: 'antd-vendor',
              test: /node_modules\/(antd|@ant-design|@rc-component|rc-)/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
