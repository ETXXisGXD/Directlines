import fs from 'node:fs';
import path from 'node:path';

const file = process.argv[2];
const projectRef = process.env.SUPABASE_PROJECT_REF ?? 'jmlbugxtqqolgmayghle';
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!file) {
  console.error('Usage: node scripts/apply-sql.mjs <file.sql>');
  process.exit(1);
}
if (!token) {
  console.error('SUPABASE_ACCESS_TOKEN is required.');
  process.exit(1);
}

const sql = fs.readFileSync(path.resolve(process.cwd(), file), 'utf8').replace(/^\uFEFF/, '').replace(/\\r\\n/g, '\n');

const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query: sql }),
});

const text = await response.text();
if (!response.ok) {
  console.error(`SQL failed (${response.status}):`);
  console.error(text);
  process.exit(1);
}
console.log(`Applied ${file}`);
if (text.trim()) console.log(text);

