import { execSync } from 'child_process';
import type { RenderContext, PaletteColor } from '../../types.js';
import { WHITE, DIM, GREEN, RED, RESET, paletteToAnsi } from '../ansi.js';

function getGitBranch(cwd: string): string | null {
  try {
    const branch = execSync(`git -C "${cwd}" symbolic-ref --short HEAD`, {
      encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true, timeout: 3000,
    }).trim();
    return branch || null;
  } catch { return null; }
}

export function renderGit(ctx: RenderContext, color?: PaletteColor): string | null {
  const cwd = ctx.status.cwd;
  if (!cwd) return null;

  const branch = ctx.isPreview ? 'main' : getGitBranch(cwd);
  if (!branch) return null;

  const c = color ? paletteToAnsi(color) : DIM;
  let out = `${DIM}@${RESET}${c}${branch}${RESET}`;

  if (ctx.isPreview) {
    out += ` ${DIM}(${RESET}${GREEN}+3${RESET} ${RED}-1${RESET}${DIM})${RESET}`;
  } else {
    try {
      const numstat = execSync(`git -C "${cwd}" diff --numstat`, {
        encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'], windowsHide: true, timeout: 3000,
      }).trim();
      if (numstat) {
        let added = 0, deleted = 0;
        for (const line of numstat.split('\n')) {
          const m = line.match(/^(\d+)\s+(\d+)/);
          if (m) { added += parseInt(m[1]!); deleted += parseInt(m[2]!); }
        }
        if (added + deleted > 0) {
          out += ` ${DIM}(${RESET}${GREEN}+${added}${RESET} ${RED}-${deleted}${RESET}${DIM})${RESET}`;
        }
      }
    } catch { /* no diff stats */ }
  }

  return out;
}
