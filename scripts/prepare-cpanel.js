// scripts/prepare-cpanel.js
// Prepares the standalone build folder for 1-click cPanel deployment
const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

const rootDir = path.resolve(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');
const staticSrc = path.join(rootDir, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');
const publicSrc = path.join(rootDir, 'public');
const publicDest = path.join(standaloneDir, 'public');
const dataSrc = path.join(rootDir, 'data');
const dataDest = path.join(standaloneDir, 'data');

if (!fs.existsSync(standaloneDir)) {
  console.error('Error: .next/standalone folder not found. Please run "npm run build" first.');
  process.exit(1);
}

console.log('Copying static assets into .next/standalone...');
copyFolderSync(staticSrc, staticDest);

console.log('Copying public assets into .next/standalone...');
copyFolderSync(publicSrc, publicDest);

if (fs.existsSync(dataSrc)) {
  console.log('Copying data directory into .next/standalone...');
  copyFolderSync(dataSrc, dataDest);
}

console.log('\nSUCCESS! Your cPanel deployment bundle is ready at:');
console.log('-> .next/standalone');
console.log('\nSimply zip the contents of ".next/standalone" and upload to your cPanel application folder.');
console.log('Set startup file in cPanel to "server.js". No npm install needed on cPanel!');
