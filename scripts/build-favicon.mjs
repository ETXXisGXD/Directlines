import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = process.cwd();
const source = path.join(root, 'public', 'favicon.svg');
const temp = path.join(root, '.cache', 'favicon');
fs.mkdirSync(temp, { recursive: true });

const icoFiles = [];
for (const size of [16, 32, 48, 64, 128, 256]) {
  const file = path.join(temp, `icon-${size}.png`);
  await sharp(source, { density: 384 }).resize(size, size, { fit: 'contain', background: '#ffffff' }).png().toFile(file);
  icoFiles.push(file);
}

const ico = await pngToIco(icoFiles);
fs.writeFileSync(path.join(root, 'app', 'favicon.ico'), ico);
fs.writeFileSync(path.join(root, 'public', 'favicon.ico'), ico);

await sharp(source, { density: 384 }).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(root, 'app', 'icon.png'));
await sharp(source, { density: 384 }).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(root, 'public', 'icon.png'));
await sharp(source, { density: 384 }).resize(512, 512, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(root, 'public', 'favicon.png'));
await sharp(source, { density: 384 }).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(root, 'app', 'apple-icon.png'));
await sharp(source, { density: 384 }).resize(180, 180, { fit: 'contain', background: '#ffffff' }).png().toFile(path.join(root, 'public', 'apple-touch-icon.png'));

console.log('D tower favicon written. ico bytes:', ico.length);
