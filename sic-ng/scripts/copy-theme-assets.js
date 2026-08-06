const fs = require('node:fs');
const path = require('node:path');

const src = path.join(__dirname, '..', 'projects', 'sic-ng', 'src', 'lib', 'tokens');
const dest = path.join(__dirname, '..', 'dist', 'sic-ng', 'theme');

fs.mkdirSync(dest, { recursive: true });

for (const file of fs.readdirSync(src)) {
  if (file.endsWith('.css')) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
  }
}

console.log(`sic-ng: copied theme CSS to ${dest}`);
