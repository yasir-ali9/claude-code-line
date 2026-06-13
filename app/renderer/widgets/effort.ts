import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { RenderContext, PaletteColor } from '../../types.js';
import { WHITE, RESET, paletteToAnsi } from '../ansi.js';

function effortFromSettings(): string | null {
  try {
    const p = path.join(
      process.env['CLAUDE_CONFIG_DIR'] ?? path.join(os.homedir(), '.claude'),
      'settings.json'
    );
    const raw = fs.readFileSync(p, 'utf8');
    const obj = JSON.parse(raw);
    return typeof obj?.effortLevel === 'string' ? obj.effortLevel : null;
  } catch { return null; }
}

export function renderEffort(ctx: RenderContext, color?: PaletteColor): string | null {
  let level: string | null = null;

  const effortObj = ctx.status.effort;
  if (effortObj && typeof effortObj === 'object' && effortObj.level) {
    level = effortObj.level;
  }

  // Fall back to ~/.claude/settings.json effortLevel
  if (!level) level = effortFromSettings();

  if (!level) return null;

  const display = level === 'medium' ? 'med' : level;
  const c = color ? paletteToAnsi(color) : WHITE;
  return `${c}effort:${RESET} ${display}`;
}
