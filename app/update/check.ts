import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';

const CURRENT_VERSION = '1.1.0';
const NPM_REGISTRY_URL = 'https://registry.npmjs.org/claude-code-line/latest';
const CACHE_TTL = 86_400_000; // 24 hours
const cacheDir = path.join(os.tmpdir(), 'claude-code-line');
const cacheFile = path.join(cacheDir, 'version-cache.json');

function semverGt(a: string, b: string): boolean {
  const parse = (v: string) => v.replace(/^v/, '').split('.').map(Number);
  const [a1, a2, a3] = parse(a);
  const [b1, b2, b3] = parse(b);
  if ((a1 ?? 0) !== (b1 ?? 0)) return (a1 ?? 0) > (b1 ?? 0);
  if ((a2 ?? 0) !== (b2 ?? 0)) return (a2 ?? 0) > (b2 ?? 0);
  return (a3 ?? 0) > (b3 ?? 0);
}

function readCache(): { version: string; mtime: number } | null {
  try {
    const stat = fs.statSync(cacheFile);
    const raw = fs.readFileSync(cacheFile, 'utf8').trim();
    if (!raw) return null;
    return { version: raw, mtime: stat.mtimeMs };
  } catch { return null; }
}

function writeCache(version: string) {
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(cacheFile, version, 'utf8');
  } catch { /* ignore */ }
}

function fetchLatestVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const req = https.request(NPM_REGISTRY_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json', 'User-Agent': 'claude-code-line' },
      timeout: 5_000,
    }, (res) => {
      let body = '';
      res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve(data.version ?? null);
        } catch { resolve(null); }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

function toUpdateLine(version: string): string {
  return `Update available: v${version}  run: npm install -g claude-code-line`;
}

export async function getUpdateLine(): Promise<string | null> {
  const cached = readCache();
  const now = Date.now();

  if (cached && now - cached.mtime < CACHE_TTL) {
    return semverGt(cached.version, CURRENT_VERSION) ? toUpdateLine(cached.version) : null;
  }

  // Fetch fresh — await so piped mode gets the result before process.exit
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
  } catch { /* ignore */ }

  const latest = await fetchLatestVersion();
  if (latest) {
    writeCache(latest);
    return semverGt(latest, CURRENT_VERSION) ? toUpdateLine(latest) : null;
  }

  // Fallback to stale cache
  if (cached && semverGt(cached.version, CURRENT_VERSION)) {
    return toUpdateLine(cached.version);
  }
  return null;
}
