import type { RenderContext, PaletteColor, RateFormat, BarStyle } from '../../types.js';
import { WHITE, DIM, RESET, paletteToAnsi } from '../ansi.js';
import { formatResetTime, progressBar } from '../format.js';

export function renderRate7d(
  ctx: RenderContext,
  color?: PaletteColor,
  rateFormat: RateFormat = 'pct',
  barStyle: BarStyle = 'slider',
): string | null {
  const builtin = ctx.status.rate_limits?.seven_day;
  const pct = builtin?.used_percentage ?? ctx.usageData?.sevenDayPct;
  if (pct == null) return null;

  const resetsAt = builtin?.resets_at ?? ctx.usageData?.sevenDayResetsAt;
  const reset = formatResetTime(resetsAt ?? null, 'datetime');
  const c = color ? paletteToAnsi(color) : WHITE;

  const pctStr = `${DIM}${Math.floor(pct)}%${RESET}`;
  const bar    = progressBar(Math.floor(pct), 10, barStyle);

  let out = rateFormat === 'bar+pct'
    ? `${c}7d${RESET} ${bar} ${pctStr}`
    : `${c}7d${RESET} ${pctStr}`;

  if (reset) out += ` ${DIM}@${reset}${RESET}`;
  return out;
}
