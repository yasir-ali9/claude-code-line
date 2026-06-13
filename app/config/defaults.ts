import type { Config } from '../types.js';

export const DEFAULT_CONFIG: Config = {
  theme: 'default',
  widgets: [
    { type: 'name' },
    { type: 'git' },
    { type: 'model' },
    { type: 'tokens' },
    { type: 'effort' },
    { type: 'rate5h' },
    { type: 'rate7d' },
    { type: 'extra' },
    { type: 'cli_version' },
  ],
};

export const MINIMAL_WIDGETS = DEFAULT_CONFIG.widgets;
