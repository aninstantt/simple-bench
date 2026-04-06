import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import jotaiDebugLabel from 'jotai-babel/plugin-debug-label'
import jotaiReactRefresh from 'jotai-babel/plugin-react-refresh'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig, type PluginOption } from 'vite-plus'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://github.com/mdx-editor/editor/issues/491
const prismjsGlobalShim = {
  name: 'prismjs-global-shim',
  transform(code: string, id: string) {
    if (id.includes('prismjs/components/')) {
      return `var Prism = require('prismjs');\n${code}`
    }
  }
}

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  plugins: [
    prismjsGlobalShim,
    react(),
    babel({
      plugins: [
        'babel-plugin-react-compiler',
        jotaiDebugLabel,
        jotaiReactRefresh
      ]
    }),
    tailwindcss(),
    VitePWA({
      injectRegister: 'auto',
      registerType: 'prompt',
      devOptions: {
        enabled: false
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true
      },
      manifest: {
        name: 'Simple Bench',
        short_name: 'simple-bench',
        description: 'No description for now',
        theme_color: '#646cff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    }) as PluginOption
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/test/**/*.test.tsx', 'src/test/**/*.test.ts']
  },
  staged: {
    '*': 'vp check --fix'
  },
  lint: {
    ignorePatterns: ['dev-dist/**', 'dist/**'],
    options: { typeAware: true, typeCheck: true }
  },
  fmt: {
    ignorePatterns: ['dist/**'],
    semi: false,
    trailingComma: 'none',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    bracketSpacing: true,
    bracketSameLine: false,
    arrowParens: 'avoid',
    endOfLine: 'lf',
    sortImports: {
      groups: [
        'type-import',
        ['value-builtin', 'value-external'],
        'type-internal',
        'value-internal',
        ['type-parent', 'type-sibling', 'type-index'],
        ['value-parent', 'value-sibling', 'value-index'],
        'unknown'
      ]
    },
    sortTailwindcss: {
      stylesheet: './src/index.css',
      functions: ['clsx', 'cn'],
      preserveWhitespace: true
    },
    sortPackageJson: {
      sortScripts: true
    }
  }
})
