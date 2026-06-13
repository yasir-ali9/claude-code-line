import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { Config } from '../types.js';
import { DEFAULT_CONFIG } from './defaults.js';

function getConfigPath(): string {
  const dir = process.env['CLAUDE_CONFIG_DIR'] ?? path.join(os.homedir(), '.claude');
  return path.join(dir, 'claude-code-line.json');
}

export function loadConfig(): Config {
  try {
    const raw = fs.readFileSync(getConfigPath(), 'utf8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) } as Config;
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(config: Config): void {
  const p = getConfigPath();
  fs.writeFileSync(p, JSON.stringify(config, null, 2), 'utf8');
}

export function getClaudeSettingsPath(): string {
  const dir = process.env['CLAUDE_CONFIG_DIR'] ?? path.join(os.homedir(), '.claude');
  return path.join(dir, 'settings.json');
}

export function installToClaudeSettings(scriptPath: string): void {
  const p = getClaudeSettingsPath();
  let settings: Record<string, unknown> = {};
  try { settings = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { /* new file */ }
  settings['statusLine'] = {
    type: 'command',
    command: `node "${scriptPath}"`,
  };
  fs.writeFileSync(p, JSON.stringify(settings, null, 2), 'utf8');
}
