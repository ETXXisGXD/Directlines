import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = process.cwd();
const source = path.join(root, 'public', 'favicon.png');
const temp = path.join(root, '.cache', 'favicon');
fs.mkdirSync(temp, { recursive: true });
const files = [];
for (const size of [16, 32, 48, 64, 128, 256]) {
  const file = path.join(temp, `icon-${size}.png`);
  await sharp(source).resize(size, size, { fit: 'contain', background: '#ffffff' }).png().toFile(file);
  files.push(file);
}
const ico = await pngToIco(files);
fs.writeFileSync(path.join(root, 'app', 'favicon.ico'), ico);
fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), ico);
console.log('favicon.ico bytes', ico.length);
