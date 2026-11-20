import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArg = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};

const token = process.env.VERCEL_TOKEN;
const teamId = getArg('--team', 'team_pFfthGpv8J9JfuVWttM3TGHs');
const projectId = getArg('--project');
const envFile = getArg('--env-file');
const keys = getArg('--keys', '').split(',').map((key) => key.trim()).filter(Boolean);
const overridesFile = getArg('--overrides-file', '');
const overrides = overridesFile ? JSON.parse(fs.readFileSync(overridesFile, 'utf8').replace(/^\uFEFF/, '')) : JSON.parse(getArg('--overrides', '{}'));

if (!token || !projectId || !envFile) {
  console.error('Usage: VERCEL_TOKEN=... node scripts/vercel-env.mjs --project prj_x --env-file .env.local --keys A,B --overrides {"KEY":"value"}');
  process.exit(1);
}

const env = {};
for (const line of fs.readFileSync(path.resolve(envFile), 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^"|"$/g, '');
}

const response = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}`, {
  headers: { Authorization: `Bearer ${token}` },
});
if (!response.ok) throw new Error(await response.text());
const existing = (await response.json()).envs ?? [];
const byKey = new Map(existing.map((item) => [item.key, item]));

for (const key of keys) {
  const value = overrides[key] ?? env[key];
  if (value === undefined) {
    console.warn(`skip ${key}: not found`);
    continue;
  }
  if (value === '') {
    console.warn(`skip ${key}: empty value`);
    continue;
  }
  const found = byKey.get(key);
  if (found) {
    const update = await fetch(`https://api.vercel.com/v9/projects/${projectId}/env/${found.id}?teamId=${teamId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, target: found.target ?? ['production', 'preview', 'development'] }),
    });
    if (!update.ok) throw new Error(`update ${key}: ${await update.text()}`);
    console.log(`updated ${key}`);
  } else {
    const create = await fetch(`https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, type: 'encrypted', target: ['production', 'preview', 'development'] }),
    });
    if (!create.ok) throw new Error(`create ${key}: ${await create.text()}`);
    console.log(`created ${key}`);
  }
}


