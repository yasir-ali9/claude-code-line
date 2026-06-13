import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import type { UsageData } from '../types.js';
import { getOAuthToken } from './token.js';

const CACHE_TTL = 60_000; // 60 seconds
const cacheDir = path.join(os.tmpdir(), 'claude-code-line');
const cacheFile = path.join(cacheDir, 'usage-cache.json');

function ensureDir() {
  try { fs.mkdirSync(cacheDir, { recursive: true }); } catch { /* exists */ }
}

function readCache(): { data: UsageData; mtime: number } | null {
  try {
    const stat = fs.statSync(cacheFile);
    const raw = fs.readFileSync(cacheFile, 'utf8');
    if (!raw.trim()) return null;
    return { data: JSON.parse(raw) as UsageData, mtime: stat.mtimeMs };
  } catch { return null; }
}

function writeCache(data: UsageData) {
  ensureDir();
  try { fs.writeFileSync(cacheFile, JSON.stringify(data), 'utf8'); } catch { /* ignore */ }
}

function fetchFromApi(): Promise<UsageData | null> {
  return new Promise((resolve) => {
    const token = getOAuthToken();
    if (!token) { resolve(null); return; }

    const req = https.request(
      'https://api.anthropic.com/api/oauth/usage',
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'anthropic-beta': 'oauth-2025-04-20',
          'User-Agent': 'claude-code/2.1.34',
        },
        timeout: 10_000,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
        res.on('end', () => {
          try {
            const raw = JSON.parse(body);
            if (!raw.five_hour) { resolve(null); return; }
            const data: UsageData = {
              fiveHourPct: raw.five_hour?.utilization ?? 0,
              fiveHourResetsAt: raw.five_hour?.resets_at ?? null,
              sevenDayPct: raw.seven_day?.utilization ?? 0,
              sevenDayResetsAt: raw.seven_day?.resets_at ?? null,
              extraEnabled: raw.extra_usage?.is_enabled === true,
              extraUsed: raw.extra_usage?.used_credits,
              extraLimit: raw.extra_usage?.monthly_limit,
              extraPct: raw.extra_usage?.utilization,
            };
            resolve(data);
          } catch { resolve(null); }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
    req.end();
  });
}

export function getUsageData(): UsageData | null {
  const cached = readCache();
  const now = Date.now();

  if (cached && now - cached.mtime < CACHE_TTL) {
    return cached.data;
  }

  // Touch to act as stampede lock
  ensureDir();
  try { fs.utimesSync(cacheFile, new Date(), new Date()); } catch {
    try { fs.writeFileSync(cacheFile, '', 'utf8'); } catch { /* ignore */ }
  }

  // Fire async fetch, write result to cache — piped mode doesn't wait
  fetchFromApi().then((data) => {
    if (data) {
      writeCache(data);
    } else {
      // Remove empty sentinel so next render retries
      try {
        if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size === 0) {
          fs.unlinkSync(cacheFile);
        }
      } catch { /* ignore */ }
    }
  }).catch(() => { /* ignore */ });

  // Return stale cache if available, otherwise null
  return cached?.data ?? null;
}
