import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { WidgetConfig, PaletteColor, TokenFormat, RateFormat, BarStyle } from '../../types.js';
import { Preview } from '../components/preview.js';
import { MovePreview } from '../components/stage.js';
import { AddPicker } from './picker.js';

type Level = 'list' | 'action' | 'sub' | 'customize' | 'subsub' | 'move' | 'add';

const WIDGET_DESC: Partial<Record<string, string>> = {
  name:          'Current directory name',
  git:           '@branch + diff stats',
  model:         'Claude model name',
  tokens:        'Context bar + token count',
  effort:        'Reasoning effort level',
  rate5h:        '5-hour usage + reset time',
  rate7d:        '7-day usage + reset time',
  extra:         'Extra usage credits',
  cli_version:   'Claude CLI version',
  session_cost:  'Session cost in USD',
  session_clock: 'Elapsed session time',
};
type ActionKey = 'move' | 'color' | 'customize' | 'del';

const ACTIONS: { key: ActionKey; label: string }[] = [
  { key: 'move',      label: 'Move' },
  { key: 'color',     label: 'Color' },
  { key: 'customize', label: 'Customize' },
  { key: 'del',       label: 'Remove' },
];

const COLORS: { label: string; value: PaletteColor; inkColor?: string }[] = [
  { label: 'White',   value: 'white',   inkColor: '#dcdcdc' },
  { label: 'Dim',     value: 'dim',     inkColor: 'gray' },
  { label: 'Orange',  value: 'orange',  inkColor: '#ffb055' },
  { label: 'Green',   value: 'green',   inkColor: '#00a000' },
  { label: 'Cyan',    value: 'cyan',    inkColor: '#2e9599' },
  { label: 'Red',     value: 'red',     inkColor: '#ff5555' },
  { label: 'Yellow',  value: 'yellow',  inkColor: '#e6c800' },
  { label: 'Blue',    value: 'blue',    inkColor: '#0099ff' },
  { label: 'Default', value: 'default' },
];

const CONFIRM = [
  { label: 'Yes, remove', value: 'yes' },
  { label: 'Cancel',      value: 'no' },
];

const TOKEN_FORMATS: { label: string; value: TokenFormat }[] = [
  { label: '▓▓░░ 25k/400k (6%)', value: 'bar+tokens+pct' },
  { label: '25k/400k (6%)',       value: 'tokens+pct' },
  { label: '25k/400k',            value: 'tokens' },
];

const RATE_FORMATS: { label: string; value: RateFormat }[] = [
  { label: '5h ▓▓░░ 23%', value: 'bar+pct' },
  { label: '5h 23%',      value: 'pct' },
];

const BAR_STYLES: { label: string; value: BarStyle }[] = [
  { label: '▓▓▓░░░  Slider',  value: 'slider' },
  { label: '███░░░  Block',    value: 'block' },
  { label: '[▓▓░░]  Bracket',  value: 'bracket' },
];

const CUSTOMIZE_ITEMS = [
  { key: 'format',   label: 'Format' },
  { key: 'barstyle', label: 'Progress type' },
];

interface WidgetEditorProps {
  widgets: WidgetConfig[];
  onUpdate: (widgets: WidgetConfig[]) => void;
  onSave: (widgets: WidgetConfig[]) => void;
  onEscape: () => void;
}

