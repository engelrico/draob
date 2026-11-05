#!/usr/bin/env node
// Checks that every package we ship (production dependency tree) has a permissive license.
// No extra dependency: reads the tree from `npm ls` and each license from node_modules.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ALLOWED = new Set(['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', '0BSD']);

/** True if an SPDX expression is allowed: "A OR B" needs one allowed side, "A AND B" needs both. */
function isAllowedLicense(expression) {
  if (typeof expression !== 'string' || !expression.trim()) return false;
  const expr = expression.trim().replace(/^\(+|\)+$/g, '');
  if (/\sOR\s/i.test(expr)) return expr.split(/\sOR\s/i).some(isAllowedLicense);
  if (/\sAND\s/i.test(expr)) return expr.split(/\sAND\s/i).every(isAllowedLicense);
  return ALLOWED.has(expr.trim());
}

function licenseOf(pkg) {
  if (typeof pkg.license === 'string') return pkg.license;
  if (pkg.license && typeof pkg.license.type === 'string') return pkg.license.type;
  if (Array.isArray(pkg.licenses)) return pkg.licenses.map((l) => l.type || l).join(' OR ');
  return undefined;
}

function collect(tree, seen = new Map()) {
  for (const [name, node] of Object.entries(tree.dependencies || {})) {
    const key = `${name}@${node.version}`;
    if (!seen.has(key)) {
      seen.set(key, { name, version: node.version });
      collect(node, seen);
    }
  }
  return seen;
}

function productionPackages(root) {
  let out;
  try {
    out = execFileSync('npm', ['ls', '--omit=dev', '--all', '--json'], {
      cwd: root,
      encoding: 'utf8',
    });
  } catch (err) {
    out = err.stdout; // npm ls exits non-zero on tree problems but still prints JSON
  }
  return [...collect(JSON.parse(out)).values()];
}

function check(root = path.resolve(__dirname, '..')) {
  return productionPackages(root).map(({ name, version }) => {
    const file = require.resolve(`${name}/package.json`, { paths: [root] });
    const license = licenseOf(JSON.parse(fs.readFileSync(file, 'utf8')));
    return { name, version, license: license || 'UNKNOWN', ok: isAllowedLicense(license) };
  });
}

module.exports = { isAllowedLicense, licenseOf, collect, check, ALLOWED };

if (require.main === module) {
  const rows = check();
  const width = Math.max(...rows.map((r) => `${r.name}@${r.version}`.length));
  for (const r of rows)
    console.log(
      `${r.ok ? 'ok  ' : 'FAIL'} ${`${r.name}@${r.version}`.padEnd(width)}  ${r.license}`,
    );
  const bad = rows.filter((r) => !r.ok);
  if (bad.length) {
    console.error(
      `\n${bad.length} package(s) with a license outside the allow-list (${[...ALLOWED].join(', ')}).`,
    );
    process.exit(1);
  }
  console.log(`\nAll ${rows.length} shipped packages use allowed licenses.`);
}
