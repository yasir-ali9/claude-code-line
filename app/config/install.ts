import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export const PKG_NAME = 'claude-code-line';

export function getClaudeSettingsPath(): string {
  const dir = process.env['CLAUDE_CONFIG_DIR'] ?? path.join(os.homedir(), '.claude');
  return path.join(dir, 'settings.json');
}

export function writeStatusLineCommand(): void {
  const command = `npx -y ${PKG_NAME}@latest`;
  const p = getClaudeSettingsPath();
  let settings: Record<string, unknown> = {};
  try { settings = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { /* new file */ }
  settings['statusLine'] = { type: 'command', command };
  fs.writeFileSync(p, JSON.stringify(settings, null, 2), 'utf8');
}
