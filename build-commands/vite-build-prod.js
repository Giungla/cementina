
import {
  build,
} from 'vite'
import crypto from 'crypto'
import * as fs from 'node:fs'

const hash = crypto
  .randomBytes(6)
  .toString('hex')

// Captura argumentos passados: ex: node build.js --name=custom
const args = Object.fromEntries(
  process.argv.slice(2).map(arg => {
    const [key, value] = arg
    .replace(/^--/, '')
    .split('=')

    return [key, value ?? true]
  })
)

const entry = args.name

if (typeof entry !== 'string') {
  throw new Error(`You must specify a name`);
}

const filename = `${entry}.${hash}.js`

fs.readdir('dist', (err, files) => {
  if (err) throw err

  const filteredFiles = files.filter((file) => file.startsWith(entry))

  if (filteredFiles.length > 0) {
    for (const file of filteredFiles) {
      fs.unlink(`dist/${file}`, (err) => {
        if (!err) {
          return console.log(file, 'removed')
        }

        console.log(`Unable to remove ${file}`, err)
      })
    }

    return
  }

  console.log('No file found.')
})

await build({
  configFile: false,

  define: {
    __VUE_OPTIONS_API__: 'true',
    __VUE_PROD_DEVTOOLS__: 'true',
    'process.env.NODE_ENV': '"production"',
  },

  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2020',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        booleans: true,
        conditionals: true,
        dead_code: true,
        drop_console: false,
        drop_debugger: false,
        evaluate: true,
        keep_infinity: true,
        reduce_vars: true,
        sequences: true,
        passes: 3,
        unsafe: false,
        comparisons: true,
        collapse_vars: true,
        typeofs: true,
        toplevel: true,
      },
      mangle: {
        toplevel: true,
        safari10: true,
      },
      format: {
        comments: false
      },
      safari10: true,
    },

    lib: {
      name: 'Giungla',
      formats: ['iife'],
      entry: `src/${entry}.ts`,
      fileName: () => filename,
    },

    rolldownOptions: {
      external: [
        'vue',
      ],

      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})

console.log(`Generated file: dev/${filename}`)
