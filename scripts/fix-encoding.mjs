import fs from 'node:fs';
import path from 'node:path';
const roots = ['app','components','lib','content','scripts'];
const exts = new Set(['.ts','.tsx','.css','.mjs']);
const map = [
  ['₦','₦'],
  ['·','·'],
  ['©','©'],
  ['›','›'],
  ['-','-'],
  ['-','-'],
  [''',"'"],
  ['"','"'],
  ['"','"'],
  ['×','×'],
  ['é','é'],
  ['è','è'],
  ['á','á'],
  ['ó','ó'],
  ['ñ','ñ'],
  [' ',' '],
];
let changed = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.cache') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!exts.has(path.extname(entry.name))) continue;
    let text = fs.readFileSync(full, 'utf8');
    const original = text;
    for (const [from, to] of map) text = text.split(from).join(to);
    if (text !== original) {
      fs.writeFileSync(full, text, 'utf8');
      console.log('fixed', full);
      changed += 1;
    }
  }
}
for (const root of roots) if (fs.existsSync(root)) walk(root);
console.log('files changed', changed);
