/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

/** OSC 7: ESC ] 7 ; file://host/path BEL-or-ST */
export const OSC7_RE = /\x1b\]7;file:\/\/([^/]*)(\/[^\x07\x1b]*)(?:\x07|\x1b\\)/;

/**
 * True when an OSC 7 host is this machine. Desktop Linux (Debian's vte.sh)
 * reports `file://<hostname>/...`, not `file://localhost/...`. A remote
 * shell's OSC 7 uses the remote hostname and must stay non-local.
 */
export function isLocalOsc7Host(host: string, localHostname: string): boolean {
  if (!host || host.toLowerCase() === 'localhost') return true;
  const norm = (value: string): string => value.toLowerCase().replace(/\.$/, '');
  const reported = norm(host);
  const local = norm(localHostname);
  const short = (value: string): string => value.split('.')[0];
  return reported === local || short(reported) === short(local);
}
