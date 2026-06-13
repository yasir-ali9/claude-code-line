import type { PaletteColor } from '../types.js';

const E = '\x1b';

export const RESET  = `${E}[0m`;
export const DIM    = `${E}[2m`;
export const WHITE  = `${E}[38;2;220;220;220m`;
export const ORANGE = `${E}[38;2;255;176;85m`;
export const GREEN  = `${E}[38;2;0;160;0m`;
export const CYAN   = `${E}[38;2;46;149;153m`;
export const RED    = `${E}[38;2;255;85;85m`;
export const YELLOW = `${E}[38;2;230;200;0m`;
export const BLUE   = `${E}[38;2;0;153;255m`;

export const SEP = `${DIM} | ${RESET}`;

export function paletteToAnsi(color: PaletteColor | undefined): string {
  switch (color) {
    case 'white':   return WHITE;
    case 'dim':     return DIM;
    case 'orange':  return ORANGE;
    case 'green':   return GREEN;
    case 'cyan':    return CYAN;
    case 'red':     return RED;
    case 'yellow':  return YELLOW;
    case 'blue':    return BLUE;
    default:        return '';
  }
}

export function usageColor(pct: number): string {
  if (pct >= 90) return RED;
  if (pct >= 70) return ORANGE;
  if (pct >= 50) return YELLOW;
  return GREEN;
}
