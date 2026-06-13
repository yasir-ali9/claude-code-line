export {};

// Windows: ensure UTF-8 output
if (process.platform === 'win32') {
  try {
    const { execSync } = await import('child_process');
    execSync('chcp 65001', { stdio: 'ignore', windowsHide: true });
  } catch { /* ignore */ }
}

if (process.stdin.isTTY) {
  // Interactive TUI mode — load Ink/React lazily
  const { runTUI } = await import('./tui/index.js');
  runTUI();
} else {
  // Piped mode — render statusline from Claude Code's stdin JSON
  const { renderStatusLine } = await import('./renderer/index.js');
  const { getUsageData } = await import('./usage/cache.js');
  const { getCliVersion } = await import('./cli-version/cache.js');
  const { loadConfig } = await import('./config/index.js');
  const { getUpdateLine } = await import('./update/check.js');

  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk: string) => { raw += chunk; });
  process.stdin.on('end', () => {
    if (!raw.trim()) {
      process.stdout.write('Claude');
      process.exit(0);
    }

    try {
      const status = JSON.parse(raw);
      const config = loadConfig();
      const usageData = getUsageData();
      const cliVersion = getCliVersion();

      const ctx = { status, usageData, cliVersion };
      const widgets = config.theme === 'custom' ? config.widgets : undefined;
      const out = renderStatusLine(ctx, widgets);

      const updateLine = getUpdateLine();
      const full = updateLine ? `${out}\n${updateLine}` : out;

      // Replace spaces with non-breaking spaces to prevent terminal trimming
      process.stdout.write(full.replace(/ /g, ' '));
    } catch {
      process.stdout.write('Claude');
    }

    process.exit(0);
  });
}
