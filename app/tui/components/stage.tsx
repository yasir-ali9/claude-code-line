import React from 'react';
import { Text, Box } from 'ink';
import type { WidgetConfig } from '../../types.js';
import { renderWidgets } from '../../renderer/index.js';
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

interface MovePreviewProps {
  widgets: WidgetConfig[];
  activeIndex: number; // which widget is being moved
}

export function MovePreview({ widgets, activeIndex }: MovePreviewProps) {
  const rendered = renderWidgets(PREVIEW_CTX, widgets);
  const parts: React.ReactNode[] = [];

  rendered.forEach((seg, i) => {
    if (seg == null) return;
    if (i > 0) {
      parts.push(<Text key={`sep-${i}`} dimColor> | </Text>);
    }
    const isActive = i === activeIndex;
    // strip ANSI from segment for Ink rendering, then re-apply dim or normal
    if (isActive) {
      // Keep full ANSI colors — pass through raw escape codes
      parts.push(<Text key={`seg-${i}`}>{seg}</Text>);
    } else {
      const plain = seg.replace(/\x1b\[[0-9;]*m/g, '');
      parts.push(<Text key={`seg-${i}`} dimColor>{plain}</Text>);
    }
  });

  return <Box>{parts}</Box>;
}
