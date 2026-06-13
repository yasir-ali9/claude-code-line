import React from 'react';
import { Text } from 'ink';
import type { Config } from '../../types.js';
import { renderStatusLine } from '../../renderer/index.js';
import type { RenderContext } from '../../renderer/index.js';

const PREVIEW_CTX: RenderContext = {
  status: {
    cwd: '/home/user/name',
    model: { display_name: 'Claude Sonnet 4.6' },
    effort: { level: 'high' },
    context_window: {
      context_window_size: 400000,
      current_usage: { input_tokens: 52000, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 },
    },
    rate_limits: {
      five_hour: { used_percentage: 23, resets_at: null },
      seven_day: { used_percentage: 45, resets_at: null },
    },
  },
  usageData: null,
  cliVersion: '2.1.177',
  isPreview: true,
};

interface PreviewProps {
  config: Config;
}

export function Preview({ config }: PreviewProps) {
  const widgets = config.theme === 'custom' ? config.widgets : undefined;
  // Render with real ANSI codes — Ink passes them through to terminal
  const line = renderStatusLine(PREVIEW_CTX, widgets);
  return <Text>{line}</Text>;
}
