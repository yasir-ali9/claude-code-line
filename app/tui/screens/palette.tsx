import React from 'react';
import { Box, Text, useInput } from 'ink';
import type { PaletteColor } from '../../types.js';
import { List } from '../components/list.js';

const COLORS: { label: string; value: PaletteColor; inkColor?: string }[] = [
  { label: 'white',   value: 'white',   inkColor: '#dcdcdc' },
  { label: 'dim',     value: 'dim',     inkColor: 'gray' },
  { label: 'orange',  value: 'orange',  inkColor: '#ffb055' },
  { label: 'green',   value: 'green',   inkColor: '#00a000' },
  { label: 'cyan',    value: 'cyan',    inkColor: '#2e9599' },
  { label: 'red',     value: 'red',     inkColor: '#ff5555' },
  { label: 'yellow',  value: 'yellow',  inkColor: '#e6c800' },
  { label: 'blue',    value: 'blue',    inkColor: '#0099ff' },
  { label: 'default', value: 'default' },
];

interface ColorPickerProps {
  widgetName: string;
  onSelect: (color: PaletteColor) => void;
  onEscape: () => void;
}

export function ColorPicker({ widgetName, onSelect, onEscape }: ColorPickerProps) {
  useInput((_input, key) => {
    if (key.escape) onEscape();
  });

  return (
    <Box flexDirection="column">
      <Box marginTop={1} marginBottom={1}>
        <Text dimColor>{widgetName} — pick a color:</Text>
      </Box>
      <List
        items={COLORS}
        onSelect={(item) => onSelect(item.value)}
        onEscape={onEscape}
        renderItem={(item, selected) => (
          <Text color={item.inkColor} bold={selected}>
            {item.label}
          </Text>
        )}
      />
      <Box marginTop={1}>
        <Text dimColor>esc  cancel</Text>
      </Box>
    </Box>
  );
}
