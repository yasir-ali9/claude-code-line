export interface StatusJSON {
  hook_event_name?: string;
  session_id?: string;
  cwd?: string;
  model?: { id?: string; display_name?: string } | string;
  version?: string;
  effort?: { level?: string | null } | null;
  context_window?: {
    context_window_size?: number | null;
    current_usage?: {
      input_tokens?: number;
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
    } | null;
    used_percentage?: number | null;
  } | null;
  rate_limits?: {
    five_hour?: { used_percentage?: number | null; resets_at?: number | null };
    seven_day?: { used_percentage?: number | null; resets_at?: number | null };
  } | null;
  cost?: {
    total_cost_usd?: number | null;
    total_duration_ms?: number | null;
  } | null;
  session_start?: number | null;
}

export interface UsageData {
  fiveHourPct?: number;
  fiveHourResetsAt?: number | null;
  sevenDayPct?: number;
  sevenDayResetsAt?: number | null;
  extraEnabled?: boolean;
  extraUsed?: number;
  extraLimit?: number;
  extraPct?: number;
}

export interface RenderContext {
  status: StatusJSON;
  usageData: UsageData | null;
  cliVersion: string | null;
  isPreview?: boolean;
}

export type WidgetType =
  | 'name'
  | 'git'
  | 'model'
  | 'tokens'
  | 'effort'
  | 'rate5h'
  | 'rate7d'
  | 'extra'
  | 'cli_version'
  | 'session_cost'
  | 'session_clock';

export type PaletteColor =
  | 'white'
  | 'dim'
  | 'orange'
  | 'green'
  | 'cyan'
  | 'red'
  | 'yellow'
  | 'blue'
  | 'default';

export type TokenFormat =
  | 'bar+tokens+pct'   // ▓▓░░ 25k/400k (6%)
  | 'tokens+pct'       // 25k/400k (6%)
  | 'tokens';          // 25k/400k

export type RateFormat =
  | 'bar+pct'  // ▓▓░░ 23%
  | 'pct';     // 23%

export type BarStyle =
  | 'slider'   // ▓▓▓░░░
  | 'block'    // ███░░░
  | 'bracket'; // [▓▓░░]

export interface WidgetConfig {
  type: WidgetType;
  color?: PaletteColor;
  tokenFormat?: TokenFormat;
  rateFormat?: RateFormat;
  barStyle?: BarStyle;
}

export interface Config {
  theme: 'default' | 'custom';
  widgets: WidgetConfig[];
}

export type WidgetRenderer = (ctx: RenderContext, color?: PaletteColor) => string | null;
