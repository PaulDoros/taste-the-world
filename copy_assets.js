const fs = require('fs');
const path = require('path');

const srcDir =
  'C:\\Users\\Paul Doros\\.gemini\\antigravity\\brain\\27b0c970-4f1a-4875-94e2-4ea04b52c0dd';
const destDir = 'e:\\EXPO Training\\taste-the-world\\assets\\store_graphics';

const files = [
  'feature_graphic_1771147155364.png',
  'feature_graphic_1771147131096.png',
  'feature_graphic_play_store_1771147110167.png',
];

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

files.forEach((file) => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  try {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file}`);
  } catch (err) {
    console.error(`Error copying ${file}:`, err);
  }
});
