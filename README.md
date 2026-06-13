# claude-code-line

Minimal, customizable statusline for [Claude Code](https://claude.ai/code) CLI.

## Install

**Option 1 — Pinned global install** (recommended, fastest render):
```bash
npm install -g claude-code-line
claude-code-line
```

**Option 2 — via npx** (no install needed, small delay per render):
```bash
npx claude-code-line
```

Inside the TUI, select **Save to Claude Code** and choose your preferred update style. It writes the command to `~/.claude/settings.json` automatically. Restart Claude Code to apply.

## Manual setup

Add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-code-line"
  }
}
```

Or for npx auto-update:

```json
{
  "statusLine": {
    "type": "command",
    "command": "npx -y claude-code-line@latest"
  }
}
```

## Themes

- **Default** — minimal neutral statusline: project name, git branch, model, context usage, effort, rate limits, and CLI version
- **Custom** — choose which widgets to show, reorder them, change colors, and customize display formats

## Widgets

| Widget | Shows |
|--------|-------|
| Name | Current project folder |
| Git | `@branch (+N -N)` diff stats |
| Model | Claude model name |
| Tokens | Context bar + token count (customizable format) |
| Effort | Reasoning effort level |
| 5h Rate | 5-hour usage + reset time (customizable format) |
| 7d Rate | 7-day usage + reset time (customizable format) |
| Extra | Extra usage credits |
| Version | Claude CLI version |
| Session Cost | Session cost in USD |
| Session Clock | Elapsed session time |

## Local development

Clone the repo and run directly from source:

```bash
git clone https://github.com/yasir-ali9/claude-code-line.git
cd claude-code-line
npm install
npm run build
node dist/index.js
```

To use your local build as the Claude Code statusline, add the absolute path manually to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "node /absolute/path/to/claude-code-line/dist/index.js"
  }
}
```

Restart Claude Code to apply.

To rebuild after changes:

```bash
npm run build
```

## Requirements

- Node.js >= 18
- Claude Code CLI
