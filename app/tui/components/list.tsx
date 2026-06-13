import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface ListProps<T> {
  items: T[];
  renderItem: (item: T, isSelected: boolean) => React.ReactNode;
  onSelect: (item: T, index: number) => void;
  onEscape?: () => void;
  initialIndex?: number;
}

export function List<T>({ items, renderItem, onSelect, onEscape, initialIndex = 0 }: ListProps<T>) {
  const [cursor, setCursor] = useState(initialIndex);

  useInput((input, key) => {
    if (key.upArrow) setCursor(i => Math.max(0, i - 1));
    if (key.downArrow) setCursor(i => Math.min(items.length - 1, i + 1));
    if (key.return && items[cursor] != null) onSelect(items[cursor]!, cursor);
    if (key.escape && onEscape) onEscape();
  });

  return (
    <Box flexDirection="column">
      {items.map((item, i) => (
        <Box key={i}>
          <Text color={i === cursor ? 'white' : undefined} dimColor={i !== cursor}>
            {i === cursor ? '> ' : '  '}
          </Text>
          {renderItem(item, i === cursor)}
        </Box>
      ))}
    </Box>
  );
}
