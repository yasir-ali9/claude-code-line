import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import {
  type UpdateStyle,
  type PackageManager,
  type CommandAvailability,
  buildStatusLineCommand,
  buildGlobalInstallCommand,
  getClaudeSettingsPath,
  writeStatusLineCommand,
} from '../../config/install.js';
import { PKG_VERSION } from '../../config/install.js';

type Step = 'style' | 'manager';

const STYLES: { label: string; description: string; value: UpdateStyle }[] = [
  {
    label: 'Pinned global install',
    value: 'pinned',
    description: `Globally installs claude-code-line@${PKG_VERSION}. Fast on each render — Claude Code runs the binary directly.`,
  },
  {
    label: 'Via npx/bunx (auto-update)',
    value: 'auto-update',
    description: 'Runs @latest through npx/bunx. Stays current automatically, with a small delay per render.',
  },
];

interface InstallMenuProps {
  availability: CommandAvailability;
  onDone: (message: string) => void;
  onCancel: () => void;
}

export function InstallMenu({ availability, onDone, onCancel }: InstallMenuProps) {
  const [step, setStep]           = useState<Step>('style');
  const [styleCursor, setStyleCursor]     = useState(0);
  const [managerCursor, setManagerCursor] = useState(0);
  const [selectedStyle, setSelectedStyle] = useState<UpdateStyle>('pinned');

  const managers = (style: UpdateStyle): { label: string; value: PackageManager; disabled: boolean; note?: string }[] => {
    if (style === 'auto-update') {
      return [
        { label: `npx -y claude-code-line@latest`, value: 'npm', disabled: !availability.npx, note: !availability.npx ? '(npx not found)' : undefined },
        { label: `bunx -y claude-code-line@latest`, value: 'bun', disabled: !availability.bunx, note: !availability.bunx ? '(bunx not found)' : undefined },
      ];
    }
    return [
      { label: buildGlobalInstallCommand('npm'), value: 'npm', disabled: !availability.npm, note: !availability.npm ? '(npm not found)' : undefined },
      { label: buildGlobalInstallCommand('bun'), value: 'bun', disabled: !availability.bun, note: !availability.bun ? '(bun not found)' : undefined },
    ];
  };

  const currentManagers = managers(selectedStyle);

  useInput((_input, key) => {
    if (step === 'style') {
      if (key.upArrow)   setStyleCursor(i => Math.max(0, i - 1));
      if (key.downArrow) setStyleCursor(i => Math.min(STYLES.length - 1, i + 1));
      if (key.return) {
        const chosen = STYLES[styleCursor]!;
        setSelectedStyle(chosen.value);
        setManagerCursor(0);
        setStep('manager');
      }
      if (key.escape) onCancel();
    }

    if (step === 'manager') {
      if (key.upArrow)   setManagerCursor(i => Math.max(0, i - 1));
      if (key.downArrow) setManagerCursor(i => Math.min(currentManagers.length - 1, i + 1));
      if (key.return) {
        const chosen = currentManagers[managerCursor]!;
        if (chosen.disabled) return;
        try {
          const cmd = buildStatusLineCommand(selectedStyle, chosen.value);
          writeStatusLineCommand(cmd);
          const installHint = selectedStyle === 'pinned'
            ? ` Run: ${buildGlobalInstallCommand(chosen.value)}`
            : '';
          onDone(`Saved. Restart Claude Code to apply.${installHint}`);
        } catch (e) {
          onDone(`Failed: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
      if (key.escape) setStep('style');
    }
  });

  const activeStyle = STYLES[styleCursor];

  return (
    <Box flexDirection="column">
      <Text bold>Save to Claude Code</Text>

      <Box marginTop={1} flexDirection="column">
        {step === 'style' && (
          <>
            <Text dimColor>Select update style:</Text>
            <Box marginTop={1} flexDirection="column">
              {STYLES.map((s, i) => {
                const isSel = i === styleCursor;
                return (
                  <Box key={s.value} flexDirection="column">
                    <Box>
                      <Text color={isSel ? 'white' : undefined} dimColor={!isSel}>
                        {isSel ? '> ' : '  '}
                      </Text>
                      <Text color={isSel ? 'white' : undefined} dimColor={!isSel}>
                        {s.label}
                      </Text>
                    </Box>
                    {isSel && (
                      <Box marginLeft={4}>
                        <Text dimColor>{s.description}</Text>
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </>
        )}

        {step === 'manager' && (
          <>
            <Text dimColor>
              {selectedStyle === 'pinned' ? 'Select package manager to install with:' : 'Select package runner:'}
            </Text>
            <Box marginTop={1} flexDirection="column">
              {currentManagers.map((m, i) => {
                const isSel = i === managerCursor;
                return (
                  <Box key={m.value}>
                    <Text color={isSel && !m.disabled ? 'white' : undefined} dimColor={!isSel || m.disabled}>
                      {isSel ? '> ' : '  '}
                    </Text>
                    <Text color={isSel && !m.disabled ? 'white' : undefined} dimColor={!isSel || m.disabled}>
                      {m.label}
                    </Text>
                    {m.note && <Text dimColor> {m.note}</Text>}
                  </Box>
                );
              })}
            </Box>
          </>
        )}
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Will write to {getClaudeSettingsPath()}</Text>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>[Enter] Select    [Esc] Back</Text>
      </Box>
    </Box>
  );
}
