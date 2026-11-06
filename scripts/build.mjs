#!/usr/bin/env node
// Builds the extension into dist/ (or `--outdir <dir>`): copies public/ and bundles the entry points with esbuild.
// Everything the extension needs ends up in the output folder; nothing is loaded from the network (strict CSP).
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const flag = process.argv.indexOf('--outdir');
const outdir = path.resolve(root, flag > -1 ? process.argv[flag + 1] : 'dist');

fs.rmSync(outdir, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), outdir, { recursive: true });

// Stable extension ID for installs outside the Chrome Web Store: an unpacked extension without a
// manifest "key" gets its ID (and therefore its storage) from the folder path. The key is public.
// `--store` leaves it out: the Web Store assigns its own ID (see docs/releasing.md).
if (!process.argv.includes('--store')) {
  const manifestPath = path.join(outdir, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.key = fs.readFileSync(path.join(root, 'scripts', 'extension-key.txt'), 'utf8').trim();
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

const common = {
  absWorkingDir: root,
  outdir,
  bundle: true,
  minify: true,
  target: 'chrome110',
  // External source maps only: eval-based ones would violate the extension CSP.
  sourcemap: true,
  logLevel: 'info',
};

await build({
  ...common,
  entryPoints: {
    'background.bundle': 'src/background/index.js',
    'content.bundle': 'src/content/index.js',
    'popup.bundle': 'src/popup/index.jsx',
    'options.bundle': 'src/options/index.jsx',
  },
  format: 'iife',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  // Keeps the license headers of React and friends in separate *.LEGAL.txt files next to the bundles.
  legalComments: 'linked',
});

// One stylesheet for popup and management page.
await build({ ...common, entryPoints: { theme: 'src/shared/theme.css' } });
