import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export function getOAuthToken(): string | null {
  if (process.env['CLAUDE_CODE_OAUTH_TOKEN']) {
    return process.env['CLAUDE_CODE_OAUTH_TOKEN'];
  }

  // Windows: %LOCALAPPDATA%\Claude Code\credentials.json
  const localAppData = process.env['LOCALAPPDATA'];
  if (localAppData) {
    try {
      const p = path.join(localAppData, 'Claude Code', 'credentials.json');
      const creds = JSON.parse(fs.readFileSync(p, 'utf8'));
      const token = creds?.claudeAiOauth?.accessToken;
      if (token && token !== 'null') return token;
    } catch { /* not found */ }
  }

  // Cross-platform: ~/.claude/.credentials.json
  const configDir = process.env['CLAUDE_CONFIG_DIR'] ?? path.join(os.homedir(), '.claude');
  try {
    const p = path.join(configDir, '.credentials.json');
    const creds = JSON.parse(fs.readFileSync(p, 'utf8'));
    const token = creds?.claudeAiOauth?.accessToken;
    if (token && token !== 'null') return token;
  } catch { /* not found */ }

  return null;
}
