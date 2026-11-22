/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const VM_MARK = /vmware|virtualbox|qemu|kvm|xen|bochs|parallels|innotek/;

/**
 * True when this Linux host is a virtual machine. Chromium's GPU process
 * logs "VMware: No 3D enabled" and then never paints, so a frameless window
 * that waits on ready-to-show stays invisible.
 */
export function shouldUseSoftwareGl(input: { platform: NodeJS.Platform; virt: string | null; dmi: string }): boolean {
  if (input.platform !== 'linux') return false;
  const virt = input.virt?.trim().toLowerCase() ?? '';
  if (virt && virt !== 'none') return true;
  return VM_MARK.test(input.dmi.toLowerCase());
}

export function linuxNeedsSoftwareGl(): boolean {
  if (process.platform !== 'linux') return false;

  let virt: string | null = null;
  try {
    virt = execFileSync('systemd-detect-virt', {
      encoding: 'utf8',
      timeout: 1000,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    virt = null;
  }

  let dmi = '';
  for (const name of ['sys_vendor', 'product_name', 'bios_vendor']) {
    try {
      dmi += `${readFileSync(`/sys/class/dmi/id/${name}`, 'utf8')} `;
    } catch {
      // DMI is missing in some containers.
    }
  }

  return shouldUseSoftwareGl({ platform: 'linux', virt, dmi });
}
