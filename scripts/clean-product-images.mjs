import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const manifest=JSON.parse(fs.readFileSync('content/product-images.json','utf8').replace(/^\uFEFF/,''));
const keep=new Set();
for (const v of Object.values(manifest)) if (Array.isArray(v)) for (const p of v) keep.add(path.basename(p));
const dir=path.join(root,'public','products');
for (const f of fs.readdirSync(dir)) {
  if (!keep.has(f)) { fs.rmSync(path.join(dir,f),{force:true}); console.log('removed',f); }
}
console.log('kept',keep.size);