export function WidgetEditor({ widgets: initial, onUpdate, onSave, onEscape }: WidgetEditorProps) {
  const [widgets, setWidgets]                 = useState<WidgetConfig[]>(initial);
  const [cursor, setCursor]                   = useState(0);
  const [actionCursor, setActionCursor]       = useState(0);
  const [subCursor, setSubCursor]             = useState(0);
  const [customizeCursor, setCustomizeCursor] = useState(0);
  const [subsubCursor, setSubsubCursor]       = useState(0);
  const [movePos, setMovePos]                 = useState(0);
  const [level, setLevel]                     = useState<Level>('list');

  const totalRows     = widgets.length + 1;
  const clampedCursor = Math.min(cursor, Math.max(0, totalRows - 1));
  const onAddRow      = clampedCursor === widgets.length;
  const activeWidget  = widgets[clampedCursor];
  const isGitWidget        = activeWidget?.type === 'git';
  const isCustomizableWidget = activeWidget?.type === 'tokens' || activeWidget?.type === 'rate5h' || activeWidget?.type === 'rate7d';
  const isRateWidget       = activeWidget?.type === 'rate5h' || activeWidget?.type === 'rate7d';

  const visibleActions = ACTIONS.filter(a => {
    if (a.key === 'move' && isGitWidget) return false;
    if (a.key === 'customize' && !isCustomizableWidget) return false;
    return true;
  });
  const activeAction = visibleActions[actionCursor]?.key as ActionKey | undefined;

  const activeCustomizeKey = CUSTOMIZE_ITEMS[customizeCursor]?.key;

  function subsubItems(): { label: string; value: string }[] {
    if (activeCustomizeKey === 'format')   return isRateWidget ? RATE_FORMATS : TOKEN_FORMATS;
    if (activeCustomizeKey === 'barstyle') return BAR_STYLES;
    return [];
  }

  // widgets reordered live during move mode
  const movedWidgets = level === 'move' ? (() => {
    const next = [...widgets];
    const [item] = next.splice(clampedCursor, 1);
    next.splice(movePos, 0, item!);
    return next;
  })() : widgets;

  useInput((_input, key) => {
    // list level
    if (level === 'list') {
      if (key.upArrow)    setCursor(i => Math.max(0, i - 1));
      if (key.downArrow)  setCursor(i => Math.min(totalRows - 1, i + 1));
      if (key.return)     onAddRow ? setLevel('add') : (setActionCursor(0), setLevel('action'));
      if (key.escape)     onEscape();
      return;
    }

    // action level
    if (level === 'action') {
      if (key.upArrow)   setActionCursor(i => Math.max(0, i - 1));
      if (key.downArrow) setActionCursor(i => Math.min(visibleActions.length - 1, i + 1));
      if (key.return) {
        if (activeAction === 'move')      { setMovePos(clampedCursor); setLevel('move'); }
        else if (activeAction === 'customize') { setCustomizeCursor(0); setLevel('customize'); }
        else                              { setSubCursor(0); setLevel('sub'); }
      }
      if (key.escape) setLevel('list');
      return;
    }

    // move level
    if (level === 'move') {
      if (key.leftArrow)  setMovePos(i => Math.max(0, i - 1));
      if (key.rightArrow) setMovePos(i => Math.min(widgets.length - 1, i + 1));
      if (key.return) {
        if (movePos !== clampedCursor) {
          const next = [...widgets];
          const [item] = next.splice(clampedCursor, 1);
          next.splice(movePos, 0, item!);
          setWidgets(next);
          onUpdate(next);
          setCursor(movePos);
        }
        setLevel('list');
      }
      if (key.escape) setLevel('action');
      return;
    }

    // sub level (color / remove)
    if (level === 'sub') {
      const items = activeAction === 'color' ? COLORS : CONFIRM;
      if (key.upArrow)   setSubCursor(i => Math.max(0, i - 1));
      if (key.downArrow) setSubCursor(i => Math.min(items.length - 1, i + 1));
      if (key.return) {
        const val = items[subCursor]?.value;
        if (activeAction === 'color' && val) {
          const next = widgets.map((w, i) => i === clampedCursor ? { ...w, color: val as PaletteColor } : w);
          setWidgets(next);
          onUpdate(next);
          setLevel('list');
        }
        if (activeAction === 'del') {
          if (val === 'yes') {
            const next = widgets.filter((_, i) => i !== clampedCursor);
            setWidgets(next);
            onUpdate(next);
            setCursor(i => Math.max(0, i - 1));
          }
          setLevel('list');
        }
      }
      if (key.escape) setLevel('action');
      return;
    }

    // customize level (format / progress type)
    if (level === 'customize') {
      if (key.upArrow)   setCustomizeCursor(i => Math.max(0, i - 1));
      if (key.downArrow) setCustomizeCursor(i => Math.min(CUSTOMIZE_ITEMS.length - 1, i + 1));
      if (key.return)    { setSubsubCursor(0); setLevel('subsub'); }
      if (key.escape)    setLevel('action');
      return;
    }

    // subsub level (actual format or bar-style values)
    if (level === 'subsub') {
      const items = subsubItems();
      if (key.upArrow)   setSubsubCursor(i => Math.max(0, i - 1));
      if (key.downArrow) setSubsubCursor(i => Math.min(items.length - 1, i + 1));
      if (key.return) {
        const val = items[subsubCursor]?.value;
        if (val) {
          let next: WidgetConfig[];
          if (activeCustomizeKey === 'format' && isRateWidget) {
            next = widgets.map((w, i) => i === clampedCursor ? { ...w, rateFormat: val as RateFormat } : w);
          } else if (activeCustomizeKey === 'format') {
            next = widgets.map((w, i) => i === clampedCursor ? { ...w, tokenFormat: val as TokenFormat } : w);
          } else {
            next = widgets.map((w, i) => i === clampedCursor ? { ...w, barStyle: val as BarStyle } : w);
          }
          setWidgets(next);
          onUpdate(next);
        }
        setLevel('customize');
      }
      if (key.escape) setLevel('customize');
      return;
    }
  });

  if (level === 'add') {
    return (
      <AddPicker
        activeWidgets={widgets}
        onAdd={(type) => {
          setWidgets(ws => {
            if (type === 'git') {
              const nameIdx = ws.findIndex(w => w.type === 'name');
              if (nameIdx !== -1) {
                const next = [...ws];
                next.splice(nameIdx + 1, 0, { type });
                return next;
              }
            }
            return [...ws, { type }];
          });
          setLevel('list');
        }}
        onEscape={() => setLevel('list')}
      />
    );
  }

  if (level === 'move') {
    return (
      <Box flexDirection="column">
        <Box marginTop={1} marginBottom={1}>
          <MovePreview widgets={movedWidgets} activeIndex={movePos} />
        </Box>
        <Box marginBottom={1}>
          <Text dimColor>Moving {widgets[clampedCursor]?.type} — use left/right to reposition</Text>
        </Box>
        <Box>
          <Text dimColor>[Enter] Confirm    [Esc] Cancel</Text>
        </Box>
      </Box>
    );
  }

  // live color preview while hovering color submenu
  const previewWidgets = (() => {
    if (level === 'sub' && activeAction === 'color') {
      return widgets.map((w, i) =>
        i === clampedCursor ? { ...w, color: (COLORS[subCursor]?.value ?? w.color) as PaletteColor } : w
      );
    }
    if (level === 'subsub' && activeCustomizeKey === 'format') {
      if (isRateWidget) {
        const val = RATE_FORMATS[subsubCursor]?.value;
        return widgets.map((w, i) =>
          i === clampedCursor && val ? { ...w, rateFormat: val as RateFormat } : w
        );
      }
      const val = TOKEN_FORMATS[subsubCursor]?.value;
      return widgets.map((w, i) =>
        i === clampedCursor && val ? { ...w, tokenFormat: val as TokenFormat } : w
      );
    }
    if (level === 'subsub' && activeCustomizeKey === 'barstyle') {
      const val = BAR_STYLES[subsubCursor]?.value;
      return widgets.map((w, i) =>
        i === clampedCursor && val ? { ...w, barStyle: val as BarStyle } : w
      );
    }
    return widgets;
  })();

  return (
    <Box flexDirection="column">
      <Box marginTop={1} marginBottom={1}>
        <Preview config={{ theme: 'custom', widgets: previewWidgets }} />
      </Box>

      <Box flexDirection="column">
        {widgets.map((w, i) => {
          const isSelected  = i === clampedCursor;
          const showActions = isSelected && (level === 'action' || level === 'sub' || level === 'customize' || level === 'subsub');
          return (
            <Box key={i} flexDirection="column">
              <Box>
                <Text dimColor={!isSelected} color={isSelected ? 'white' : undefined}>
                  {isSelected ? '> ' : '  '}
                </Text>
                <Text bold={isSelected} color={isSelected ? 'white' : undefined}>
                  {(
                    w.type === 'cli_version'   ? 'Version'       :
                    w.type === 'session_cost'  ? 'Session Cost'  :
                    w.type === 'session_clock' ? 'Session Clock' :
                    w.type.charAt(0).toUpperCase() + w.type.slice(1)
                  ).padEnd(14)}
                </Text>
                <Text dimColor>{WIDGET_DESC[w.type] ?? w.type}</Text>
              </Box>

              {showActions && (
                <Box flexDirection="column" marginLeft={4}>
                  {visibleActions.map((a, ai) => {
                    const isAct      = ai === actionCursor;
                    const showSub    = isAct && level === 'sub';
                    const showCustom = isAct && a.key === 'customize' && (level === 'customize' || level === 'subsub');
                    return (
                      <Box key={a.key} flexDirection="column">
                        <Box>
                          <Text color={isAct ? 'white' : undefined} dimColor={!isAct}>
                            {isAct ? '> ' : '  '}
                          </Text>
                          <Text color={isAct ? 'white' : undefined} dimColor={!isAct}>
                            {a.label}
                          </Text>
                        </Box>

                        {/* color / remove sub-items */}
                        {showSub && (
                          <Box flexDirection="column" marginLeft={4}>
                            {(activeAction === 'color' ? COLORS : CONFIRM).map((item, si) => {
                              const isSel = si === subCursor;
                              return (
                                <Box key={si}>
                                  <Text color={isSel ? 'white' : undefined} dimColor={!isSel}>
                                    {isSel ? '> ' : '  '}
                                  </Text>
                                  {'inkColor' in item && item.inkColor && <Text color={item.inkColor}>■ </Text>}
                                  <Text color={isSel ? 'white' : undefined} dimColor={!isSel}>
                                    {item.label}
                                  </Text>
                                </Box>
                              );
                            })}
                          </Box>
                        )}

                        {/* customize sub-items (format / progress type) */}
                        {showCustom && (
                          <Box flexDirection="column" marginLeft={4}>
                            {CUSTOMIZE_ITEMS.map((ci, cii) => {
                              const isSel    = cii === customizeCursor;
                              const showVals = isSel && level === 'subsub';
                              const vals     = subsubItems();
                              return (
                                <Box key={ci.key} flexDirection="column">
                                  <Box>
                                    <Text color={isSel ? 'white' : undefined} dimColor={!isSel}>
                                      {isSel ? '> ' : '  '}
                                    </Text>
                                    <Text color={isSel ? 'white' : undefined} dimColor={!isSel}>
                                      {ci.label}
                                    </Text>
                                  </Box>
                                  {showVals && (
                                    <Box flexDirection="column" marginLeft={4}>
                                      {vals.map((v, vi) => {
                                        const isV = vi === subsubCursor;
                                        return (
                                          <Box key={vi}>
                                            <Text color={isV ? 'white' : undefined} dimColor={!isV}>
                                              {isV ? '> ' : '  '}
                                            </Text>
                                            <Text color={isV ? 'white' : undefined} dimColor={!isV}>
                                              {v.label}
                                            </Text>
                                          </Box>
                                        );
                                      })}
                                    </Box>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          );
        })}

        <Box>
          <Text dimColor={!onAddRow} color={onAddRow ? 'white' : undefined}>
            {onAddRow ? '> ' : '  '}
          </Text>
          <Text dimColor={!onAddRow} color={onAddRow ? 'white' : undefined}>
            New widget +
          </Text>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>[Enter] Select    [Esc] Back</Text>
      </Box>
    </Box>
  );
}
