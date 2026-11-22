/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

import { shouldUseSoftwareGl } from '../../main/software-gl';

describe('shouldUseSoftwareGl', () => {
  it('stays on the hardware path outside Linux', () => {
    expect(shouldUseSoftwareGl({ platform: 'win32', virt: 'vmware', dmi: 'VMware, Inc.' })).toBe(false);
  });

  it('uses software GL when systemd-detect-virt names a hypervisor', () => {
    expect(shouldUseSoftwareGl({ platform: 'linux', virt: 'vmware', dmi: '' })).toBe(true);
    expect(shouldUseSoftwareGl({ platform: 'linux', virt: 'kvm', dmi: '' })).toBe(true);
  });

  it('stays on the hardware path when systemd-detect-virt reports none', () => {
    expect(shouldUseSoftwareGl({ platform: 'linux', virt: 'none', dmi: 'Dell Inc. XPS' })).toBe(false);
  });

  it('falls back to DMI when virt detection is unavailable', () => {
    expect(shouldUseSoftwareGl({ platform: 'linux', virt: null, dmi: 'VMware, Inc. VMware Virtual Platform' })).toBe(true);
    expect(shouldUseSoftwareGl({ platform: 'linux', virt: null, dmi: 'Dell Inc.' })).toBe(false);
  });
});
