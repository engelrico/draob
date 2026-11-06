import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(__dirname, '../..');
let out;

beforeAll(() => {
  out = fs.mkdtempSync(path.join(os.tmpdir(), 'draob-build-'));
  execFileSync(process.execPath, [path.join(root, 'scripts', 'build.mjs'), '--outdir', out], {
    stdio: 'pipe',
  });
});

afterAll(() => fs.rmSync(out, { recursive: true, force: true }));

const read = (file) => fs.readFileSync(path.join(out, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(out, file));

describe('build output', () => {
  it('contains every file the manifest points to', () => {
    const manifest = JSON.parse(read('manifest.json'));
    const files = [
      manifest.background.service_worker,
      manifest.action.default_popup,
      manifest.options_page,
      ...Object.values(manifest.action.default_icon),
      ...Object.values(manifest.icons),
      ...manifest.content_scripts.flatMap((c) => c.js),
    ];
    for (const file of files) expect([file, exists(file)]).toEqual([file, true]);
  });

  it('lets popup and management page load existing scripts and the stylesheet', () => {
    for (const page of ['popup.html', 'options.html']) {
      const refs = [...read(page).matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
      expect(refs).toEqual(expect.arrayContaining(['theme.css']));
      for (const ref of refs) expect([page, ref, exists(ref)]).toEqual([page, ref, true]);
    }
  });

  it('bundles without eval or new Function (strict extension CSP)', () => {
    for (const bundle of fs.readdirSync(out).filter((f) => f.endsWith('.bundle.js'))) {
      expect([bundle, /\beval\(|new Function\(/.test(read(bundle))]).toEqual([bundle, false]);
    }
  });

  it('keeps the license notices of the bundled React packages', () => {
    expect(read('popup.bundle.js.LEGAL.txt')).toMatch(/@license React/);
  });

  it('writes source maps next to the bundles but never inlines them', () => {
    expect(exists('popup.bundle.js.map')).toBe(true);
    expect(read('popup.bundle.js')).not.toMatch(/sourceMappingURL=data:/);
  });
});
