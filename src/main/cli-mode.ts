/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

import * as net from 'net';
import * as path from 'path';
import { getPipePath } from './services/cli-service';

type CliCommand =
  | { cmd: 'new-file' }
  | { cmd: 'open-file'; path: string }
  | { cmd: 'open-terminal'; cwd: string };

/**
 * Parses the user-visible arguments that follow --novi-cli into a typed command.
 * Exported for unit testing.
 */
function markerIndex(argv: string[]): number {
  const cli = argv.indexOf('--novi-cli');
  const direct = argv.indexOf('--novi-direct');
  if (cli < 0) return direct;
  if (direct < 0) return cli;
  return Math.min(cli, direct);
}

export function parseCliModeArgs(argv: string[], cwd: string): CliCommand {
  const cliIdx = markerIndex(argv);
  const userArgs = cliIdx >= 0 ? argv.slice(cliIdx + 1) : [];

  if (userArgs.length === 0) {
    return { cmd: 'new-file' };
  }

  if (userArgs[0] === '-t') {
    return { cmd: 'open-terminal', cwd };
  }

  // Anything else is treated as a file path, resolved against the caller's cwd
  return { cmd: 'open-file', path: path.resolve(cwd, userArgs[0]) };
}

function startupFlagsFor(cmd: CliCommand): string[] {
  switch (cmd.cmd) {
    case 'new-file':      return ['--novi-new-file'];
    case 'open-file':     return [`--novi-open-file=${cmd.path}`];
    case 'open-terminal': return ['--novi-open-terminal', `--novi-cwd=${cmd.cwd}`];
  }
}

/**
 * Argv for this same process to become the GUI. Drops `--novi-cli` /
 * `--novi-direct` so parseStartupArgs will see the startup flags.
 * No user args means a normal launch (restore the last session).
 */
export function argvForGui(argv: string[], cwd: string): string[] {
  const idx = markerIndex(argv);
  const head = idx >= 0 ? argv.slice(0, idx) : argv.slice();
  const userArgs = idx >= 0 ? argv.slice(idx + 1) : [];
  if (userArgs.length === 0) return head;
  return [...head, ...startupFlagsFor(parseCliModeArgs(argv, cwd))];
}

/**
 * Deliver a command to an already-running NoviEditor.
 * Returns true when the running instance accepted it.
 * Returns false when nothing is listening — the caller must become the GUI
 * in this process. Spawning a second Electron and then app.exit() kills
 * that window on Linux, because Chromium tears its children down on exit.
 */
export async function runCliMode(argv: string[], cwd: string): Promise<boolean> {
  const cmd = parseCliModeArgs(argv, cwd);
  const sockPath = getPipePath();

  return new Promise<boolean>((resolve) => {
    let settled = false;
    let connected = false;
    const socket = net.connect(sockPath);
    const finish = (delivered: boolean): void => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(delivered);
    };

    socket.on('connect', () => {
      connected = true;
      // Write command and half-close so the server's 'end' event fires
      socket.end(JSON.stringify(cmd) + '\n');
    });

    socket.on('close', () => finish(connected));

    socket.on('error', () => finish(false));

    // Safety timeout: give up after 3 seconds regardless
    socket.setTimeout(3000);
    socket.on('timeout', () => finish(false));
  });
}
