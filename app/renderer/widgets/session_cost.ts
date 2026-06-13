import type { RenderContext, PaletteColor } from '../../types.js';
import { DIM, RESET, paletteToAnsi } from '../ansi.js';

export function renderSessionCost(ctx: RenderContext, color?: PaletteColor): string | null {
  if (ctx.isPreview) {
    const c = color ? paletteToAnsi(color) : DIM;
    return `${c}$0.03${RESET}`;
  }

  const cost = ctx.status.cost?.total_cost_usd;
  if (cost == null || cost <= 0) return null;

  const c = color ? paletteToAnsi(color) : DIM;
  const formatted = cost < 0.01
    ? `$${(cost * 100).toFixed(2)}¢`
    : `$${cost.toFixed(2)}`;

  return `${c}${formatted}${RESET}`;
}
