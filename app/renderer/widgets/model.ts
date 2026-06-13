import type { RenderContext, PaletteColor } from '../../types.js';
import { WHITE, RESET } from '../ansi.js';
import { paletteToAnsi } from '../ansi.js';

export function renderModel(ctx: RenderContext, color?: PaletteColor): string | null {
  const raw = ctx.status.model;
  let name = typeof raw === 'string' ? raw : (raw?.display_name ?? 'Claude');
  name = name.replace(/\s*\(\d+\.?\d*[kKmM]\s+context\)/i, '').trim().toLowerCase();
  const c = color ? paletteToAnsi(color) : WHITE;
  return `${c}${name}${RESET}`;
}
