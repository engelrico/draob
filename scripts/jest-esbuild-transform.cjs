// Jest transformer based on esbuild: ESM and JSX to CommonJS, no Babel needed.
const crypto = require('crypto');
const { transformSync, version } = require('esbuild');

module.exports = {
  process(source, filename) {
    const { code, map } = transformSync(source, {
      loader: filename.endsWith('.jsx') ? 'jsx' : 'js',
      format: 'cjs',
      target: 'node20',
      jsx: 'automatic',
      sourcemap: 'external',
      sourcefile: filename,
    });
    return { code, map };
  },
  getCacheKey(source, filename) {
    return crypto
      .createHash('sha1')
      .update(version)
      .update('\0')
      .update(filename)
      .update('\0')
      .update(source)
      .digest('hex');
  },
};
