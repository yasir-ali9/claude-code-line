# Claude Code Line

Minimal, customizable statusline for [Claude Code](https://claude.ai/code) CLI.

## Install

Run the TUI:

```bash
npx claude-code-line
```

Select **Save to Claude Code** — it writes the command to your settings and tells you to run `npm install -g claude-code-line` once for zero-delay rendering. Restart Claude Code to apply.

## Manual setup

To set it up without the TUI, add to `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "claude-code-line"
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
| Git | branch and diff stats |
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
