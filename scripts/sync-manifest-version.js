#!/usr/bin/env node
// Copies the version from package.json into public/manifest.json.
// Runs automatically as the npm "version" lifecycle script (see package.json), so
// `npm version minor` keeps both files identical and puts them into the release commit.
const fs = require('fs');
const path = require('path');

function syncManifestVersion(root = path.resolve(__dirname, '..')) {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const file = path.join(root, 'public', 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
  manifest.version = pkg.version;
  fs.writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
  return pkg.version;
}

module.exports = { syncManifestVersion };

if (require.main === module) {
  console.log(`manifest.json version -> ${syncManifestVersion()}`);
}
