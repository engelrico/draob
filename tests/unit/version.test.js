import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { syncManifestVersion } from '../../scripts/sync-manifest-version';

const root = path.resolve(__dirname, '../..');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

// Chrome accepts 1 to 4 dot-separated integers (no suffixes like -beta, no leading zeros).
const CHROME_VERSION = /^(0|[1-9]\d{0,4})(\.(0|[1-9]\d{0,4})){0,3}$/;

describe('version', () => {
  it('is identical in package.json and public/manifest.json', () => {
    expect(read('public/manifest.json').version).toBe(read('package.json').version);
  });

  it('is a version Chrome accepts', () => {
    expect(read('package.json').version).toMatch(CHROME_VERSION);
  });

  it('rejects suffixes Chrome would refuse', () => {
    for (const bad of ['1.0.0-beta', '1.0.0.0.0', '01.2.3', 'v1.0.0', '']) {
      expect(bad).not.toMatch(CHROME_VERSION);
    }
  });
});

describe('sync-manifest-version', () => {
  it('copies the package version into the manifest and keeps everything else', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'draob-version-'));
    fs.mkdirSync(path.join(dir, 'public'));
    fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify({ version: '1.2.3' }));
    fs.writeFileSync(
      path.join(dir, 'public', 'manifest.json'),
      JSON.stringify({ name: 'draob', version: '0.0.1', permissions: ['storage'] }),
    );

    expect(syncManifestVersion(dir)).toBe('1.2.3');
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'public', 'manifest.json'), 'utf8'));
    expect(manifest).toEqual({ name: 'draob', version: '1.2.3', permissions: ['storage'] });
    fs.rmSync(dir, { recursive: true, force: true });
  });
});
