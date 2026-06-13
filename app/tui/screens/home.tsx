import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Config } from '../../types.js';
import { Preview } from '../components/preview.js';
import { WidgetEditor } from './editor.js';
import { writeStatusLineCommand, getClaudeSettingsPath } from '../../config/install.js';

type Screen = 'home' | 'editor';

const THEMES = ['default', 'custom'] as const;

const OPTIONS = [
  { key: 'install', label: 'Save to Claude Code' },
];

interface HomeProps {
  config: Config;
  onSave: (config: Config) => void;
  onQuit: () => void;
}

export function Home({ config, onSave, onQuit }: HomeProps) {
  const [screen, setScreen]   = useState<Screen>('home');
  const [current, setCurrent] = useState<Config>(config);
  const [cursor, setCursor]   = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const totalRows = THEMES.length + OPTIONS.length;

  useInput((_input, key) => {
    if (screen !== 'home') return;

    if (key.upArrow)   setCursor(i => Math.max(0, i - 1));
    if (key.downArrow) setCursor(i => Math.min(totalRows - 1, i + 1));

    if (key.return) {
      if (cursor < THEMES.length) {
        const chosen = THEMES[cursor]!;
        const next: Config = { ...current, theme: chosen };
        setCurrent(next);
        onSave(next);
        setMessage(null);
        if (chosen === 'custom') setScreen('editor');
        return;
      }

      const item = OPTIONS[cursor - THEMES.length];
      if (!item) return;

      if (item.key === 'install') {
        try {
          writeStatusLineCommand();
          setMessage(`Saved. Restart Claude Code to apply.`);
        } catch (e) {
          setMessage(`Failed: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    if (key.escape) onQuit();
  });

  if (screen === 'editor') {
    return (
      <WidgetEditor
        widgets={current.widgets}
        onUpdate={(widgets) => {
          const next = { ...current, widgets };
          setCurrent(next);
          onSave(next);
        }}
        onSave={(widgets) => {
          const next = { ...current, widgets };
          setCurrent(next);
          onSave(next);
          setScreen('home');
        }}
        onEscape={() => setScreen('home')}
      />
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>ccms statusline</Text>

      <Box marginTop={1} marginBottom={1}>
        <Preview config={current} />
      </Box>

      {/* Theme section */}
      <Box marginBottom={1} flexDirection="column">
        <Text dimColor>Theme</Text>
        {THEMES.map((t, i) => {
          const isSelected = cursor === i;
          const isActive   = current.theme === t;
          return (
            <Box key={t}>
              <Text color={isSelected ? 'white' : undefined} dimColor={!isSelected}>
                {isSelected ? '> ' : '  '}
              </Text>
              <Text bold={isActive} color={isSelected ? 'white' : undefined} dimColor={!isSelected}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </Text>
              {isActive && <Text color="white"> ✓</Text>}
            </Box>
          );
        })}
      </Box>

      {/* Options section */}
      <Box flexDirection="column">
        <Text dimColor>Options</Text>
        {OPTIONS.map((item, i) => {
          const isSelected = cursor === THEMES.length + i;
          return (
            <Box key={item.key} flexDirection="column">
              <Box>
                <Text color={isSelected ? 'white' : undefined} dimColor={!isSelected}>
                  {isSelected ? '> ' : '  '}
                </Text>
                <Text color={isSelected ? 'white' : undefined} dimColor={!isSelected}>
                  {item.label}
                </Text>
              </Box>
              {isSelected && (
                <Box marginLeft={4}>
                  <Text dimColor>writes npx -y claude-code-line@latest to {getClaudeSettingsPath()}</Text>
                </Box>
              )}
            </Box>
          );
        })}
      </Box>

      {message && (
        <Box marginTop={1}>
          <Text color="yellow">{message}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>[Enter] Select    [Esc] Quit</Text>
      </Box>
    </Box>
  );
}
