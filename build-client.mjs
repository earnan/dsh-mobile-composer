/**
 * 客户端 bundle 构建脚本：把 src/client/index.tsx 打成
 * `window.__ModuleLoader__.load({ id, factory })` 格式，供 DSH 加载器消费。
 * 非相对导入（react 等）保留为 require，运行时由 factory 的 require 参数
 * （module table）解析；相对模块内联。
 */
import { build } from 'esbuild'

const ID = '@dsh-external/dsh-mobile-composer'

await build({
  entryPoints: ['src/client/index.tsx'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  outfile: 'lib/client.js',
  jsx: 'automatic',
  external: ['react', 'react/jsx-runtime', 'react-dom'],
  minify: false,
  sourcemap: true,
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {\nvar module = { exports: {} }; var exports = module.exports;`,
  },
  footer: {
    js: 'return module.exports; } });',
  },
  logLevel: 'info',
})

console.log(`built lib/client.js for ${ID}`)
