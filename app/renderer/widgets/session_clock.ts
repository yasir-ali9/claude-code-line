import type { RenderContext, PaletteColor } from '../../types.js';
import { DIM, RESET, paletteToAnsi } from '../ansi.js';

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const mins  = Math.floor((totalSec % 3600) / 60);
  if (hours > 0) return `${hours}hr ${mins}m`;
  if (mins  > 0) return `${mins}m`;
  return `<1m`;
}

export function renderSessionClock(ctx: RenderContext, color?: PaletteColor): string | null {
  if (ctx.isPreview) {
    const c = color ? paletteToAnsi(color) : DIM;
    return `${c}1hr 12m${RESET}`;
  }

  // Use session_start epoch (seconds) if available, else fall back to cost.total_duration_ms
  let elapsedMs: number | null = null;

  if (ctx.status.session_start) {
    elapsedMs = Date.now() - ctx.status.session_start * 1000;
  } else if (ctx.status.cost?.total_duration_ms) {
    elapsedMs = ctx.status.cost.total_duration_ms;
  }

  if (!elapsedMs || elapsedMs < 0) return null;

  const c = color ? paletteToAnsi(color) : DIM;
  return `${c}${formatElapsed(elapsedMs)}${RESET}`;
}
