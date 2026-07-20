/**
 * Fails if any module require()'d from the live server graph is missing from
 * package.json. Catches the class of bug where a stale local node_modules hides
 * an undeclared dependency that then crashes on a host's clean install.
 *
 *   pnpm check:deps
 *
 * Only walks what server.js can actually reach, so unmounted legacy files
 * (models/, bookingController, reviewController) don't cause false alarms.
 */
const fs = require('fs');
const path = require('path');
const Module = require('module');

const root = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const declared = new Set([
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.devDependencies || {}),
]);
const builtins = new Set(Module.builtinModules);

const seen = new Set();
const missing = new Map(); // module -> files that require it

const packageName = (spec) =>
  spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];

function walk(file) {
  const abs = require.resolve(file);
  if (seen.has(abs) || abs.includes('node_modules')) return;
  seen.add(abs);

  const src = fs.readFileSync(abs, 'utf8');
  for (const m of src.matchAll(/require\(\s*['"]([^'"]+)['"]\s*\)/g)) {
    const spec = m[1];
    if (spec.startsWith('.') || spec.startsWith('/')) {
      try {
        walk(path.resolve(path.dirname(abs), spec));
      } catch {
        /* dynamic/optional path — ignore */
      }
      continue;
    }
    const name = packageName(spec);
    if (builtins.has(name) || name.startsWith('node:')) continue;
    if (!declared.has(name)) {
      if (!missing.has(name)) missing.set(name, new Set());
      missing.get(name).add(path.relative(root, abs));
    }
  }
}

walk(path.join(root, 'server.js'));

if (missing.size === 0) {
  console.log(`✅ deps OK — ${seen.size} files reachable from server.js, all imports declared`);
  process.exit(0);
}

console.error('❌ Undeclared dependencies reachable from server.js:\n');
for (const [name, files] of missing) {
  console.error(`  ${name}  <- ${[...files].join(', ')}`);
}
console.error(`\nFix: pnpm add ${[...missing.keys()].join(' ')}`);
process.exit(1);
