import type { RenderContext, PaletteColor } from '../../types.js';
import { WHITE, GREEN, RESET } from '../ansi.js';
import { paletteToAnsi, usageColor } from '../ansi.js';

export function renderExtra(ctx: RenderContext, color?: PaletteColor): string | null {
  const u = ctx.usageData;
  if (!u?.extraEnabled) return null;

  const c = color ? paletteToAnsi(color) : WHITE;

  if (u.extraUsed != null && u.extraLimit != null) {
    const used = (u.extraUsed / 100).toFixed(2);
    const limit = (u.extraLimit / 100).toFixed(2);
    const uc = usageColor(u.extraPct ?? 0);
    return `${c}extra${RESET} ${uc}$${used}/$${limit}${RESET}`;
  }

  return `${c}extra${RESET} ${GREEN}enabled${RESET}`;
}
