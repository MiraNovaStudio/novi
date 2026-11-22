/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packagingDir = path.resolve('scripts/packaging');
const iconsDir = path.join(packagingDir, 'icons');
const appIcon = path.resolve('src/renderer/assets/icon.png');
const installerIcon = path.resolve('src/renderer/assets/miranova_icon.png');

const LINUX_ICON_SIZES = [16, 32, 48, 64, 128, 256, 512];

async function generateLinuxIcons(sharp) {
  fs.mkdirSync(iconsDir, { recursive: true });
  await Promise.all(
    LINUX_ICON_SIZES.map((s) =>
      sharp(appIcon)
        .resize(s, s)
        .png()
        .toFile(path.join(iconsDir, `${s}x${s}.png`))
        .then(() => console.log(`Generated icons/${s}x${s}.png`))
    )
  );
  console.log('All Linux icon sizes generated');
}

function generateAppIco() {
  execSync(`npx --yes png-to-ico "${appIcon}" > "${path.join(packagingDir, 'icon.ico')}"`, { shell: true });
  console.log('Generated scripts/packaging/icon.ico');
}

async function generateInstallerIco(sharp) {
  const buf = await sharp(installerIcon)
    .resize(256, 256, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const squarePath = path.join(packagingDir, 'installer-icon-square.png');
  fs.writeFileSync(squarePath, buf);
  execSync(`npx --yes png-to-ico "${squarePath}" > "${path.join(packagingDir, 'installer-icon.ico')}"`, { shell: true });
  console.log('Generated scripts/packaging/installer-icon.ico');
}

async function main() {
  fs.mkdirSync(packagingDir, { recursive: true });
  fs.copyFileSync(appIcon, path.join(packagingDir, 'icon.png'));

  const sharp = require('sharp');

  // Hicolor PNGs are required for `electron-builder --linux deb` on any host.
  await generateLinuxIcons(sharp);

  if (process.platform === 'win32') {
    try {
      generateAppIco();
    } catch (e) {
      console.log('Failed to generate icon.ico: ' + e.message);
    }

    try {
      await generateInstallerIco(sharp);
    } catch (e) {
      if (fs.existsSync(path.join(packagingDir, 'installer-icon.ico'))) {
        console.log('Using existing scripts/packaging/installer-icon.ico');
      } else {
        console.log('Failed to generate installer-icon.ico: ' + e.message);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
