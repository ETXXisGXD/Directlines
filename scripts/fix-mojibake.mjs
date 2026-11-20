import fs from 'node:fs';
import path from 'node:path';
const roots = ['app','components','lib','content','docs','scripts'];
const exts = new Set(['.ts','.tsx','.css','.mjs','.md']);
const N = '\u20A6';
const replacements = [
  [String.fromCharCode(0xE2,0x201A,0xA6), N],
  [String.fromCharCode(0xC2,0xB7), '\u00B7'],
  [String.fromCharCode(0xC2,0xA9), '\u00A9'],
  [String.fromCharCode(0xE2,0x20AC,0x2039), '\u203A'],
  [String.fromCharCode(0xE2,0x20AC,0x201C), '-'],
  [String.fromCharCode(0xE2,0x20AC,0x201D), '-'],
  [String.fromCharCode(0xE2,0x20AC,0x2013), '-'],
  [String.fromCharCode(0xE2,0x20AC,0x2014), '-'],
  [String.fromCharCode(0xE2,0x20AC,0x2122), "'"],
  [String.fromCharCode(0xE2,0x20AC,0x0153), '"'],
  [String.fromCharCode(0xE2,0x20AC,0x009C), '"'],
  [String.fromCharCode(0xC3,0x2014), '\u00D7'],
  [String.fromCharCode(0xC2,0xA0), ' '],
  [String.fromCharCode(0xA6), N],
];
let changed = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules','.next','.cache','reports'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!exts.has(path.extname(entry.name))) continue;
    let text = fs.readFileSync(full, 'utf8');
    const original = text;
    for (const [from, to] of replacements) text = text.split(from).join(to);
    if (text !== original) {
      fs.writeFileSync(full, text, 'utf8');
      console.log('fixed', full);
      changed++;
    }
  }
}
for (const root of roots) if (fs.existsSync(root)) walk(root);
console.log('files changed', changed);
