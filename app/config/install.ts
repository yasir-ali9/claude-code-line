import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export const PKG_NAME = 'claude-code-line';

export function getClaudeSettingsPath(): string {
  const dir = process.env['CLAUDE_CONFIG_DIR'] ?? path.join(os.homedir(), '.claude');
  return path.join(dir, 'settings.json');
}

export function writeStatusLineCommand(): void {
  const p = getClaudeSettingsPath();
  let settings: Record<string, unknown> = {};
  try { settings = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { /* new file */ }
  settings['statusLine'] = { type: 'command', command: PKG_NAME };
  fs.writeFileSync(p, JSON.stringify(settings, null, 2), 'utf8');
}

export function installGlobal(): void {
  execSync(`npm install -g ${PKG_NAME}`, { stdio: 'ignore', windowsHide: true });
}
