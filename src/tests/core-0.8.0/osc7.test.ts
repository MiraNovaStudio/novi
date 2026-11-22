/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

import { isLocalOsc7Host, OSC7_RE } from '../../main/osc7';

describe('isLocalOsc7Host', () => {
  it('accepts an empty host and localhost', () => {
    expect(isLocalOsc7Host('', 'sheliak')).toBe(true);
    expect(isLocalOsc7Host('localhost', 'sheliak')).toBe(true);
  });

  it('accepts the machine hostname, including a short name', () => {
    expect(isLocalOsc7Host('sheliak', 'sheliak.local')).toBe(true);
    expect(isLocalOsc7Host('sheliak.local', 'sheliak')).toBe(true);
  });

  it('rejects a remote host', () => {
    expect(isLocalOsc7Host('astra', 'sheliak')).toBe(false);
  });
});

describe('OSC7_RE', () => {
  it('captures a vte-style file URI with a hostname', () => {
    const match = OSC7_RE.exec('\x1b]7;file://sheliak/home/aeonath\x07');
    expect(match?.[1]).toBe('sheliak');
    expect(match?.[2]).toBe('/home/aeonath');
  });
});
