import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const PKG_NAME = 'claude-code-line';
export const PKG_VERSION = '1.0.0';

export type UpdateStyle = 'auto-update' | 'pinned';
export type PackageManager = 'npm' | 'bun';

export interface CommandAvailability {
  npm: boolean;
  npx: boolean;
  bun: boolean;
  bunx: boolean;
}

function isAvailable(cmd: string): boolean {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore', timeout: 3000, windowsHide: true });
    return true;
  } catch { return false; }
}

export function checkCommandAvailability(): CommandAvailability {
  return {
    npm:  isAvailable('npm'),
    npx:  isAvailable('npx'),
    bun:  isAvailable('bun'),
    bunx: isAvailable('bunx'),
  };
}

export function buildStatusLineCommand(style: UpdateStyle, pm: PackageManager): string {
  if (style === 'auto-update') {
    return pm === 'bun'
      ? `bunx -y ${PKG_NAME}@latest`
      : `npx -y ${PKG_NAME}@latest`;
  }
  return PKG_NAME; // expects global install in PATH
}

export function buildGlobalInstallCommand(pm: PackageManager): string {
  return pm === 'bun'
    ? `bun add -g ${PKG_NAME}@${PKG_VERSION}`
    : `npm install -g ${PKG_NAME}@${PKG_VERSION}`;
}

export function getClaudeSettingsPath(): string {
  const dir = process.env['CLAUDE_CONFIG_DIR'] ?? path.join(os.homedir(), '.claude');
  return path.join(dir, 'settings.json');
}

export function writeStatusLineCommand(command: string): void {
  const p = getClaudeSettingsPath();
  let settings: Record<string, unknown> = {};
  try { settings = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { /* new file */ }
  settings['statusLine'] = { type: 'command', command };
  fs.writeFileSync(p, JSON.stringify(settings, null, 2), 'utf8');
}
