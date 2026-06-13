import type { RenderContext, PaletteColor } from '../../types.js';
import { WHITE, DIM, RESET } from '../ansi.js';
import { paletteToAnsi } from '../ansi.js';

export function renderCliVersion(ctx: RenderContext, color?: PaletteColor): string | null {
  if (!ctx.cliVersion) return null;
  const c = color ? paletteToAnsi(color) : DIM;
  return `${c}v${ctx.cliVersion}${RESET}`;
}
