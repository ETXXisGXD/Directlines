import fs from 'node:fs';
const s=fs.readFileSync('lib/format.ts','utf8');
console.log(JSON.stringify(s.split('\n').slice(6,15).join('\n')));
