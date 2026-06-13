import type { RenderContext, PaletteColor } from '../../types.js';
import { WHITE, RESET, paletteToAnsi } from '../ansi.js';

export function renderName(ctx: RenderContext, color?: PaletteColor): string | null {
  const cwd = ctx.status.cwd;
  if (!cwd) return null;
  const name = cwd.replace(/\\/g, '/').split('/').filter(Boolean).pop() ?? cwd;
  const c = color ? paletteToAnsi(color) : WHITE;
  return `${c}${name}${RESET}`;
}
