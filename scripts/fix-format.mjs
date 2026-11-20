import fs from 'node:fs';
const p='lib/format.ts';
let s=fs.readFileSync(p,'utf8');
s=s.replace("' ₦0'", "'₦0'").replace('` ₦${(value / 1_000_000).toFixed(1)}m`','`₦${(value / 1_000_000).toFixed(1)}m`').replace('` ₦${Math.round(value / 1_000)}k`','`₦${Math.round(value / 1_000)}k`');
fs.writeFileSync(p,s,'utf8');
console.log(JSON.stringify(s.split('\n').slice(6,15).join('\n')));
