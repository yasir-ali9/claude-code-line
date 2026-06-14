import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { WidgetType, WidgetConfig } from '../../types.js';
import { List } from '../components/list.js';

const ALL_WIDGETS: { type: WidgetType; label: string; description: string }[] = [
  { type: 'name',          label: 'Name',          description: 'Current directory name' },
  { type: 'git',           label: 'Git',           description: '@branch + diff stats' },
  { type: 'model',         label: 'Model',         description: 'Claude model name' },
  { type: 'tokens',        label: 'Tokens',        description: 'Context bar + token count' },
  { type: 'effort',        label: 'Effort',        description: 'Reasoning effort level' },
  { type: 'rate5h',        label: '5h Rate',       description: '5-hour usage + reset time' },
  { type: 'rate7d',        label: '7d Rate',       description: '7-day usage + reset time' },
  { type: 'extra',         label: 'Extra',         description: 'Extra usage credits' },
  { type: 'cli_version',   label: 'Version',       description: 'Claude CLI version' },
  { type: 'session_cost',  label: 'Session Cost',  description: 'Session cost in USD' },
  { type: 'session_clock', label: 'Session Clock', description: 'Elapsed session time' },
];

interface AddPickerProps {
  activeWidgets: WidgetConfig[];
  onAdd: (type: WidgetType) => void;
  onEscape: () => void;
}

export function AddPicker({ activeWidgets, onAdd, onEscape }: AddPickerProps) {
  const activeTypes = new Set(activeWidgets.map(w => w.type));
  const available = ALL_WIDGETS.filter(w => !activeTypes.has(w.type));

  useInput((_input, key) => {
    if (key.escape) onEscape();
  });

  if (available.length === 0) {
    return (
      <Box flexDirection="column">
        <Text>All widgets are already added.</Text>
        <Text dimColor>Press esc to go back.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Text bold>New widget</Text>
      <Box marginTop={1}>
        <List
          items={available}
          onSelect={(item) => onAdd(item.type)}
          onEscape={onEscape}
          renderItem={(item, selected) => (
            <Box>
              <Text bold={selected} color={selected ? 'white' : undefined}>{item.label.padEnd(14)}</Text>
              <Text dimColor>{item.description}</Text>
            </Box>
          )}
        />
      </Box>
      <Box marginTop={1}>
        <Text dimColor>[Enter] Select    [Esc] Back</Text>
      </Box>
    </Box>
  );
}
