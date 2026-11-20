import fs from 'node:fs';
import path from 'node:path';
const roots=['app','components','lib','content','docs','scripts'];
const exts=new Set(['.ts','.tsx','.css','.mjs','.md']);
const bad=[];
function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){if(['node_modules','.next','.cache','reports'].includes(e.name))continue;const f=path.join(dir,e.name);if(e.isDirectory())walk(f);else if(exts.has(path.extname(e.name))){const s=fs.readFileSync(f,'utf8');const hits=['\u00E2','\u00C2','\u00C3','\uFFFD','\u00A6'].filter(c=>s.includes(c));if(hits.length)bad.push([f,[...new Set(hits)].map(c=>c.codePointAt(0).toString(16)).join(',')]);}}}
for(const r of roots)if(fs.existsSync(r))walk(r);
console.log(JSON.stringify(bad,null,2));
