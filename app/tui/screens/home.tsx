import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { Config } from '../../types.js';
import { Preview } from '../components/preview.js';
import { WidgetEditor } from './editor.js';
import { writeStatusLineCommand, getClaudeSettingsPath, type InstallStyle } from '../../config/install.js';

type Screen = 'home' | 'editor' | 'install';

const THEMES = ['default', 'custom'] as const;

const INSTALL_OPTIONS: { label: string; value: InstallStyle; description: string }[] = [
  {
    label: 'Global install',
    value: 'global',
    description: 'npm install -g claude-code-line  — fastest, zero delay. Update manually.',
  },
  {
    label: 'Via npx',
    value: 'npx',
    description: 'npx -y claude-code-line  — no install needed. Small delay per render.',
  },
];

interface HomeProps {
  config: Config;
  onSave: (config: Config) => void;
  onQuit: () => void;
}

export function Home({ config, onSave, onQuit }: HomeProps) {
  const [screen, setScreen]         = useState<Screen>('home');
  const [current, setCurrent]       = useState<Config>(config);
  const [cursor, setCursor]         = useState(0);
  const [installCursor, setInstallCursor] = useState(0);
  const [message, setMessage]       = useState<string | null>(null);

  const totalRows = THEMES.length + 1; // +1 for "Save to Claude Code"

  useInput((_input, key) => {
    if (screen === 'install') {
      if (key.upArrow)   setInstallCursor(i => Math.max(0, i - 1));
      if (key.downArrow) setInstallCursor(i => Math.min(INSTALL_OPTIONS.length - 1, i + 1));
      if (key.return) {
        const chosen = INSTALL_OPTIONS[installCursor]!;
        try {
          writeStatusLineCommand(chosen.value);
          const hint = chosen.value === 'global'
            ? ' Run: npm install -g claude-code-line'
            : '';
          setMessage(`Saved. Restart Claude Code to apply.${hint}`);
        } catch (e) {
          setMessage(`Failed: ${e instanceof Error ? e.message : String(e)}`);
        }
        setScreen('home');
      }
      if (key.escape) setScreen('home');
      return;
    }

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
      // "Save to Claude Code"
      setInstallCursor(0);
      setMessage(null);
      setScreen('install');
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

  if (screen === 'install') {
    return (
      <Box flexDirection="column" padding={1}>
        <Text bold>Claude Code Line</Text>

        <Box marginTop={1} flexDirection="column">
          <Text dimColor>Save to Claude Code — choose install style:</Text>
          <Box marginTop={1} flexDirection="column">
            {INSTALL_OPTIONS.map((opt, i) => {
              const isSel = i === installCursor;
              return (
                <Box key={opt.value} flexDirection="column">
                  <Box>
                    <Text color={isSel ? 'white' : undefined} dimColor={!isSel}>
                      {isSel ? '> ' : '  '}
                    </Text>
                    <Text bold={isSel} color={isSel ? 'white' : undefined} dimColor={!isSel}>
                      {opt.label}
                    </Text>
                  </Box>
                  {isSel && (
                    <Box marginLeft={4}>
                      <Text dimColor>{opt.description}</Text>
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>writes to {getClaudeSettingsPath()}</Text>
        </Box>

        <Box marginTop={1}>
          <Text dimColor>[Enter] Select    [Esc] Back</Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Claude Code Line</Text>

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
        <Box>
          <Text color={cursor === THEMES.length ? 'white' : undefined} dimColor={cursor !== THEMES.length}>
            {cursor === THEMES.length ? '> ' : '  '}
          </Text>
          <Text color={cursor === THEMES.length ? 'white' : undefined} dimColor={cursor !== THEMES.length}>
            Save to Claude Code
          </Text>
        </Box>
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
