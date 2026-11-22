/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

interface PackageJson {
  scripts?: Record<string, string>;
  build?: {
    directories?: { buildResources?: string };
    linux?: { executableName?: string };
    deb?: { afterInstall?: string; afterRemove?: string; compression?: string };
  };
}

const ROOT = join(__dirname, '..', '..', '..');

describe('Debian packaging scripts', () => {
  let packageJson: PackageJson;

  beforeAll(() => {
    packageJson = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
  });

  it('points electron-builder at scripts/packaging after-install/after-remove', () => {
    expect(packageJson.build?.deb?.afterInstall).toBe('scripts/packaging/after-install.sh');
    expect(packageJson.build?.deb?.afterRemove).toBe('scripts/packaging/after-remove.sh');
  });

  it('has pack:deb', () => {
    expect(packageJson.scripts?.['pack:deb']).toContain('--linux deb');
    expect(packageJson.scripts?.['pack:deb']).toContain('--publish never');
  });

  it('uses gzip for the .deb so fpm does not sit in silent xz compression', () => {
    expect(packageJson.build?.deb?.compression).toBe('gz');
  });

  it('after-install.sh exists and installs the novi CLI wrapper', () => {
    const path = join(ROOT, 'scripts', 'packaging', 'after-install.sh');
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, 'utf-8');
    expect(content).toContain('--novi-cli');
    expect(content).toContain('--novi-direct');
    expect(content).toContain('setsid');
    expect(content).toContain("cat > '/opt/${sanitizedProductName}/novi'");
    expect(content).toContain('exec "$APP" --novi-cli "$@"');
    expect(content).toContain("update-alternatives --install '/usr/bin/novi'");
    expect(content).toContain('chrome-sandbox');
    expect(content).toContain('gtk-update-icon-cache');
  });

  it('after-remove.sh exists and unregisters the novi CLI wrapper', () => {
    const path = join(ROOT, 'scripts', 'packaging', 'after-remove.sh');
    expect(existsSync(path)).toBe(true);
    const content = readFileSync(path, 'utf-8');
    expect(content).toContain("update-alternatives --remove 'novi'");
    expect(content).toContain("rm -f '/opt/${sanitizedProductName}/novi'");
    expect(content).toContain('gtk-update-icon-cache');
  });

  it('keeps the Linux binary named NoviEditor so it does not collide with the novi wrapper', () => {
    expect(packageJson.build?.linux?.executableName).toBe('NoviEditor');
  });

  it('copy-icons.js generates Linux hicolor PNGs on every host OS', () => {
    const src = readFileSync(join(ROOT, 'scripts', 'copy-icons.js'), 'utf-8');
    expect(src).toContain('LINUX_ICON_SIZES');
    expect(src).toContain('generateLinuxIcons');
    expect(src).toMatch(/await generateLinuxIcons\(sharp\)/);
    expect(src).not.toMatch(/if\s*\(\s*isLinux\s*\)/);
  });

  it('after-pack.js only embeds an icon when the pack target is Windows', () => {
    const src = readFileSync(join(ROOT, 'scripts', 'after-pack.js'), 'utf-8');
    expect(src).toContain('electronPlatformName');
    expect(src).toMatch(/electronPlatformName !== 'win32'/);
  });
});
