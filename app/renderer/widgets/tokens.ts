import type { RenderContext, PaletteColor, TokenFormat, BarStyle } from '../../types.js';
import { WHITE, DIM, RESET } from '../ansi.js';
import { paletteToAnsi } from '../ansi.js';
import { formatTokens, progressBar } from '../format.js';

export function renderTokens(
  ctx: RenderContext,
  color?: PaletteColor,
  tokenFormat: TokenFormat = 'bar+tokens+pct',
  barStyle: BarStyle = 'slider',
): string | null {
  const cw = ctx.status.context_window;
  const size = cw?.context_window_size ?? 200000;
  const usage = cw?.current_usage;

  let current = 0;
  if (usage && typeof usage === 'object') {
    current =
      (usage.input_tokens ?? 0) +
      (usage.cache_creation_input_tokens ?? 0) +
      (usage.cache_read_input_tokens ?? 0);
  }

  const pct = size > 0 ? Math.floor((current / size) * 100) : 0;
  const c = color ? paletteToAnsi(color) : WHITE;

  const tokensStr = `${c}${formatTokens(current)}/${formatTokens(size)}${RESET}`;
  const pctStr    = `${DIM}(${pct}%)${RESET}`;
  const bar       = progressBar(pct, 10, barStyle);

  if (tokenFormat === 'tokens+pct') return `${tokensStr} ${pctStr}`;
  if (tokenFormat === 'tokens')     return tokensStr;
  return `${bar} ${tokensStr} ${pctStr}`;
}
