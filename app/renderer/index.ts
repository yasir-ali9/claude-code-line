import type { RenderContext, WidgetType, WidgetConfig, PaletteColor } from '../types.js';
import { SEP, RESET } from './ansi.js';
import { renderName } from './widgets/name.js';
import { renderGit } from './widgets/git.js';
import { renderModel } from './widgets/model.js';
import { renderTokens } from './widgets/tokens.js';
import { renderEffort } from './widgets/effort.js';
import { renderRate5h } from './widgets/rate5h.js';
import { renderRate7d } from './widgets/rate7d.js';
import { renderExtra } from './widgets/extra.js';
import { renderCliVersion } from './widgets/cli_version.js';
import { renderSessionCost } from './widgets/session_cost.js';
import { renderSessionClock } from './widgets/session_clock.js';

export type { RenderContext };

type SimpleRenderer = (ctx: RenderContext, color?: PaletteColor) => string | null;

const WIDGET_MAP: Record<WidgetType, SimpleRenderer> = {
  name:          renderName,
  git:           renderGit,
  model:         renderModel,
  tokens:        (ctx, color) => renderTokens(ctx, color),
  effort:        renderEffort,
  rate5h:        (ctx, color) => renderRate5h(ctx, color),
  rate7d:        (ctx, color) => renderRate7d(ctx, color),
  extra:         renderExtra,
  cli_version:   renderCliVersion,
  session_cost:  renderSessionCost,
  session_clock: renderSessionClock,
};

function renderWidget(ctx: RenderContext, w: WidgetConfig): string | null {
  const color = w.color === 'default' ? undefined : w.color;
  if (w.type === 'tokens') return renderTokens(ctx, color, w.tokenFormat, w.barStyle);
  if (w.type === 'rate5h') return renderRate5h(ctx, color, w.rateFormat, w.barStyle);
  if (w.type === 'rate7d') return renderRate7d(ctx, color, w.rateFormat, w.barStyle);
  const fn = WIDGET_MAP[w.type];
  return fn ? fn(ctx, color) : null;
}

export function renderWidgets(ctx: RenderContext, widgets: WidgetConfig[]): (string | null)[] {
  return widgets.map(w => renderWidget(ctx, w));
}

export function renderStatusLine(ctx: RenderContext, widgets?: WidgetConfig[]): string {
  const seq: WidgetConfig[] = widgets ?? [
    { type: 'name' },
    { type: 'git' },
    { type: 'model' },
    { type: 'tokens' },
    { type: 'effort' },
    { type: 'rate5h' },
    { type: 'rate7d' },
    { type: 'extra' },
    { type: 'cli_version' },
  ];

  const parts: string[] = [];
  const types: WidgetType[] = [];
  for (const w of seq) {
    const result = renderWidget(ctx, w);
    if (result != null) { parts.push(result); types.push(w.type); }
  }

  // Join parts — skip separator between name and git so they render as name@main(+1 -2)
  let out = RESET;
  for (let i = 0; i < parts.length; i++) {
    const noSep = i > 0 && types[i - 1] === 'name' && types[i] === 'git';
    if (i > 0 && !noSep) out += SEP;
    out += parts[i];
  }
  return out;
}
