import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const CACHE_TTL = 3_600_000; // 1 hour
const cacheDir = path.join(os.tmpdir(), 'claude-code-line');
const cacheFile = path.join(cacheDir, 'cli-version');

export function getCliVersion(): string | null {
  try {
    const stat = fs.statSync(cacheFile);
    if (Date.now() - stat.mtimeMs < CACHE_TTL) {
      return fs.readFileSync(cacheFile, 'utf8').trim() || null;
    }
  } catch { /* cache miss */ }

  try {
    const out = execSync('claude --version', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
      windowsHide: true,
      timeout: 5000,
    }).trim();
    const version = out.split(/\s/)[0] ?? null;
    if (version) {
      try {
        fs.mkdirSync(cacheDir, { recursive: true });
        fs.writeFileSync(cacheFile, version, 'utf8');
      } catch { /* ignore */ }
      return version;
    }
  } catch { /* claude not found */ }

  return null;
}
