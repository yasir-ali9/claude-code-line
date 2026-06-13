import { DIM, RESET } from './ansi.js';

export function formatTokens(n: number): string {
  if (n >= 1_000_000) {
    const v = Math.round(n / 100_000) / 10;
    return Number.isInteger(v) ? `${v}m` : `${v.toFixed(1)}m`;
  }
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export function progressBar(pct: number, width = 10, style: 'slider' | 'block' | 'bracket' = 'slider'): string {
  const filled = Math.min(width, Math.floor(pct / (100 / width)));
  const empty = width - filled;
  if (style === 'block')   return `${DIM}${'█'.repeat(filled)}${'░'.repeat(empty)}${RESET}`;
  if (style === 'bracket') return `${DIM}[${'▓'.repeat(filled)}${'░'.repeat(empty)}]${RESET}`;
  return `${DIM}${'▓'.repeat(filled)}${'░'.repeat(empty)}${RESET}`;
}

export function formatResetTime(epoch: number | null | undefined, style: 'time' | 'datetime'): string | null {
  if (!epoch) return null;
  const d = new Date(epoch * 1000);
  if (style === 'time') {
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  }
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
    + ', '
    + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
}
