import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';
import proc from 'child_process';
import events from 'events';
import livereload from 'rollup-plugin-livereload';
import styles from 'rollup-plugin-styles';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
import serve from './rollup.server.mjs';

const production = !process.env.ROLLUP_WATCH;

process.env.NODE_ENV = production ? 'production' : 'development';

// Watch the `public` directory and refresh the
// browser on changes when not in production
const livereloader =
  !production &&
  livereload({
    watch: 'public',
    port: 35731,
  });

function onStartRun(cmd, ...args) {
  let ran = false;
  return {
    async buildStart() {
      if (ran) return;
      const child = proc.spawn(cmd, args, {
        stdio: 'inherit',
        shell: process.platform == 'win32',
      });
      const [code, signal] = await events.once(child, 'exit');
      if (code || signal) {
        throw new Error(`Command \`${cmd}\` failed`);
      }
      ran = true;
    },
  };
}

/** @type import('rollup').RollupOptions */
export default [
  {
    input: 'src/standalone.js',
    output: {
      dir: 'public/build',
      assetFileNames: '[name][extname]',
      sourcemap: true,
    },
    onwarn(warning, warn) {
      if (warning.code !== 'EMPTY_BUNDLE') {
        warn(warning);
      }
    },
    plugins: [
      styles({
        include: 'src/standalone.css',
        mode: ['extract'],
        url: false,
        sourceMap: true,
      }),
    ],
  },
  {
    input: 'src/embed.ts',
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'embed',
      file: 'public/build/embed.js',
    },
    plugins: [
      typescript({
        include: ['src/**/*.ts'],
        sourceMap: true,
        inlineSources: true,
      }),

      livereloader,

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
  },
  {
    preserveEntrySignatures: false,
    input: 'src/main.ts',
    output: {
      sourcemap: true,
      format: 'es',
      dir: 'public/build',
      chunkFileNames: '[name].js',
      assetFileNames: '[name][extname]',
    },
    plugins: [
      // Generate openzeppelin-contracts.js data file
      onStartRun(...'yarn --cwd ../core/solidity prepare'.split(' ')),

      svelte(await import('./svelte.config.js')),

      styles({
        mode: ['extract', 'bundle.css'],
        sourceMap: true,
      }),

      alias({
        entries: {
          path: 'path-browserify',
          'highlight.js/lib/languages/python': '../../node_modules/highlight.js/lib/languages/python.js',
        },
      }),

      resolve({
        browser: true,
        dedupe: ['svelte'],
        mainFields: ['ts:main', 'module', 'main'],
        preferBuiltins: false,
      }),

      replace({
        preventAssignment: true,
        include: ['../../**/node_modules/**/*', '**/main.js'],
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
        'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
        'process.env.API_HOST': JSON.stringify(production ? '' : `http://localhost:${process.env.API_PORT || 3000}`),
      }),

      json(),

      commonjs(),

      typescript({
        include: ['src/**/*.ts', '../core/*/src/**/*.ts'],
        sourceMap: true,
        inlineSources: true,
      }),

      // In dev mode, call `npm run start` once
      // the bundle has been generated
      !production &&
        serve({
          port: process.env.PORT || '8080',
        }),

      livereloader,

      // If we're building for production (npm run build
      // instead of npm run dev), minify
      production && terser(),
    ],
    watch: {
      clearScreen: false,
    },
  },
];
